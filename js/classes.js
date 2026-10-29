// ===== Free-for-all classes =====
// Four classes, one built around each free-for-all gun, each with a secondary gun that suits it and a melee
// weapon. Pick one on the main menu or in the pause menu; during a match the new class starts when you respawn.
// Battle Royale (loot) and Squads keep their own weapons.
const CLASSES=[
 {n:'Assault',w:[1,4,24],c:'#f0b23c',d:'The all-rounder. Rifle for most fights, a quick Glock when the rifle runs dry, and a machete.',st:[3,3,3]},
 {n:'Breacher',w:[2,18,25],c:'#e5534b',d:'Up close and loud. Shotgun for corners and doorways, an SMG to chase people down, and a hatchet.',st:[1,5,2]},
 {n:'Marksman',w:[3,10,23],c:'#5ab8ff',d:'Long range. Sniper for picks across the map, a silent pistol up close, and a fast knife.',st:[5,2,2]},
 {n:'Gunslinger',w:[0,7,8],c:'#6cc04a',d:'Fast hands, fast feet. Pistol and six-shooter, a whip with long reach, and 8% faster running.',st:[2,3,5],spd:1.08}];
const CLS={sel:0,act:0};
try{const v=PROG&&PROG.cls;if(CLASSES[v])CLS.sel=CLS.act=v}catch(e){}
const clsOn=()=>gm===0&&!(typeof LOOT==='function'&&LOOT());
function clsLoadout(){return clsOn()?CLASSES[CLS.act].w:null}
function clsSpeed(){return clsOn()?(CLASSES[CLS.act].spd||1):1}
function clsSet(i){if(!CLASSES[i])return;CLS.sel=i;if(PROG){PROG.cls=i;progSave()}
 const live=go&&!me.out&&me.hp>0&&!(me.dwait>0)&&clsOn();
 if(!live){CLS.act=i;try{loadoutSync(1)}catch(e){}}else if(CLS.act!==i)status(CLASSES[i].n+' selected. You switch to it when you respawn.');
 clsUI()}
// new class takes over when you respawn
{const r0=respawn;respawn=function(){if(CLS.act!==CLS.sel){CLS.act=CLS.sel;const o=r0.apply(this,arguments);try{loadoutSync(1)}catch(e){}return o}return r0.apply(this,arguments)}}
// ---------- picker ----------
{const b=document.createElement('div');b.id='clsbox';b.innerHTML='<div class="cbx"><h3>Choose your class</h3><p class="fine">Free-for-all only. During a match your new class starts when you respawn.</p><div id="clsl"></div><div class="row" style="justify-content:center;margin-top:12px"><button id="clsx" class="alt">Close</button></div></div>';document.body.appendChild(b);
 b.onclick=e=>{if(e.target===b)clsClose()};$('clsx').onclick=clsClose}
const SLOTN=['Primary','Secondary','Melee'],STN=['Range','Close up','Mobility'];
function clsOpen(){const L=$('clsl');L.innerHTML=CLASSES.map((c,i)=>'<button class="clc'+(i===CLS.sel?' on':'')+'" data-i="'+i+'" style="--cc:'+c.c+'"><b>'+c.n+'</b>'+
  c.w.map((w,k)=>'<span><small>'+SLOTN[k]+'</small>'+WP[w].n+'</span>').join('')+
  '<div class="cst">'+c.st.map((v,k)=>'<div><small>'+STN[k]+'</small><i><u style="width:'+v*20+'%"></u></i></div>').join('')+'</div><p>'+c.d+'</p></button>').join('');
 L.querySelectorAll('.clc').forEach(x=>x.onclick=()=>{clsSet(+x.dataset.i);if(typeof sfx==='function')sfx('click',{vol:.3});clsClose()});
 $('clsbox').style.display='flex'}
function clsClose(){$('clsbox').style.display='none'}
addEventListener('keydown',e=>{if($('clsbox').style.display==='flex'&&e.code==='Escape')clsClose()});
function clsUI(){const t='Class: '+CLASSES[CLS.sel].n;['clsb1','clsb2'].forEach(id=>{const b=$(id);if(b)b.innerHTML='<span>&#9881;</span> '+t})}
{const add=(id,after,cls)=>{const a=$(after);if(!a)return;const b=document.createElement('button');b.id=id;b.className=cls||'alt';a.parentNode.insertBefore(b,a.nextSibling);b.onclick=clsOpen};
 add('clsb1','chs1');add('clsb2','chs2');
 const r0=renderLobby;renderLobby=function(){const o=r0.apply(this,arguments);try{const b=$('clsb2');if(b)b.style.display=gm===0?'':'none'}catch(e){}return o}}
clsUI();
// the death screen reminds you which class you'll come back as
{const d0=deathWait;deathWait=function(){const o=d0.apply(this,arguments);try{if(clsOn()){const s=$('dscr').querySelector('small');if(s)s.textContent='Respawning as '+CLASSES[CLS.sel].n+' · Esc to change class'}}catch(e){}return o}}
// ---------- pick your class at the start of every free-for-all round ----------
// A panel shows the four classes for 10 seconds: press 1-4 (or tap a card on a touch screen) and you switch
// straight away with full ammo. Enter or waiting keeps your current class.
const CPK={open:false,t0:0,last:0,tm:0};
{const d=document.createElement('div');d.id='clspick';document.body.appendChild(d)}
function clsApply(i){if(!CLASSES[i])return;CLS.sel=CLS.act=i;if(PROG){PROG.cls=i;progSave()}me.ammo=WP.map(w=>w.mag);me.rl=0;me.rw=-1;try{loadoutSync(1);setW(CLASSES[i].w[0])}catch(e){}clsUI();if(typeof sfx==='function')sfx('ready',{vol:.4})}
function clsPickOpen(){if(!go||gm!==0||ending||(typeof BOTS!=='undefined'&&BOTS.camp)||(typeof LOOT==='function'&&LOOT()))return;
 const now=performance.now();if(CPK.open||now-CPK.last<3000)return;CPK.open=true;CPK.t0=now;CPK.last=now;const touch=document.body.classList.contains('touch');
 const d=$('clspick');d.innerHTML='<h3>Choose your class</h3><small>'+(touch?'Tap a class':'Press <b>1</b>-<b>4</b> to pick, <b>Enter</b> to keep yours')+'</small><div class="cpl">'+
  CLASSES.map((c,i)=>'<div class="cpc'+(i===CLS.sel?' on':'')+'" data-i="'+i+'" style="--cc:'+c.c+'">'+(touch?'':'<em>'+(i+1)+'</em>')+'<b>'+c.n+'</b><span>'+c.w.map(w=>WP[w].n).join(' · ')+'</span></div>').join('')+'</div><div class="cpt"><i></i></div>';
 d.querySelectorAll('.cpc').forEach(x=>{const f=e=>{e.preventDefault();e.stopPropagation();clsPickDone(+x.dataset.i)};x.addEventListener('touchstart',f,{passive:false});x.addEventListener('click',f)});
 d.classList.add('on');clearInterval(CPK.tm);CPK.tm=setInterval(()=>{const f=(performance.now()-CPK.t0)/10000;const b=d.querySelector('.cpt i');if(b)b.style.width=Math.max(0,100-f*100)+'%';if(f>=1||!go||ending||gm!==0)clsPickDone(-1)},100)}
function clsPickDone(i){if(!CPK.open)return;CPK.open=false;clearInterval(CPK.tm);$('clspick').classList.remove('on');if(i>=0&&go&&gm===0)clsApply(i)}
addEventListener('keydown',e=>{if(!CPK.open)return;const m=/^(Digit|Numpad)([1-4])$/.exec(e.code);if(m){e.preventDefault();e.stopImmediatePropagation();clsPickDone(+m[2]-1);return}
 if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();e.stopImmediatePropagation();clsPickDone(-1)}},true);
// every new round, and when you first drop into a free-for-all match
{const n0=doNew;doNew=function(){const o=n0.apply(this,arguments);setTimeout(clsPickOpen,150);return o}}
{let was=0;setInterval(()=>{const now=!!go&&gm===0;if(now&&!was)setTimeout(clsPickOpen,300);if(!go&&CPK.open)clsPickDone(-1);was=now},250)}
