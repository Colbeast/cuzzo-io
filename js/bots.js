// ===== Bots =====
// Computer-controlled players. They only ever run on the host (the player who opened the match), who moves
// them, aims and shoots for them, and sends their position to everyone else like any other player. Other
// players shoot them normally: the hit goes to the host, who takes it off the bot's health.
//
// Online matches: the host picks how many bots (lobby - / +), and a bot leaves every time a
// real player joins, so a match is never empty but real players always get a place. The host can switch
// bots off in the lobby. Bots are named "BOT ..." so nobody mistakes them for people.
// The story campaign (js/campaign.js) uses the same bots as enemies, allies and bosses.
const BOTS={list:[],on:true,fill:5,n:0,addT:0,camp:null};
// how many bots the host wants in each mode (free-for-all, Battle Royale, Squads), set with - / + in the lobby
BOTS.cnt=[4,5,5];try{const v=JSON.parse(localStorage.getItem('cf_botn')||'null');if(Array.isArray(v)&&v.length===3)BOTS.cnt=v.map(n=>Math.max(0,Math.min(7,n|0)))}catch(e){}
const botWant=()=>{const n=BOTS.cnt[gm]|0;return Math.max(0,Math.min(n,MAXP-roster().filter(e=>!isBot(e)).length))};
const botCntSave=()=>{try{localStorage.setItem('cf_botn',JSON.stringify(BOTS.cnt))}catch(e){}};
const BOTNAMES=['Rex','Nova','Tank','Pixel','Blaze','Ziggy','Moose','Echo','Dash','Bandit','Rook','Juno','Ace','Waffles','Pickle','Turbo','Biscuit','Sarge','Noodle','Comet','Gizmo','Mango','Chomp','Dusty'];
const isBot=e=>!!e&&(e.id==='bot'||/^B\d/.test(String(e.id)));
// weapons bots use, with how they like to fight with them
const BOTW={0:{min:4,max:20,rate:1.5},1:{min:7,max:30,rate:1.45},2:{min:2,max:9,rate:1.25},3:{min:18,max:70,rate:1.3},17:{min:5,max:22,rate:1.5},18:{min:3,max:16,rate:1.5}};
const _b1=new V(),_b2=new V(),_b3=new V();
// ---------- who is where ----------
function entPos(e){if(e===me)return _b1.set(me.x,me.y,me.z);const r=e.rt;return _b1.set(r.x,r.y,r.z)}
function entAlive(e){if(!e)return false;if(e===me)return !!go&&!me.out&&me.hp>0&&!me.bus&&!me.glide;
 if(isBot(e))return !e.dead&&e.id!=='bot'&&!e.out&&!e.rt.bs;return !!e.seen&&!e.out&&!e.rt.bs&&(e.rt.hp==null||e.rt.hp>0)}
function facOf(e){if(BOTS.camp){if(e===me)return 0;if(isBot(e))return e.fac!=null?e.fac:e.id;return 0}
 if(SQ())return 'T'+((e===me?me.tm:e.tm)|0);if(e===me)return 'me';if(isBot(e))return e.fac!=null?e.fac:e.id;return e.id}
const hostile=(a,b)=>a!==b&&facOf(a)!==facOf(b);
function botTargets(b){const L=[];if(entAlive(me))L.push(me);for(const p of Object.values(players))if(p!==b&&entAlive(p))L.push(p);return L.filter(t=>hostile(b,t))}
// ---------- adding and removing ----------
// names that look like the ones real players pick
const NA=['Shadow','Frost','Blaze','Viper','Ghost','Storm','Lucky','Silent','Rapid','Night','Iron','Crazy','Golden','Turbo','Sneaky','Cosmic','Pixel','Chill','Dark','Epic','Mega','Hyper','Swift','Lone'],
 NB=['Wolf','Fox','Hawk','Ninja','Tiger','Dragon','Sniper','Gamer','Rider','Hunter','Knight','Bear','Panda','Shark','Raven','Cobra','Ace','Legend','Bandit','Falcon','Goose','Taco','Noodle','Potato'],
 NS=['jake','noah','liam','emma','mason','ethan','lucas','ava','mia','leo','max','zoe','owen','kai','eli','nate','ryan','dylan','sam','alex','tyler','logan','sky','jayden','ben','lily','finn','aiden','chloe','omar','mateo','ivan'];
function botName(){const R=a=>a[Math.random()*a.length|0],N=(a,b)=>a+(Math.random()*(b-a+1)|0),C=s=>s[0].toUpperCase()+s.slice(1);
 const used=new Set(roster().map(e=>e.name.toLowerCase()));
 for(let t=0;t<40;t++){const k=Math.random()*10|0;let n=
  k===0?R(NA)+R(NB):k===1?R(NA)+R(NB)+N(1,99):k===2?R(NS)+N(10,9999):k===3?R(NS)+'_'+R(NB).toLowerCase():k===4?'xX'+R(NB)+'Xx':
  k===5?R(NB).toLowerCase()+N(100,999):k===6?C(R(NS))+R(NB):k===7?R(NS)+R(NS)+N(1,9):k===8?'its'+C(R(NS)):R(NA).toLowerCase()+'_'+R(NS);
  if(n.length>12)continue;n='BOT '+n;if(!used.has(n.toLowerCase())&&!hasBadWords(n))return n}
 return 'BOT '+R(NS)+N(10,99)}
function botAdd(o){o=o||{};const id='B'+(++BOTS.n),p=addP(id,o.name||botName());
 const w=o.w!=null?o.w:(gm===0?[1,1,2,2,3,0]:[1,1,1,2,2,17,18,3])[Math.random()*(gm===0?6:8)|0];
 p.sk=o.sk!=null?o.sk:(Math.random()*SK.length|0);p.fac=o.fac;p.skill=o.skill!=null?o.skill:.3+Math.random()*.35;p.bw=w;p.maxhp=o.hp||100;
 p.boss=!!o.boss;p.sc=o.scale||1;p.respawn=o.respawn!==false;p.guard=o.guard||null;p.spawnAt=o.spawn||null;p.tag=o.tag||'';p.hunt=o.hunt||null;p.tm=o.tm|0;p.dropAt=o.drop||0;p.prefer=o.prefer||null;p.follow=o.follow||null;p.dmgK=o.dmgK||1;p.spdK=o.spdK||1;
 if(p.sc!==1){p.R.g.scale.setScalar(p.sc)}
 BOTS.list.push(p);botRespawn(p,true);if(isHost&&typeof lob==='function'&&!BOTS.camp)lob();return p}
function botRemove(p,quiet){if(!p)return;BOTS.list=BOTS.list.filter(b=>b!==p);if(!quiet&&typeof feed==='function')feed(p.name+' left',1);delP(p.id);if(isHost&&typeof lob==='function'&&!BOTS.camp)lob()}
function botsClear(){BOTS.list.slice().forEach(p=>botRemove(p,1));BOTS.list=[]}
function botSpawnPoint(p){
 if(!BOTS.camp&&SQ()){// squads: start next to a teammate
  const mates=[me,...Object.values(players).filter(q=>!isBot(q))].filter(e=>((e===me?me.tm:e.tm)|0)===(p.tm|0)&&(e===me||e.seen));
  if(mates.length){const q=entPos(mates[Math.random()*mates.length|0]);return safeSpot(q.x+(Math.random()-.5)*10,q.z+(Math.random()-.5)*10)}}
 if(p.spawnAt){const s=safeSpot(p.spawnAt[0]+(Math.random()-.5)*3,p.spawnAt[1]+(Math.random()-.5)*3);return s}
 const others=[me,...Object.values(players)].filter(e=>e!==p&&entAlive(e)).map(e=>{const q=entPos(e);return[q.x,q.z]});
 let best=spawns[0],bd=-1;for(let k=0;k<8;k++){const s=spawns[Math.random()*spawns.length|0];let m=1e9;for(const o of others)m=Math.min(m,Math.hypot(o[0]-s[0],o[1]-s[1]));if(m>bd){bd=m;best=s}}
 return safeSpot(best[0],best[1])}
function botRespawn(p,first){const s=botSpawnPoint(p);const r=p.rt;Object.assign(r,{x:s[0],y:Hf(s[0],s[1]),z:s[1],yaw:Math.random()*6.283,pitch:0,hp:p.maxhp,mh:p.maxhp,w:p.bw,bs:0,ck:0,inv:0,sc:p.sc});
 r.y=groundAt(r.x,r.z,r.y+.5);p.dead=0;p.seen=1;p.R.g.position.set(r.x,r.y,r.z);
 p.ai={vy:0,cd:.6,ammo:(WP[p.bw]&&WP[p.bw].mag)||30,rl:0,burst:0,strafe:Math.random()<.5?-1:1,st:1,tgt:null,tgtT:0,seeT:0,seen:0,wander:0,wa:0,pt:0,wp:null,wpT:0,jump:2+Math.random()*3,grace:first?1:1.5,lastSeen:null,hurtT:0,aimYaw:r.yaw}}
// ---------- damage ----------
// from: who did it (player id, bot id or 'me' id). Returns true if it killed.
function botHurt(p,d,hs,from){if(!p||p.dead||!isHost)return false;d=+d;if(!(d>0))return false;d=Math.min(d,250);
 if(from!=null){const src=st(from);if(src&&!hostile(p,src))return false}
 p.rt.hp=Math.max(0,p.rt.hp-d);if(p.ai){p.ai.hurtT=1.2;const src=st(from);if(src&&src!==p&&entAlive(src)){const q=entPos(src);p.ai.alert=2.5;p.ai.look=Math.atan2(-(q.x-p.rt.x),-(q.z-p.rt.z));if(!p.ai.tgt)p.ai.inv=[q.x+(Math.random()-.5)*8,q.z+(Math.random()-.5)*8]}}
 if(p.rt.hp>0){if(typeof bossHurt==='function'&&p.boss)bossHurt(p);return false}
 p.dead=1;p.life=(p.life||0)+1;p.rt.bs=1;const m={t:'d',v:p.id,k:from,hs,n:p.life};
 if(!BOTS.camp)send(m);death(m);if(typeof campBotDied==='function')campBotDied(p,from,hs);
 if(p.respawn&&!BOTS.camp&&!ELIM())setTimeout(()=>{if(players[p.id]&&go&&!ending)botRespawn(p)},2200);
 return true}
// ---------- sight ----------
function botEyeP(p){const r=p.rt;return _b2.set(r.x,r.y+1.62*p.sc,r.z)}
function canSee(p,t,maxD){const e=botEyeP(p).clone(),q=entPos(t);const ck=t===me?me.ck:t.rt.ck,sc=t===me?1:(t.sc||1);
 for(const h of [1.55*(ck?.68:1)*sc,1.0*sc]){_b3.set(q.x-e.x,q.y+h-e.y,q.z-e.z);const L=_b3.length();if(L>maxD)return 0;_b3.multiplyScalar(1/L);if(wallDist(e,_b3,L+1)>=L-.3)return L}return 0}
// what a bot can see: about 130 degrees in front of it (wider when it's alert), anything right next to it
function canSeeFov(p,t,maxD){const r=p.rt,q=entPos(t),dx=q.x-r.x,dz=q.z-r.z,d=Math.hypot(dx,dz);if(d>maxD)return 0;
 if(d>4){const a=Math.abs(bAng(r.yaw,Math.atan2(-dx,-dz)));if(a>((p.ai&&p.ai.alert>0)?1.9:1.13))return 0}return canSee(p,t,maxD)}
// noises: gunshots tell nearby bots roughly where someone is
function botNoise(x,z,rad,src){if(!isHost||!go||BOTS.camp&&!src)return;for(const p of BOTS.list){if(p.dead||p===src||!p.ai)continue;if(src&&!hostile(p,src))continue;
  const d=Math.hypot(p.rt.x-x,p.rt.z-z);if(d>rad||p.ai.tgt)continue;const e=Math.min(10,d*.15);p.ai.inv=[x+(Math.random()-.5)*e,z+(Math.random()-.5)*e];p.ai.alert=Math.max(p.ai.alert||0,1.5)}}
// path following: direction to walk toward (gx,gz), going around walls
function navTo(p,gx,gz){const r=p.rt,A=p.ai;let dx=gx-r.x,dz=gz-r.z;const D=Math.hypot(dx,dz)||1;
 if(typeof navPath!=='function'||!NAV.ready||D<2)return[dx/D,dz/D];
 const c=navCell(r.x,r.z);if(c<0||Math.abs(NAV.h[c]-r.y)>1.2)return[dx/D,dz/D];// not on the ground floor: walk straight
 A.pathT=(A.pathT||0)-1/30;
 if(!A.path||!A.pg||Math.hypot(A.pg[0]-gx,A.pg[1]-gz)>4||A.pathT<=0||A.pi>=A.path.length){A.path=navPath(r.x,r.z,r.y,gx,gz,4000);A.pi=0;A.pg=[gx,gz];A.pathT=2.5+Math.random();if(!A.path||!A.path.length){A.path=null;return[dx/D,dz/D]}}
 const P=A.path;while(A.pi<P.length-1&&Math.hypot(P[A.pi][0]-r.x,P[A.pi][1]-r.z)<NAV.cs*.9)A.pi++;
 let k=A.pi;for(let j=Math.min(P.length-1,A.pi+4);j>A.pi;j--){if(navLine(r.x,r.z,r.y,P[j][0],P[j][1])){k=j;break}}
 dx=P[k][0]-r.x;dz=P[k][1]-r.z;const L=Math.hypot(dx,dz)||1;return[dx/L,dz/L]}
// open any closed door the bot walks up to
function botDoors(p){const r=p.rt;if(typeof doors==='undefined'||!doors.length)return;for(const d of doors){if(d.o)continue;if(Math.hypot(r.x-d.x,r.z-d.z)<1.9&&Math.abs(r.y-d.y)<1.6){tdoor(d,1);if(typeof sfx==='function'){}break}}}
function tryMove(p,dx,dz){const r=p.rt,ok=(x,z)=>{const g=groundAt(x,z,r.y+.6);return g<=r.y+.6&&!blocked(x,z,Math.max(g,r.y))};let mv=false;if(ok(r.x+dx,r.z)){r.x+=dx;mv=true}if(ok(r.x,r.z+dz)){r.z+=dz;mv=true}return mv}
const bAng=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
// ---------- one bot, one frame ----------
function botThink(p,dt){const r=p.rt,A=p.ai,W=BOTW[p.bw]||BOTW[1],Wp=WP[p.bw];if(!A)return;
 // battle royale: bots arrive during the bus flight, somewhere on the island
 if(p.dropAt){if(performance.now()<p.dropAt){r.bs=1;return}p.dropAt=0;let s=spawns[Math.random()*spawns.length|0];if(typeof BUS!=='undefined'&&BUS&&BUS.dur){const f=Math.max(0,Math.min(1,(performance.now()-BUS.t0)/(BUS.dur*1000))),bx=BUS.x0+(BUS.x1-BUS.x0)*f,bz=BUS.z0+(BUS.z1-BUS.z0)*f,L=Math.hypot(BUS.x1-BUS.x0,BUS.z1-BUS.z0)||1,o=(Math.random()-.5)*50;s=[bx-(BUS.z1-BUS.z0)/L*o,bz+(BUS.x1-BUS.x0)/L*o];const c=navCell?navNear(s[0],s[1]):-1;if(NAV.ready&&c<0)s=spawns[Math.random()*spawns.length|0]}const q=safeSpot(s[0]+(Math.random()-.5)*8,s[1]+(Math.random()-.5)*8);
  r.x=q[0];r.z=q[1];r.y=groundAt(q[0],q[1],Hf(q[0],q[1])+40);r.bs=0;p.R.g.position.set(r.x,r.y,r.z);A.grace=1.5}
 // the storm hurts bots too, and they run for the safe zone
 const Z=BOTS.z;let zg=null;if(Z){const zd=Math.hypot(r.x-Z.x,r.z-Z.z);if(zd>Z.r){A.stA=(A.stA||0)+Z.d*dt;if(A.stA>=1){const n=Math.floor(A.stA);A.stA-=n;if(botHurt(p,n,false,'storm'))return}}
  if(zd>Z.r-6&&Z.r>4)zg=[Z.x,Z.z]}
 A.grace=Math.max(0,A.grace-dt);A.hurtT=Math.max(0,A.hurtT-dt);A.alert=Math.max(0,(A.alert||0)-dt);
 A.dT=(A.dT||0)-dt;if(A.dT<=0){A.dT=.25;botDoors(p)}
 // pick a target a few times a second: the closest enemy it can see, sticking with the current one for a bit
 A.tgtT-=dt;if(A.tgtT<=0){A.tgtT=.25+Math.random()*.2;const L=botTargets(p);let best=null,bd=1e9;
  for(const t of L){const q=entPos(t),dd=Math.hypot(q.x-r.x,q.z-r.z);if(dd>95)continue;const fresh=t===me?(performance.now()-(me.spT||0))<1500:false;if(fresh)continue;
   const thp=t===me?me.hp:(t.rt.hp||100),sc=dd*(.7+.3*Math.min(1,thp/100))*(t===A.tgt?.7:1)*(t===me&&!BOTS.camp?.92:1)*(p.prefer&&t===p.prefer?.45:1);if(sc<bd&&(t===A.tgt&&performance.now()-(A.seenT||0)<1200?canSee(p,t,95):canSeeFov(p,t,95))){bd=sc;best=t}}
  if(best){A.tgt=best;A.seenT=performance.now();const q=entPos(best);A.lastSeen=[q.x,q.z];A.inv=null}else if(A.tgt&&(!entAlive(A.tgt)||performance.now()-(A.seenT||0)>1500)){A.tgt=null;A.searchT=3}}
 const t=A.tgt&&entAlive(A.tgt)?A.tgt:null;let sees=0,dist=1e9,dx=0,dz=0;
 if(t){const q=entPos(t);dx=q.x-r.x;dz=q.z-r.z;dist=Math.hypot(dx,dz);sees=(performance.now()-(A.seenT||0))<700?dist:0}
 A.seen=sees?Math.min(A.seen+dt,5):Math.max(0,A.seen-dt*2);
 // ---- movement ----
 let mx=0,mz=0;const ux=dist<1e8&&dist>.01?dx/dist:0,uz=dist<1e8&&dist>.01?dz/dist:0;let goal=null,look=null;
 if(A.wander>0){A.wander-=dt;mx=Math.cos(A.wa);mz=Math.sin(A.wa)}
 else if(zg)goal=zg;// get out of the storm
 else if(A.cover&&(A.coverT-=dt)>0){goal=A.cover;if(Math.hypot(A.cover[0]-r.x,A.cover[1]-r.z)<1.2){mx=0;mz=0;goal=null;if(t)look=Math.atan2(-dx,-dz)}}// in cover: wait, then peek out
 else if((A.cover=null)||false){}
 else if(t&&sees&&dist<=W.max*1.25){A.st-=dt;if(A.st<=0){A.strafe=-A.strafe;A.st=.7+Math.random()*1.6}// fight: strafe at a good range
  const keep=dist<W.min?-.9:dist>W.max?.8:(A.hurtT>0?-.2:0);mx=-uz*A.strafe*.9+ux*keep;mz=ux*A.strafe*.9+uz*keep}
 else if(t&&sees){const q=entPos(t);goal=[q.x,q.z]}// seen but too far for this gun: close in
 else if(A.lastSeen){goal=A.lastSeen;if(Math.hypot(goal[0]-r.x,goal[1]-r.z)<2.5){A.lastSeen=null;A.searchT=3}}// go where they were last seen
 else if(A.inv){goal=A.inv;if(Math.hypot(goal[0]-r.x,goal[1]-r.z)<2.5){A.inv=null;A.searchT=2.5}}// check out a noise
 else if(A.searchT>0){A.searchT-=dt;look=r.yaw+Math.sin(A.searchT*2.2)*1.4}// look around
 else if(!BOTS.camp&&SQ()&&(A.mate=botMate(p))){// squads: stay with the team
  const q=entPos(A.mate);if(Math.hypot(q.x-r.x,q.z-r.z)>7)goal=[q.x+(Math.random()-.5)*4,q.z+(Math.random()-.5)*4]}
 else if(p.hunt&&entAlive(p.hunt)){// campaign: they know roughly where you are, not exactly
  A.hT=(A.hT||0)-dt;if(A.hT<=0||!A.hg){A.hT=5+Math.random()*4;const q=entPos(p.hunt),e=BOTS.camp?6:14;A.hg=[q.x+(Math.random()-.5)*e*2,q.z+(Math.random()-.5)*e*2]}
  if(Math.hypot(A.hg[0]-r.x,A.hg[1]-r.z)>3)goal=A.hg;else A.hT=0}
 else if(p.guard){if(p.follow&&entAlive(p.follow)){const q=entPos(p.follow);p.guard=[q.x,q.z,5]}const g=p.guard;if(Math.hypot(g[0]-r.x,g[1]-r.z)>(g[2]||6))goal=[g[0],g[1]]}
 else{// roam: between spawn points (free-for-all, Squads) or around the safe zone (Battle Royale)
  A.wpT-=dt;if(!A.wp||A.wpT<=0||Math.hypot(A.wp[0]-r.x,A.wp[1]-r.z)<3){
   if(Z&&Z.r>8){const a=Math.random()*6.283,rr=Math.sqrt(Math.random())*Z.r*.8;A.wp=[Z.x+Math.cos(a)*rr,Z.z+Math.sin(a)*rr]}else A.wp=spawns[Math.random()*spawns.length|0];
   A.wpT=12+Math.random()*10;if(Math.random()<.3)A.searchT=1.5}
  goal=A.wp}
 if(goal){const d=navTo(p,goal[0],goal[1]);mx=d[0];mz=d[1]}
 const ml=Math.hypot(mx,mz),sprint=!sees&&ml>0&&A.wander<=0&&!A.searchT?1.2:1;
 if(ml>0){const s=5.6*p.spdK*sprint*(A.wander>0?.85:1)*dt/ml;let vx=mx*s,vz=mz*s;
  if(!tryMove(p,vx,vz)&&A.wander<=0){for(const a of [.8,-.8,1.6,-1.6,2.5,-2.5]){const c=Math.cos(a),sn=Math.sin(a),wx=vx*c-vz*sn,wz=vx*sn+vz*c;if(tryMove(p,wx,wz)){A.wander=.6+Math.random()*.6;A.wa=Math.atan2(wz,wx);break}}}}
 A.pt+=dt;if(A.pt>1){const mv=Math.hypot(r.x-(A.px??r.x),r.z-(A.pz??r.z));if(ml>0&&mv<1.1){A.stuck=(A.stuck||0)+1;A.path=null;if(A.vy===0)A.vy=6.5;if(A.stuck>1){A.wander=.8+Math.random()*.8;A.wa=Math.random()*6.283;A.wp=null;A.stuck=0}}else A.stuck=0;A.pt=0;A.px=r.x;A.pz=r.z}
 // ---- jumping and gravity ----
 A.jump-=dt;const g0=groundAt(r.x,r.z,r.y+.55);if(A.jump<=0&&r.y<=g0+.05&&sees&&dist<25){A.vy=6.5;A.jump=2.2+Math.random()*4}
 A.vy-=(MAPS[mapIdx].grav||18)*dt;r.y+=A.vy*dt;const g=groundAt(r.x,r.z,Math.max(r.y,r.y-A.vy*dt)+.55);if(r.y<=g){r.y=g;A.vy=0}
 if(r.y<-60){botRespawn(p);return}
 // ---- aim: turn smoothly toward the target ----
 let want=look!=null?look:A.alert>0&&A.look!=null&&!t?A.look:ml>0?Math.atan2(-mx,-mz):r.yaw,wp=0;if(t&&sees){const q=entPos(t);want=Math.atan2(-dx,-dz);wp=Math.atan2(q.y+1.2-(r.y+1.62*p.sc),dist)}
 const turn=(sees?7:5)*dt*(.6+p.skill*.6)*(BOTS.camp?1:.7);const dy=bAng(r.yaw,want);r.yaw+=Math.max(-turn,Math.min(turn,dy));r.pitch+=(wp-r.pitch)*Math.min(1,dt*8);
 // ---- shooting ----
 A.cvT=(A.cvT||0)-dt;if(t&&sees&&!A.cover&&A.cvT<=0&&((A.hurtT>0&&r.hp<55)||A.rl>0||(r.hp<30&&dist<30))){A.cvT=1.5;const c=botCover(p,t);if(c){A.cover=c;A.coverT=A.rl>0?Math.max(1.5,A.rl+.3):r.hp<30?4:2.2}}
 A.cd-=dt;if(A.rl>0){A.rl-=dt;if(A.rl<=0)A.ammo=Wp.mag;return}
 if(!t||!sees||A.grace>0||ending||A.cd>0||dist>W.max*1.6)return;
 const react=BOTS.camp?.4+(1-p.skill)*.55:.7+(1-p.skill)*.7;if(A.seen<react||Math.abs(bAng(r.yaw,want))>.25)return;
 if(p.bw===1||p.bw===18){if(A.burst<=0){A.burst=BOTS.camp?3+(Math.random()*6|0):2+(Math.random()*4|0);A.cd=BOTS.camp?.3+Math.random()*.6:.5+Math.random()*.8;return}A.burst--}
 A.cd=Wp.r*W.rate*(BOTS.camp?1.05:1.3);A.ammo--;if(A.ammo<=0){A.rl=Wp.rl*1.2;A.burst=0}
 botFire(p,t,dist)}
function botFire(p,t,dist){const r=p.rt,Wp=WP[p.bw],e=botEyeP(p).clone(),q=entPos(t).clone();
 const ck=t===me?me.ck:t.rt.ck,tsc=t===me?1:(t.sc||1),tgt=new V(q.x,q.y+(ck?.85:1.2)*tsc,q.z),A=p.ai;
 {const v=VEL.get(t),tt=dist/((PJT[p.bw]||PJT[1]).sp)*(.5+p.skill*.5);if(v){tgt.x+=v[0]*tt;tgt.z+=v[1]*tt}}
 const moving=t===me?(me.sprint?1.4:1):((t.spd||0)>6?1.3:1);
 const base=(BOTS.camp?.032:.048)*(1.35-p.skill*.7),err=(base+Math.min(.05,dist*.0008))*moving*(A.seen>2?.8:1.15)*(A.hurtT>0?1.15:1);
 const pel=p.bw===2?6:1,sp=(PJT[p.bw]||PJT[1]).sp,shots=[];let dmgSum=0,hs=false,hd=0;
 for(let i=0;i<pel;i++){const d=tgt.clone().sub(e).normalize(),e2=err+(p.bw===2?.05:0);d.x+=(Math.random()-.5)*2*e2;d.y+=(Math.random()-.5)*2*e2;d.z+=(Math.random()-.5)*2*e2;d.normalize();
  if(i<4){const o=e.clone().addScaledVector(d,.7);pjSpawn(PJT[p.bw]?p.bw:1,o,d.clone().multiplyScalar(sp),false,p.id);shots.push([...o.toArray(),...d.clone().multiplyScalar(sp).toArray()].map(n=>+n.toFixed(2)))}
  const k=ck?.68:1,bw=.42*tsc,hw=.27*tsc,head=rayBoxDistance(e,d,q.x-hw,q.y+1.55*k*tsc,q.z-hw,q.x+hw,q.y+2.12*k*tsc,q.z+hw),body=rayBoxDistance(e,d,q.x-bw,q.y,q.z-bw,q.x+bw,q.y+1.55*k*tsc,q.z+bw),h=Math.min(head,body);
  if(h>dist+6||h>=1e8)continue;if(wallDist(e,d,h+.1)<h-.1)continue;const isH=head<body;dmgSum+=Wp.d*(isH?2:1)*(p.bw===2?1:1);hs=hs||isH;hd=h}
 if(typeof shotSound==='function')shotSound(r.x,r.y+1.5,r.z,p.bw);else{const dd=Math.hypot(r.x-me.x,r.z-me.z);if(dd<70)beep(200,.06)}
 if(typeof vaShot==='function'&&t===me)vaShot(r.x,r.z);botNoise(r.x,r.z,45,p);
 if(!BOTS.camp){const msg={t:'bl',w:PJT[p.bw]?p.bw:1,b:shots,q:0,f:p.id};links.forEach(l=>l.pid&&l.open&&l.send(msg))}
 if(!(dmgSum>0))return;const D=Math.round(dmgSum*p.dmgK*(BOTS.camp&&t===me?(BOTS.camp.dmgK||1):!BOTS.camp&&!isBot(t)?.8:1));
 setTimeout(()=>{if(!go||ending||!players[p.id])return;botDeal(p,t,D,hs)},hd/sp*1000)}
function botDeal(p,t,d,hs){if(!entAlive(t))return;
 if(t===me){dmg({d,f:p.id,hs})}
 else if(isBot(t))botHurt(t,d,hs,p.id);
 else{const m={t:'h',to:t.id,d,hs,f:p.id};links.forEach(l=>l.pid===t.id&&l.open&&l.send(m))}}
// a nearby spot the target can't see (behind a wall, a house, a rock), reachable on the ground
function botCover(p,t){if(!NAV.ready)return null;const r=p.rt,q=entPos(t),eye=new V(q.x,q.y+1.6,q.z);let best=null,bd=1e9;
 for(let k=0;k<12;k++){const a=k/12*6.283;for(const R of [3,5,7.5]){const x=r.x+Math.cos(a)*R,z=r.z+Math.sin(a)*R,c=navCell(x,z);if(c<0||!NAV.ok[c]||Math.abs(NAV.h[c]-r.y)>1)continue;
   const y=NAV.h[c]+1.2,d=new V(x-eye.x,y-eye.y,z-eye.z),L=d.length();d.multiplyScalar(1/L);if(wallDist(eye,d,L)>=L-.5)continue;// target could still see it
   if(!navLine(r.x,r.z,r.y,x,z))continue;const sc=R+Math.hypot(x-q.x,z-q.z)*-.05;if(sc<bd){bd=sc;best=[x,z]}}}
 return best}
// closest living teammate (Squads)
function botMate(p){let b=null,bd=40;for(const e of [me,...Object.values(players)]){if(e===p||!entAlive(e)||hostile(p,e))continue;const q=entPos(e),d=Math.hypot(q.x-p.rt.x,q.z-p.rt.z);if(d<bd&&(e===me||!isBot(e)||d<bd*.8)){bd=d;b=e}}return b}
// how fast everyone is moving, so bots can aim a little ahead
const VEL=new Map(),VELP=new Map();
function velTrack(dt){if(dt<=0)return;const now=[me,...Object.values(players)];for(const e of now){const q=entPos(e),o=VELP.get(e);if(o){const vx=(q.x-o[0])/dt,vz=(q.z-o[1])/dt,v=VEL.get(e)||[0,0];if(Math.abs(vx)<30&&Math.abs(vz)<30){v[0]+=(vx-v[0])*.25;v[1]+=(vz-v[1])*.25}VEL.set(e,v)}VELP.set(e,[q.x,q.z])}
 for(const e of VEL.keys())if(!now.includes(e)){VEL.delete(e);VELP.delete(e)}}
// ---------- every frame (called from the main loop) ----------
let botNetT=0;
function botTick(dt){if(!isHost){return}
 // lobby: the host's chosen number of bots are in the room before the match, joining one by one
 const lobOK=!BOTS.camp&&!go&&isHost&&(!!room||practice)&&cur==='lobby';
 if(!BOTS.camp&&!go&&BOTS.list.length&&!lobOK)botsClear();
 if(lobOK){const want=botWant(),now=performance.now();
  if(BOTS.list.length>want)botRemove(BOTS.list[BOTS.list.length-1],1);
  else if(BOTS.list.length<want&&now>(BOTS.lobNext||0)){BOTS.lobNext=now+450;const b=botAdd({tm:SQ()?(nTeam(0)<=nTeam(1)?0:1):0});
  }
  // bots vote for a map too (again whenever a new set of maps comes up)
  if(VOTEON&&VOTE.c.length&&Math.random()<dt*.8){const b=BOTS.list.find(q=>VOTE.v[q.id]==null||!VOTE.c.includes(VOTE.v[q.id]));if(b){VOTE.v[b.id]=VOTE.c[Math.random()*VOTE.c.length|0];lob()}}}
 BOTS.z=go&&ELIM()&&stormT0>0&&!BOTS.camp?zoneNow():null;
 if(!BOTS.camp&&gm===0&&go){const want=!ending?botWant():BOTS.list.length;
  if(BOTS.list.length>want)botRemove(BOTS.list[BOTS.list.length-1]);
  else if(BOTS.list.length<want){BOTS.addT-=dt;if(BOTS.addT<=0){BOTS.addT=BOTS.list.length?1.2:.4;const b=botAdd({});feed(b.name+' joined')}}else BOTS.addT=Math.min(BOTS.addT,.4)}
 if(!go)return;if(typeof navBuild==='function'&&BOTS.list.length)navBuild(3);if(BOTS.camp&&(BOTS.camp.paused||BOTS.camp.over))return;
 velTrack(dt);
 for(const p of BOTS.list){if(p.dead||ending)continue;try{botThink(p,dt)}catch(e){console.error(e)}}
 // tell everyone where the bots are (20 times a second, like a player)
 botNetT+=dt;if(botNetT>.05&&links.length&&!BOTS.camp){botNetT=0;for(const p of BOTS.list){const r=p.rt,m={t:'p',f:p.id,tm:p.tm|0,x:+r.x.toFixed(2),y:+r.y.toFixed(2),z:+r.z.toFixed(2),yaw:+r.yaw.toFixed(3),pitch:+r.pitch.toFixed(3),w:r.w,hp:Math.round(r.hp),mh:p.maxhp,bs:r.bs?1:0,ck:0,inv:0,sh:0,sp:0,gl:0,cr:0,ns:0};links.forEach(l=>l.pid&&l.open&&l.send(m))}}}
// ---------- lobby: the host picks how many bots (0-7) for the selected mode ----------
{const row=$('botrow');if(row){const chg=d=>{if(!isHost||go||BOTS.camp)return;const humans=roster().filter(e=>!isBot(e)).length;BOTS.cnt[gm]=Math.max(0,Math.min(MAXP-1,(BOTS.cnt[gm]|0)+d));botCntSave();renderLobby()};
 $('bminus').onclick=()=>chg(-1);$('bplus').onclick=()=>chg(1);
 const r0=renderLobby;renderLobby=function(){const out=r0.apply(this,arguments);try{const show=isHost&&!BOTS.camp;row.style.display=show?'':'none';const n=BOTS.cnt[gm]|0,room_=MAXP-roster().filter(e=>!isBot(e)).length;
  $('bnum').textContent=n;$('bminus').disabled=n<=0||!!go;$('bplus').disabled=n>=MAXP-1||!!go;$('bhint').textContent=n?(n>room_?'only '+room_+' fit with the players here':'leave when real players need the space'):'no bots';}catch(e){}return out}}}

// ---------- Battle Royale and Squads: bots join every match when it starts ----------
// The host's chosen number of bots play (fewer if real players need the places). They ride the bus with everyone
// and jump out along its route, in Battle Royale and in Squads. Bots that are eliminated stay out until the next match.
function botsElimStart(){if(!isHost||!ELIM()||BOTS.camp)return;
 const n=botWant();
 const bus=typeof BUS!=='undefined'&&BUS&&BUS.live!==undefined,drop=()=>bus?BUS.t0+2500+Math.random()*Math.max(2000,BUS.dur*1000*.8):0;
 // the ones who were already in the lobby stay; extra places are filled with new ones
 while(BOTS.list.length>n)botRemove(BOTS.list[BOTS.list.length-1],1);
 BOTS.list.forEach(p=>{p.out=0;p.dead=0;p.kills=p.deaths=0;botRespawn(p);p.dropAt=drop();if(p.dropAt)p.rt.bs=1});
 for(let k=BOTS.list.length;k<n;k++){const tm=SQ()?(nTeam(0)<=nTeam(1)?0:1):0;
  botAdd({tm,drop:bus?BUS.t0+2500+Math.random()*Math.max(2000,BUS.dur*1000*.8):0})}}
{const d0=doNew;doNew=function(){const r=d0.apply(this,arguments);try{botsElimStart()}catch(e){console.error(e)}return r}}

// real players' gunshots are heard by bots too
{const s0=shoot;shoot=function(){const c=me.cd;const o=s0.apply(this,arguments);if(me.cd>c&&isHost)botNoise(me.x,me.z,WP[me.w].q?12:(WP[me.w].kind==='melee'?8:50),me);return o}}
{const b0=bulletMsg;bulletMsg=function(m){const o=b0.apply(this,arguments);try{const p=isHost&&m&&players[m.f];if(p&&!isBot(p))botNoise(p.rt.x,p.rt.z,m.q?12:50,p)}catch(e){}return o}}

// kicking a bot in the lobby is the same as pressing -
{const k0=kickPlayer;kickPlayer=function(id){if(isBot({id})&&isHost&&!BOTS.camp){BOTS.cnt[gm]=Math.max(0,(BOTS.cnt[gm]|0)-1);botCntSave();botRemove(players[id],1);renderLobby();return}return k0.apply(this,arguments)}}
