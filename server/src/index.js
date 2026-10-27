// Cuzzo io server (Cloudflare Worker + one Durable Object)
//
//   GET  /             short-lived TURN login for the relay (same as before)
//   GET  /rooms        list of open rooms (public rooms include their code; private ones don't)
//   POST /rooms        a host adds or updates its room (every ~30 s while the lobby is open)
//   POST /rooms/close  a host removes its room
//
// Settings on the Worker (Settings > Variables and Secrets):
//   TURN_KEY_ID (Text), TURN_KEY_API_TOKEN (Secret), ALLOWED_ORIGINS (Text, comma separated sites)

const TURN_TTL = 4 * 60 * 60;
const ROOM_EXPIRE_MS = 75 * 1000;     // a room disappears if its host stops checking in for 75 s
const MAX_ROOMS = 500, MAX_ROOMS_PER_IP = 3, MAX_PLAYERS = 8;
const CODE_RE = /^[A-HJ-NP-Z2-9]{4}$/;  // the game's 4-letter codes (no I, O, 0 or 1)

const cors = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});
const json = (data, origin, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...cors(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// simple per-IP limiter (per Worker instance, best effort)
const hits = new Map();
function limited(key, perMinute) {
  const now = Date.now(), list = (hits.get(key) || []).filter(t => now - t < 60000);
  list.push(now); hits.set(key, list); if (hits.size > 20000) hits.clear();
  return list.length > perMinute;
}

// the room list is cached for a few seconds inside each Worker instance, so lots of players
// browsing at once doesn't turn into lots of Durable Object requests
let listCache = null, listCacheT = 0;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
    if (!allowed.includes(origin)) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    const url = new URL(request.url), path = url.pathname.replace(/\/+$/, '') || '/';
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (path === '/' && request.method === 'GET') return turn(env, origin, ip);

    if (path === '/rooms' && request.method === 'GET') {
      if (limited('l' + ip, 40)) return json({ error: 'slow down' }, origin, 429);
      if (listCache && Date.now() - listCacheT < 4000) return json(listCache, origin);
      const r = await lobby(env).fetch('https://lobby/list');
      listCache = await r.json(); listCacheT = Date.now();
      return json(listCache, origin);
    }

    if ((path === '/rooms' || path === '/rooms/close') && request.method === 'POST') {
      if (limited('h' + ip, 30)) return json({ error: 'slow down' }, origin, 429);
      const body = await request.text();
      if (body.length > 2000) return json({ error: 'too big' }, origin, 413);
      const r = await lobby(env).fetch('https://lobby' + (path === '/rooms' ? '/host' : '/close'), {
        method: 'POST', body, headers: { 'X-IP': ip },
      });
      listCache = null;
      return json(await r.json(), origin, r.status);
    }

    return json({ error: 'not found' }, origin, 404);
  },
};

const lobby = env => env.LOBBY.get(env.LOBBY.idFromName('main'));

async function turn(env, origin, ip) {
  if (limited('t' + ip, 10)) return new Response('Too many requests', { status: 429, headers: cors(origin) });
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
    return new Response('Worker is missing TURN_KEY_ID or TURN_KEY_API_TOKEN', { status: 500, headers: cors(origin) });
  }
  const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl: TURN_TTL }),
  });
  if (!r.ok) return new Response('TURN service error ' + r.status, { status: 502, headers: cors(origin) });
  const data = await r.json();
  // browsers can't use port 53, so drop those addresses to avoid slow timeouts
  const iceServers = (data.iceServers ? [].concat(data.iceServers) : []).map(s => {
    const urls = [].concat(s.urls || []).filter(u => !/:53(\?|$)/.test(u));
    return { ...s, urls };
  }).filter(s => s.urls.length);
  return json({ iceServers, ttl: TURN_TTL }, origin);
}

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);

// One Durable Object holds every open room in memory. Rooms only live as long as their host keeps
// checking in, so nothing needs to be saved to disk.
export class Lobby {
  constructor(state, env) { this.rooms = new Map(); }

  prune() {
    const now = Date.now();
    for (const [code, r] of this.rooms) if (now - r.seen > ROOM_EXPIRE_MS) this.rooms.delete(code);
  }

  async fetch(request) {
    const url = new URL(request.url);
    this.prune();

    if (url.pathname === '/list') {
      const rooms = [...this.rooms.values()]
        .sort((a, b) => (a.priv - b.priv) || (a.started - b.started) || (b.players - a.players))
        .slice(0, 100)
        .map(r => ({ code: r.priv ? null : r.code, name: r.name, mode: r.mode, map: r.map,
                     players: r.players, max: MAX_PLAYERS, priv: r.priv, started: r.started }));
      return Response.json({ rooms });
    }

    let b; try { b = JSON.parse(await request.text()); } catch (e) { return Response.json({ error: 'bad json' }, { status: 400 }); }
    const code = String(b.code || '').toUpperCase();
    if (!CODE_RE.test(code)) return Response.json({ error: 'bad code' }, { status: 400 });
    const old = this.rooms.get(code);

    if (url.pathname === '/close') {
      if (old && old.token === b.token) this.rooms.delete(code);
      return Response.json({ ok: true });
    }

    // /host: add or update a room. Only the host that created it (it holds the token) can change it.
    const ip = request.headers.get('X-IP') || '';
    let token = b.token;
    if (old) {
      if (old.token !== token) return Response.json({ error: 'that code is taken' }, { status: 409 });
    } else {
      if (this.rooms.size >= MAX_ROOMS) return Response.json({ error: 'too many rooms right now' }, { status: 503 });
      let mine = 0; for (const r of this.rooms.values()) if (r.ip === ip) mine++;
      if (mine >= MAX_ROOMS_PER_IP) return Response.json({ error: 'too many rooms from you' }, { status: 429 });
      // a host whose room was dropped (server restart) can keep its old token
      if (typeof token !== 'string' || !/^[0-9a-f-]{36}$/.test(token)) token = crypto.randomUUID();
    }
    const mode = [0, 1, 2].includes(b.mode) ? b.mode : 0;
    this.rooms.set(code, {
      code, token, ip, seen: Date.now(),
      name: clean(b.name, 24) || 'Room', map: clean(b.map, 28), mode,
      players: Math.max(1, Math.min(MAX_PLAYERS, b.players | 0)), priv: !!b.priv, started: !!b.started,
    });
    return Response.json({ ok: true, token });
  }
}
