// Cuzzo io TURN credential Worker (Cloudflare Workers)
// Hands each player a short-lived TURN login. Your real TURN API token stays here, never in the game files.
//
// Settings > Variables and Secrets on the Worker:
//   TURN_KEY_ID         (Text)    the TURN key ID from Cloudflare Realtime
//   TURN_KEY_API_TOKEN  (Secret)  the API token shown when you created the TURN key
//   ALLOWED_ORIGINS     (Text)    your game's site(s), comma separated, e.g. https://yourname.github.io
//                                 (just the scheme + domain, no path and no trailing slash)

const TTL_SECONDS = 4 * 60 * 60;   // each login works for 4 hours
const MAX_PER_MINUTE = 10;         // per IP address, per Worker instance (best effort)
const hits = new Map();

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_MINUTE;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);

    // only answer pages on your own site
    if (!allowed.includes(origin)) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: cors(origin) });

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (tooMany(ip)) return new Response('Too many requests', { status: 429, headers: cors(origin) });

    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
      return new Response('Worker is missing TURN_KEY_ID or TURN_KEY_API_TOKEN', { status: 500, headers: cors(origin) });
    }

    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL_SECONDS }),
      }
    );
    if (!r.ok) return new Response('TURN service error ' + r.status, { status: 502, headers: cors(origin) });

    const data = await r.json();
    // browsers can't use port 53, so drop those addresses to avoid slow timeouts
    const iceServers = (data.iceServers ? [].concat(data.iceServers) : []).map(s => {
      const urls = [].concat(s.urls || []).filter(u => !/:53(\?|$)/.test(u));
      return { ...s, urls };
    }).filter(s => s.urls.length);

    return new Response(JSON.stringify({ iceServers, ttl: TTL_SECONDS }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};
