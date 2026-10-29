// ===== Progression: XP, levels, unlockable skins, daily challenges =====
// Everything is saved in this browser (localStorage key "cuzzo_save"). On CrazyGames, when the player is
// logged in, the same save is also kept with CrazyGames' data module so it follows them to other devices.
// Your name and outfit are remembered too.
const PSAVE='cuzzo_save';
const LVMAX=50,xpNeed=l=>500+(l-1)*175;// XP needed to go from level l to l+1
// skins: level needed (0 = from the start). Campaign rewards can unlock some early (see js/campaign.js).
const SKREQ={0:0,1:0,9:0,15:0,11:2,2:3,12:4,4:5,8:6,3:8,13:10,5:12,10:14,14:16,7:18,6:20};
const CHPOOL=[
 {k:'kills',n:15,t:'Get 15 eliminations',xp:250},{k:'kills',n:30,t:'Get 30 eliminations',xp:400},
 {k:'hs',n:5,t:'Get 5 headshot eliminations',xp:280},{k:'win',n:1,t:'Win a match',xp:350},
 {k:'multi',n:1,t:'Get a double kill',xp:200},{k:'streak',n:1,t:'Get a 5-elimination streak',xp:300},
 {k:'matches',n:3,t:'Finish 3 matches',xp:250},{k:'mission',n:2,t:'Complete 2 campaign missions',xp:300},
 {k:'sniper',n:3,t:'Get 3 eliminations with the Sniper',xp:280},{k:'shotgun',n:5,t:'Get 5 eliminations with the Shotgun',xp:280},
 {k:'pistol',n:5,t:'Get 5 eliminations with the Pistol',xp:280},{k:'stars',n:3,t:'Earn 3 campaign stars',xp:280}];
let PROG=null;
function progDefault(){return{v:1,xp:0,lvl:1,name:'',sk:0,tot:{kills:0,hs:0,deaths:0,wins:0,matches:0,missions:0,best:0},unl:{},ch:null,camp:{},at:0}}
function progLoad(){let s=null;try{s=JSON.parse(localStorage.getItem(PSAVE)||'null')}catch(e){}PROG=Object.assign(progDefault(),s||{});PROG.tot=Object.assign(progDefault().tot,PROG.tot||{});PROG.unl=PROG.unl||{};PROG.camp=PROG.camp||{};progDaily()}
let progT=0;
function progSave(now){PROG.at=Date.now();const j=JSON.stringify(PROG);try{localStorage.setItem(PSAVE,j)}catch(e){}
 clearTimeout(progT);const cloud=()=>{try{if(typeof CG!=='undefined'&&CG.on&&CG.sdk&&CG.sdk.data)CG.sdk.data.setItem(PSAVE,j)}catch(e){}};if(now)cloud();else progT=setTimeout(cloud,1500)}
// a CrazyGames cloud save (logged in on another device) wins if it has more XP
function progCloud(){try{if(typeof CG==='undefined'||!CG.on||!CG.sdk||!CG.sdk.data)return;const r=CG.sdk.data.getItem(PSAVE);const s=r&&JSON.parse(r);
 if(s&&(s.lvl>PROG.lvl||(s.lvl===PROG.lvl&&s.xp>PROG.xp))){const nm=PROG.name;PROG=Object.assign(progDefault(),s);if(!PROG.name)PROG.name=nm;progDaily();progUI();progApplyProfile()}else progSave(1)}catch(e){}}
// ---------- levels and unlocks ----------
const skinOK=i=>!!PROG&&((SKREQ[i]||0)<=PROG.lvl||!!PROG.unl['sk'+i]);
function skinReq(i){return SKREQ[i]||0}
function addXP(n,why){if(!PROG||!(n>0))return;n=Math.round(n);PROG.xp+=n;let up=[];
 while(PROG.lvl<LVMAX&&PROG.xp>=xpNeed(PROG.lvl)){PROG.xp-=xpNeed(PROG.lvl);PROG.lvl++;up.push(PROG.lvl)}
 if(PROG.lvl>=LVMAX)PROG.xp=Math.min(PROG.xp,xpNeed(LVMAX));
 if(up.length){const L=up[up.length-1],nu=SK.map((s,i)=>i).filter(i=>SKREQ[i]>PROG.lvl-up.length&&SKREQ[i]<=L);lvlToast(L,nu)}
 MXP.total+=n;progSave();progUI()}
function unlockSkin(i){if(!PROG||skinOK(i))return false;PROG.unl['sk'+i]=1;progSave();return true}
// ---------- daily challenges: three new ones every day ----------
function dayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function progDaily(){const k=dayKey();if(PROG.ch&&PROG.ch.day===k)return;let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))>>>0;
 const pool=CHPOOL.map((c,i)=>i),pick=[];const seen=new Set();while(pick.length<3&&pool.length){h=(h*1103515245+12345)>>>0;const i=pool.splice(h%pool.length,1)[0];if(seen.has(CHPOOL[i].k))continue;seen.add(CHPOOL[i].k);pick.push(i)}
 PROG.ch={day:k,L:pick.map(i=>({i,p:0,done:0}))}}
function chBump(k,n){if(!PROG||!PROG.ch)return;progDaily();for(const c of PROG.ch.L){const C=CHPOOL[c.i];if(c.done||C.k!==k)continue;c.p=Math.min(C.n,c.p+(n||1));if(c.p>=C.n){c.done=1;chToast(C);addXP(C.xp,'challenge')}}progSave();progUI()}
// ---------- this match ----------
const MXP={total:0,kills:0};
function progEvent(ev,o){if(!PROG)return;o=o||{};
 if(ev==='kill'){if(typeof BOTS!=='undefined'&&BOTS.camp&&o.victim&&o.victim.fac===0)return;
  PROG.tot.kills++;if(o.hs)PROG.tot.hs++;MXP.kills++;PROG.tot.best=Math.max(PROG.tot.best,o.streak||0);addXP(o.xp||100,'kill');
  chBump('kills');if(o.hs)chBump('hs');if(o.multi===2)chBump('multi');if(o.streak===5)chBump('streak');
  if(o.w===3)chBump('sniper');if(o.w===2)chBump('shotgun');if(o.w===0)chBump('pistol')}
 else if(ev==='death'){PROG.tot.deaths++;progSave()}
 else if(ev==='match'){PROG.tot.matches++;if(o.win)PROG.tot.wins++;addXP(o.xp,'match');chBump('matches');if(o.win)chBump('win')}
 else if(ev==='mission'){PROG.tot.missions++;addXP(o.xp,'mission');chBump('mission');if(o.newStars)chBump('stars',o.newStars)}}
// match over: XP for taking part, placing and winning
{const h0=handle;handle=function(m){const was=ending;const r=h0.apply(this,arguments);
 try{if(m&&m.t==='end'&&!was&&go&&!(typeof BOTS!=='undefined'&&BOTS.camp)){
  let win=false;if(SQ()){const wt=m.w==null?-1:+String(m.w).slice(1);win=wt===(me.tm|0)}else win=m.w===me.id;
  const R=roster().slice().sort((a,b)=>b.kills-a.kills),place=Math.max(1,R.indexOf(me)+1),n=R.length;
  const parts=[['Match played',60]];if(win)parts.push([SQ()?'Squad win':'Victory',250]);else if(gm===0&&place<=3&&n>=3)parts.push(['Top 3',100]);
  const xp=parts.reduce((a,p)=>a+p[1],0),before=MXP.total;progEvent('match',{win,xp,place});showSummary(parts,before+xp,win,place,n)}}catch(e){console.error(e)}
 return r}}
{const n0=doNew;doNew=function(){MXP.total=0;MXP.kills=0;return n0.apply(this,arguments)}}
// ---------- HUD: level up, challenge done, match summary ----------
{const h=$('hud');for(const id of ['lvlup','chtoast','msum']){const d=document.createElement('div');d.id=id;h.appendChild(d)}}
function lvlToast(L,skins){const d=$('lvlup');d.innerHTML='<small>LEVEL UP</small><b>'+L+'</b>'+(skins.length?'<span>Unlocked: '+skins.map(i=>SK[i].n).join(', ')+'</span>':'');
 d.classList.remove('on');void d.offsetWidth;d.classList.add('on');if(typeof sfx==='function')sfx('lvl',{vol:.5,jit:0});clearTimeout(d._t);d._t=setTimeout(()=>d.classList.remove('on'),3800);
 if(!go&&skins.length)status('Level '+L+'! Unlocked: '+skins.map(i=>SK[i].n).join(', ')+'.')}
function chToast(C){const d=$('chtoast');d.innerHTML='<small>CHALLENGE COMPLETE</small><b></b><i>+'+C.xp+' XP</i>';d.querySelector('b').textContent=C.t;d.classList.remove('on');void d.offsetWidth;d.classList.add('on');clearTimeout(d._t);d._t=setTimeout(()=>d.classList.remove('on'),3500)}
function showSummary(parts,total,win,place,n){const d=$('msum');const lv=PROG.lvl,need=xpNeed(lv);
 d.innerHTML='<div class="mp">'+(gm===0?'Place #'+place+' of '+n+' · ':'')+MXP.kills+' elimination'+(MXP.kills===1?'':'s')+'</div>'+
  parts.map(p=>'<div class="mr"><span>'+p[0]+'</span><b>+'+p[1]+' XP</b></div>').join('')+'<div class="mr tot"><span>Total this match</span><b>+'+total+' XP</b></div>'+
  '<div class="ml"><b>'+lv+'</b><div class="xb"><i style="width:'+(lv>=LVMAX?100:Math.min(100,PROG.xp/need*100)).toFixed(1)+'%"></i></div><small>'+(lv>=LVMAX?'MAX':PROG.xp+' / '+need)+'</small></div>';
 d.classList.add('on');clearTimeout(d._t);d._t=setTimeout(()=>d.classList.remove('on'),5600)}
// ---------- menu: profile and challenges ----------
function progUI(){if(!PROG)return;const lv=PROG.lvl,need=xpNeed(lv),f=lv>=LVMAX?1:PROG.xp/need;
 const a=$('plv');if(a)a.textContent=lv;const b=$('pxpf');if(b)b.style.width=(f*100).toFixed(1)+'%';const c=$('pxpt');if(c)c.textContent=lv>=LVMAX?'Max level':PROG.xp+' / '+need+' XP';
 const nx=SK.map((s,i)=>i).filter(i=>!skinOK(i)).sort((x,y)=>SKREQ[x]-SKREQ[y])[0],u=$('pnext');if(u)u.textContent=nx!=null?'Next unlock: '+SK[nx].n+' at level '+SKREQ[nx]:'Every outfit unlocked!';
 const L=$('chl');if(L&&PROG.ch){L.innerHTML=PROG.ch.L.map(c=>{const C=CHPOOL[c.i];return '<div class="chr'+(c.done?' done':'')+'"><div><span>'+C.t+'</span><b>'+(c.done?'✓':c.p+'/'+C.n)+'</b></div><div class="cb"><i style="width:'+(c.p/C.n*100).toFixed(0)+'%"></i></div><small>+'+C.xp+' XP</small></div>'}).join('')}
 const t=$('chalt');if(t){const d=new Date(),m=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)-d,hh=Math.floor(m/3600e3),mm=Math.floor(m/60e3)%60;t.textContent='new in '+hh+'h '+mm+'m'}}
// ---------- name and outfit are remembered ----------
function progApplyProfile(){if(!PROG)return;const i=$('nm');if(PROG.name&&i&&!(typeof CG!=='undefined'&&CG.nameLocked)){i.value=PROG.name;me.name=cleanName(PROG.name,16)}
 const s=skinOK(PROG.sk)&&SK[PROG.sk]?PROG.sk:0;me.sk=s;if(SKP[s])$('skpic').src=SKP[s];try{fpArms(me.w)}catch(e){}if(typeof pvSkin==='function')pvSkin(s)}
{const i=$('nm');const o0=i.oninput;i.oninput=function(){const r=o0&&o0.apply(this,arguments);if(PROG&&!hasBadWords(i.value)){PROG.name=i.value.slice(0,16);progSave()}return r}}
// outfit picker: locked outfits say how to get them
{const o0=openSkins;openSkins=function(cb){const L=SK.map((s,i)=>i),items=L.map(i=>({img:SKP[i],n:(skinOK(i)?'':'\u{1F512} ')+SK[i].n,t:skinOK(i)?(SK[i].d||''):'Reach level '+SKREQ[i]+' to unlock'+(PROG&&PROG.lvl?' (you are level '+PROG.lvl+')':'')}));
 openCar('Choose your outfit',items,Math.max(0,L.indexOf(me.sk)),j=>{const k=L[j];if(!skinOK(k)){if(typeof sfx==='function')sfx('deny',{vol:.4});status(SK[k].n+' unlocks at level '+SKREQ[k]+'. Play matches and missions to earn XP.');return}
  if(PROG){PROG.sk=k;progSave()}cb(k);if(typeof pvSkin==='function')pvSkin(k)})}}
// ---------- start ----------
progLoad();
(function waitBoot(){if(typeof booted==='undefined'||!booted){setTimeout(waitBoot,100);return}progApplyProfile();progUI();
 let tries=0;const t=setInterval(()=>{if(typeof CG!=='undefined'&&CG.on&&CG.sdk){clearInterval(t);progCloud()}else if(++tries>100)clearInterval(t)},300);
 setInterval(()=>{if(!go)progUI()},30000)})();
// first match ever: a quick reminder of the controls
(function(){let was=false;setInterval(()=>{const now=!!go;if(now&&!was&&PROG&&!PROG.tut&&!(typeof BOTS!=='undefined'&&BOTS.camp)){PROG.tut=1;progSave();
  const d=document.createElement('div');d.id='tuthint';d.innerHTML=document.body.classList.contains('touch')?'<b>Left thumb</b> move &middot; <b>right thumb</b> look &middot; <b>FIRE</b> shoot':'<b>WASD</b> move &middot; <b>Mouse</b> aim &middot; <b>Click</b> shoot &middot; <b>Right click</b> aim &middot; <b>Shift</b> sprint &middot; <b>R</b> reload';
  $('hud').appendChild(d);setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),600)},7000)}was=now},500)})();
