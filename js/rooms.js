// ===== Room list: public and private rooms (uses the server in /server, see SERVER_SETUP.md) =====
// Hosts check in every ~30 s (sooner when something changes) so their room shows in everyone's list.
// Public rooms show their code and a Join button. Private rooms show with a lock and no code:
// you need the code from the host to get in.
(function(){
const base=String(window.ROOM_SERVER_URL||window.TURN_WORKER_URL||'').trim().replace(/\/+$/,'');
if(!base)return;// no server set up: the game works exactly as before (codes only)
const MODES=['Free-for-all','Battle Royale','Squads'];
const post=(path,data)=>fetch(base+path,{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'text/plain'},keepalive:true}).then(r=>r.json().catch(()=>({})).then(j=>({ok:r.ok,status:r.status,j})));

// ---------- host side ----------
let priv=false;try{priv=localStorage.getItem('cf_priv')==='1'}catch(e){}
window.roomPrivNow=()=>priv;
const H={code:null,token:null,sig:'',t:0,busy:false,err:''};
const myCode=()=>{const c=($('big').textContent||'').trim();return /^[A-HJ-NP-Z2-9]{4}$/.test(c)?c:null};
const hosting=()=>isHost&&!practice&&!!room&&!!myCode();
function info(){return{code:myCode(),token:H.token,name:(me.name||'Player')+"'s room",mode:gm,map:MAPS[mapIdx].n,
 players:roster().length,priv,started:!!go}}
function closeRoom(){if(!H.code)return;const b={code:H.code,token:H.token};H.code=null;H.token=null;H.sig='';
 try{navigator.sendBeacon(base+'/rooms/close',new Blob([JSON.stringify(b)],{type:'text/plain'}))}catch(e){post('/rooms/close',b).catch(()=>{})}}
function hostTick(){
 if(!hosting()){if(H.code||H.wasHosting){H.wasHosting=false;try{priv=localStorage.getItem('cf_priv')==='1'}catch(e){}}closeRoom();return}
 H.wasHosting=true;
 const d=info();if(H.code&&H.code!==d.code)closeRoom();
 const sig=JSON.stringify([d.name,d.mode,d.map,d.players,d.priv,d.started]),now=Date.now();
 if(H.busy||(sig===H.sig&&now-H.t<30000)||(sig!==H.sig&&now-H.t<4000))return;
 H.busy=true;H.t=now;d.token=H.code===d.code?H.token:null;
 post('/rooms',d).then(r=>{if(r.ok){H.code=d.code;H.token=r.j.token;H.sig=sig;H.err=''}else{H.err=r.j.error||('error '+r.status);H.sig=''}privUI()})
  .catch(()=>{H.err='room list unreachable';privUI()}).finally(()=>{H.busy=false})}
setInterval(hostTick,1500);
addEventListener('pagehide',closeRoom);

function privUI(){const row=$('privrow');if(!row)return;const on=isHost&&!practice&&!!room;row.style.display=on?'':'none';if(!on)return;
 $('rpub').className=priv?'alt':'alt sel';$('rpriv').className=priv?'alt sel':'alt';
 $('privh').textContent=(priv?'Private: your room shows in the room list with a lock. Players need your code to join.':'Public: your room shows in the room list and anyone can join.')+(H.err?' (Room list: '+H.err+')':'')}
const setPriv=(v,noSave)=>{priv=v;if(!noSave)try{localStorage.setItem('cf_priv',v?'1':'0')}catch(e){}H.t=0;privUI();hostTick()};window.roomSetPriv=setPriv;
$('rpub').onclick=()=>setPriv(false);$('rpriv').onclick=()=>setPriv(true);
setInterval(privUI,1000);

// ---------- room list ----------
const wrap=$('rbwrap'),list=$('rooms'),st=$('rbst');wrap.style.display='';
let lastLoad=0,loading=false,lastRooms=null;
// for Play now: the current room list (reuses the list on screen if it's under 10 s old, so the click stays instant)
window.roomsNow=function(timeout){if(lastRooms&&Date.now()-lastRooms.t<10000)return Promise.resolve(lastRooms.rooms);
 const ac2=new AbortController(),t=setTimeout(()=>ac2.abort(),timeout||2500);
 return fetch(base+'/rooms',{cache:'no-store',signal:ac2.signal}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(j=>{clearTimeout(t);const rs=(j&&j.rooms)||[];lastRooms={t:Date.now(),rooms:rs};return rs})};
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function render(rooms){list.textContent='';
 if(!rooms.length){list.appendChild(el('div','rbempty','No rooms open right now. Host one!'));return}
 rooms.forEach(r=>{const row=el('div','rb'+(r.priv?' priv':'')+(r.players>=r.max?' full':''));
  row.appendChild(el('span','rbi',r.priv?'\u{1F512}':'\u{1F310}'));
  const mid=el('div','rbm');mid.appendChild(el('b',null,(()=>{const n=String(r.name||'Room').slice(0,24);return hasBadWords(n)?'Room':n})()));mid.appendChild(el('small',null,MODES[r.mode]+' · '+(r.map||'?')+' · '+(r.started?'in a match':'in the lobby')));row.appendChild(mid);
  row.appendChild(el('span','rbp',r.players+'/'+r.max));
  const b=el('button',r.priv?'alt':'',r.players>=r.max?'Full':r.priv?'Code':'Join');b.disabled=r.players>=r.max;
  b.onclick=()=>{if(r.priv||!r.code){$('code').value='';$('code').focus();status('\u{1F512} '+r.name+' is private. Type the 4-letter code the host gave you, then press Join.');return}
   $('code').value=r.code;$('join').onclick()};
  row.appendChild(b);list.appendChild(row)})}
function load(force){const now=Date.now();if(loading||(!force&&now-lastLoad<10000))return;loading=true;lastLoad=now;
 fetch(base+'/rooms',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(j=>{const rs=(j&&j.rooms)||[];lastRooms={t:Date.now(),rooms:rs};
  st.textContent=rs.length?'· '+rs.filter(r=>!r.priv).length+' public, '+rs.filter(r=>r.priv).length+' private':'';render(rs)})
  .catch(()=>{st.textContent='· can\'t reach the room list right now';list.textContent=''}).finally(()=>{loading=false})}
// refresh every 10 s while the main menu is showing (and the tab is visible)
setInterval(()=>{if(cur==='main'&&$('menu').style.display!=='none'&&!document.hidden&&!room)load()},1000);
const _step=step;step=function(n){_step(n);if(n==='main')load(true)};
load(true);
})();
