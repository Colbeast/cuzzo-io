// ===== Touch controls for phones and tablets =====
// Left half of the screen: a joystick appears wherever your thumb lands (push it all the way forward to sprint).
// Right half: drag to look around. Buttons on the right for fire (you can also drag on it to aim while shooting),
// aim, jump, crouch, reload, use, swap weapon and powerups; tap a weapon slot to switch to it.
// The game itself only plays while the mouse is "locked", so on touch devices the lock is emulated: playing = locked.
(function(){
if(!TOUCHDEV)return;
const body=document.body,cv=ren.domElement;body.classList.add('touch');
BIND=Object.assign({},DEF);// phones use the default bindings, so every button below maps to a known key

// ---- emulated pointer lock ----
let TL=false;
const plc=()=>document.dispatchEvent(new Event('pointerlockchange'));
Object.defineProperty(document,'pointerLockElement',{configurable:true,get:()=>TL?cv:null});
cv.requestPointerLock=function(){if(!TL){TL=true;body.classList.add('playing');goFull();setTimeout(plc,0)}return Promise.resolve()};
document.exitPointerLock=function(){if(TL){TL=false;body.classList.remove('playing');releaseAll();setTimeout(plc,0)}};
function goFull(){const d=document.documentElement;try{if(!document.fullscreenElement&&d.requestFullscreen){const p=d.requestFullscreen({navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}}catch(e){}}

// ---- labels: prompts say USE / BAG instead of keyboard keys ----
Object.assign(NICE,{KeyE:'USE',Tab:'BAG',KeyG:'DROP',KeyQ:'POWER',KeyF:'SWITCH',KeyM:'MAP',KeyR:'RELOAD',KeyX:'AXE',Space:'JUMP',Mouse0:'FIRE',Mouse2:'AIM',KeyW:'the joystick',KeyA:'​',KeyS:'​',KeyD:'​'});
const cp=$('clickplay');if(cp)cp.querySelector('span').textContent='Tap anywhere to play';
updateKeys=function(){const e=$('keys');if(e)e.innerHTML='Left thumb: move (push all the way up to sprint) &middot; Right thumb: look around &middot; FIRE shoots (drag on it to aim at the same time) &middot; AIM zooms in &middot; tap a weapon slot to switch &middot; USE opens doors, chests and cars &middot; &#10074;&#10074; pauses. Play in landscape.'};
updateKeys();

// ---- key emulation ----
const isMouse=c=>/^(Mouse|Wheel)/.test(c);
function kd(a){const c=BIND[a];if(!c)return;k[c]=true;if(isMouse(c))press(c);else dispatchEvent(new KeyboardEvent('keydown',{code:c,key:c,bubbles:true,cancelable:true}))}
function ku(a){const c=BIND[a];if(!c)return;k[c]=false;if(isMouse(c))release(c);else dispatchEvent(new KeyboardEvent('keyup',{code:c,key:c,bubbles:true,cancelable:true}))}
const tap=a=>{kd(a);setTimeout(()=>ku(a),60)};

// ---- overlay ----
const tc=document.createElement('div');tc.id='tc';
const B=(a,label,cls)=>'<div class="tb '+(cls||'')+'" data-a="'+a+'"><span>'+label+'</span></div>';
tc.innerHTML='<div id="tjoy"><i></i></div>'+
 B('fire','FIRE','big')+B('aim','AIM','tog')+B('jump','JUMP')+B('crouch','CROUCH','tog')+B('reload','RELOAD','sm')+B('wnext','SWAP','sm')+B('use','USE')+
 B('power','POWER','sm')+B('inv','BAG','sm loot')+B('drop','DROP','sm loot')+
 '<div class="tb top" data-a="pause"><span>&#10074;&#10074;</span></div><div class="tb top" data-a="map"><span>MAP</span></div>';
cv.after(tc);
const rot=document.createElement('div');rot.id='rot';rot.innerHTML='<div><b>&#8635;</b>Turn your device sideways to play</div>';body.appendChild(rot);
const btn=a=>tc.querySelector('[data-a="'+a+'"]'),joy=$('tjoy'),knob=joy.firstChild;

// ---- touch sensitivity setting ----
let TS=1;try{TS=+localStorage.getItem('cf_tsens')||1}catch(e){}
{const g=document.querySelector('#ctb .cg');if(g){const r=document.createElement('div');r.className='sr';r.innerHTML='<span>Touch look sensitivity</span><input type="range" id="sn-touch" min="0.2" max="3" step="0.05"><b id="sv-touch"></b>';g.after(r);
 const i=$('sn-touch'),v=$('sv-touch');i.value=TS;v.textContent=TS.toFixed(2);i.oninput=()=>{TS=+i.value;v.textContent=TS.toFixed(2);try{localStorage.setItem('cf_tsens',TS)}catch(e){}}}}

{const i=$('sn-look');if(i&&i.closest('.sr'))i.closest('.sr').style.display='none';document.querySelectorAll('#ctb .cg').forEach(e=>{if(/^Controls$/i.test(e.textContent.trim()))e.style.display='none'})}

// ---- state ----
const T={};// active touches: id -> {kind:'joy'|'look'|'btn', ...}
let jx=0,jy=0,aimOn=false,crOn=false;
function setMove(x,y){jx=x;jy=y;const m=Math.hypot(x,y),dz=.28;
 k[BIND.fwd]=m>dz&&y<-.38;k[BIND.back]=m>dz&&y>.38;k[BIND.left]=m>dz&&x<-.38;k[BIND.right]=m>dz&&x>.38;
 k[BIND.sprint]=m>.92&&y<-.7;joy.classList.toggle('run',!!k[BIND.sprint])}
function setTog(a,on){const c=BIND[a];if(on)kd(a);else ku(a);btn(a).classList.toggle('on',on);if(c)k[c]=on}
function releaseAll(){for(const id in T)delete T[id];setMove(0,0);joy.style.display='none';
 if(aimOn){aimOn=false;setTog('aim',false)}if(crOn){crOn=false;setTog('crouch',false)}
 tc.querySelectorAll('.tb.dn').forEach(e=>e.classList.remove('dn'));for(const c in k)k[c]=false;down=false}
function look(dx,dy){const s=.004*TS*(me.zoom?(cam.fov/75)*(me.w===3?SENS.scope:SENS.ads):1);
 me.yaw-=dx*s;me.pitch=Math.max(-1.5,Math.min(1.5,me.pitch-dy*s))}
const JR=()=>Math.max(44,Math.min(innerWidth,innerHeight)*.16);

function bdown(a,el){
 if(a==='pause'){document.exitPointerLock();return}
 if(me.out&&typeof ELIM==='function'&&ELIM()&&(a==='fire'||a==='aim')){tap(a);return}
 if(a==='aim'){aimOn=!aimOn;setTog('aim',aimOn);return}
 if(a==='crouch'){crOn=!crOn;setTog('crouch',crOn);return}
 if(a==='map'||a==='inv'||a==='wnext'||a==='power'||a==='drop'||a==='reload'){tap(a);return}
 kd(a)}
function bup(a){if(a==='fire'||a==='jump'||a==='use')ku(a)}

tc.addEventListener('touchstart',e=>{e.preventDefault();if(!TL)return;
 for(const t of e.changedTouches){const el=t.target.closest&&t.target.closest('.tb');
  if(el){const a=el.dataset.a;el.classList.add('dn');T[t.identifier]={kind:'btn',a,el,x:t.clientX,y:t.clientY,look:a==='fire'};bdown(a,el);continue}
  if(t.clientX<innerWidth*.42&&!Object.values(T).some(q=>q.kind==='joy')){T[t.identifier]={kind:'joy',ox:t.clientX,oy:t.clientY};
   const r=JR();joy.style.display='block';joy.style.width=joy.style.height=2*r+'px';joy.style.left=t.clientX-r+'px';joy.style.top=t.clientY-r+'px';knob.style.transform='translate(-50%,-50%)';continue}
  T[t.identifier]={kind:'look',x:t.clientX,y:t.clientY}}},{passive:false});
tc.addEventListener('touchmove',e=>{e.preventDefault();if(!TL)return;
 for(const t of e.changedTouches){const q=T[t.identifier];if(!q)continue;
  if(q.kind==='joy'){const r=JR();let dx=(t.clientX-q.ox)/r,dy=(t.clientY-q.oy)/r;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
   knob.style.transform='translate(calc(-50% + '+dx*r+'px),calc(-50% + '+dy*r+'px))';setMove(dx,dy)}
  else if(q.kind==='look'||(q.kind==='btn'&&q.look)){look(t.clientX-q.x,t.clientY-q.y);q.x=t.clientX;q.y=t.clientY}}},{passive:false});
const tend=e=>{e.preventDefault();for(const t of e.changedTouches){const q=T[t.identifier];if(!q)continue;delete T[t.identifier];
 if(q.kind==='joy'){setMove(0,0);joy.style.display='none'}else if(q.kind==='btn'){q.el.classList.remove('dn');bup(q.a)}}};
tc.addEventListener('touchend',tend,{passive:false});tc.addEventListener('touchcancel',tend,{passive:false});

// ---- tappable HUD: weapon slots, Battle Royale slots, the on-screen prompt and the powerup panel ----
const hudTap=(el,f)=>{if(!el)return;el.addEventListener('touchstart',e=>{if(!TL)return;e.preventDefault();e.stopPropagation();f(e)},{passive:false})};
hudTap($('wl'),e=>{const d=e.target.closest('#wl>div');if(!d)return;const j=[...$('wl').children].indexOf(d);if(j>=0)slotW(j)});
hudTap($('prompt'),()=>tap('use'));
hudTap($('pu'),()=>tap('cycle'));
const lbar=()=>$('lbar');let lbHooked=false;
function hookLbar(){const l=lbar();if(!l||lbHooked)return;lbHooked=true;hudTap($('lprompt'),()=>tap('use'));hudTap(l,e=>{const d=e.target.closest('#lbar>div');if(!d)return;const j=[...l.children].indexOf(d);if(typeof lootSel==='function')lootSel(j-1)})}
{const h=document.querySelector('#linv .hint');if(h)h.textContent='Tap an item to see its stats, then Drop selected to drop it.'}

// ---- per frame: show the right buttons for what you're doing ----
let lastSig='';
(function upd(){requestAnimationFrame(upd);hookLbar();
 const on=TL&&!!go,loot=typeof LOOT==='function'&&LOOT(),spec=me.out&&typeof ELIM==='function'&&ELIM(),veh=!!(me.car||me.bus||me.glide);
 const sig=[on,loot,spec,veh].join();if(sig===lastSig)return;lastSig=sig;
 tc.style.display=on?'block':'none';tc.classList.toggle('loot',!!loot);tc.classList.toggle('spec',!!spec);tc.classList.toggle('veh',veh);
 btn('fire').querySelector('span').textContent=spec?'NEXT':'FIRE';btn('aim').querySelector('span').textContent=spec?'PREV':'AIM';
 if(!on)releaseAll()})();

// no pinch-zoom / double-tap zoom / long-press menus while playing
['gesturestart','gesturechange','dblclick'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(TL)e.preventDefault()},{passive:false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&TL)document.exitPointerLock()});
})();
