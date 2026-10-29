// ===== Story campaign: "Cuzzo City" =====
// Twelve offline missions in three chapters. You play against bots (js/bots.js) on the arena maps, with
// story scenes before and after each mission. Progress, stars and best times are saved with the rest of
// your progress (js/progress.js). Missions unlock one after another.
//
// Mission types: elim (eliminate N), collect (pick up N items), survive (last T seconds), defend (keep an
// ally alive for T seconds), hold (capture zones one by one), boss (beat a big boss who calls for help).
// Stars: 1 for finishing, 1 for dying at most once, 1 for the mission's own goal (time, eliminations...).
const CH=[{n:'Homecoming',d:'The Static Crew is taking over the arenas of Cuzzo City.'},{n:'Salt and Steel',d:'Somebody is paying the gang in gold coins.'},{n:'Static',d:'The machine behind it all.'}];
// people in the story: name and outfit (portrait)
const WHO={M:['Martin',9],C:['Chef',15],T:['Toasty',12],S:['Captain Saltbeard',13],B:['BOLT-9000',14],K:['Cone Head',11],Y:['You',-1]};
const MIS=[
 {id:'1-1',ch:0,n:'Welcome Home, Cuz',map:'Bazaar',type:'elim',goal:6,maxAlive:2,foe:{name:'Training Cone',sk:11,w:0,hp:60,skill:.2,dmgK:.5},dmgK:.45,s3:{t:'time',v:100},xp:300,tut:1,
  pre:[['M','Cuz! You made it. Welcome back to Cuzzo City.'],['M','Bad news first: a gang called the Static Crew is taking over every arena in town.'],['M','Good news: you\'re here. Let\'s shake off the rust. Knock down six of my training cones.']],
  post:[['M','Still got it! Wait... those weren\'t my training cones.'],['M','Those were real Cone Heads. The Static Crew is already here.']]},
 {id:'1-2',ch:0,n:'Cones Everywhere',map:'Dustyard',type:'elim',goal:12,maxAlive:3,foe:{name:'Cone Head',sk:11,hp:80,skill:.35},dmgK:.5,s3:{t:'time',v:170},xp:350,unlock:11,
  pre:[['M','The Cone Heads are the Static Crew\'s foot soldiers. They\'re raiding the Dustyard market.'],['C','They took my food truck keys! And my lunch!'],['M','Clear them out. Twelve of them. Watch your back.']],
  post:[['C','My truck is safe! But... my recipe book is gone.'],['M','You earned something: the Cone Head outfit is yours.']]},
 {id:'1-3',ch:0,n:'The Secret Sauce',map:'Yardline',type:'collect',goal:5,item:'page',maxAlive:3,foe:{name:'Cone Head',sk:11,hp:90,skill:.4},dmgK:.55,s3:{t:'time',v:170},xp:400,
  pre:[['C','My secret sauce recipe! Five pages, scattered all over the Yardline.'],['M','Why would a gang want a sauce recipe?'],['C','Because it\'s the best sauce in the city, obviously. Get them back, cuz!']],
  post:[['C','All five pages! A little crispy around the edges, but readable.'],['M','They smell like burnt toast. I know exactly who did this.']]},
 {id:'1-4',ch:0,n:'Toasty Gets Burnt',map:'Neon Alley',type:'boss',boss:{name:'Toasty',sk:12,w:2,hp:900,skill:.7,scale:1.3,spdK:1.1},adds:{name:'Cone Head',sk:11,hp:80,skill:.4},maxAlive:2,dmgK:.55,s3:{t:'time',v:150},xp:600,unlock:12,
  pre:[['M','Toasty. Static Crew lieutenant. A real hothead. Literally.'],['T','Ding! Your toast is done, cousin!'],['M','He hits hard up close with that shotgun. Keep your distance and keep moving.']],
  mid:[['T','Cone Heads! Butter this guy up!'],['T','I\'m getting... a little crispy...']],
  post:[['T','Okay, okay! I just work for Saltbeard! He pays in gold coins!'],['M','Saltbeard? The pirate? Since when do pirates run gangs?'],['M','Toasty dropped his outfit. It\'s yours now.']]},
 {id:'2-1',ch:1,n:'Off the Rails',map:'Rail Yard',type:'survive',time:90,maxAlive:4,foe:{name:'Deckhand',sk:13,hp:90,skill:.45},dmgK:.6,s3:{t:'kills',v:12},xp:450,
  pre:[['M','Saltbeard\'s crew is unloading something at the Rail Yard. Crates and crates of it.'],['C','Is it sauce?'],['M','It\'s robot parts, Chef. And they\'ve spotted you, cuz. Hold out for 90 seconds until I get there!']],
  post:[['M','Made it! Sorry, traffic.'],['M','Those crates were all stamped "PROPERTY OF BOLT". Who\'s Bolt?']]},
 {id:'2-2',ch:1,n:'Camp Cuzzo',map:'Lakeside Camp',type:'defend',time:100,maxAlive:4,ally:{name:'Chef',sk:15,w:2,hp:500},foe:{name:'Deckhand',sk:13,hp:90,skill:.45},dmgK:.6,s3:{t:'allyhp',v:50},xp:500,
  pre:[['C','I\'m hiding at Lakeside Camp. Totally safe. Nobody will ever find... oh no.'],['M','They\'re coming for Chef! Keep him alive for 100 seconds!']],
  post:[['C','I knew you\'d come. I grilled you a burger. It got shot a little.'],['M','That was close. Saltbeard really wants that recipe.']]},
 {id:'2-3',ch:1,n:'Pipe Dreams',map:'Rust Refinery',type:'hold',zones:3,hold:14,maxAlive:4,foe:{name:'Deckhand',sk:13,hp:100,skill:.5},dmgK:.6,s3:{t:'time',v:210},xp:550,
  pre:[['M','Saltbeard is refueling his ship at the Refinery. Shut down the three valves.'],['M','Stand in each valve zone until it\'s yours. They\'ll try to push you off.']],
  post:[['M','Fuel\'s cut. His ship isn\'t going anywhere.'],['M','Which means he\'s coming to us.']]},
 {id:'2-4',ch:1,n:'Captain Saltbeard',map:'Frostpeak',type:'boss',boss:{name:'Capt. Saltbeard',sk:13,w:3,hp:1100,skill:.75,scale:1.35,spdK:1},adds:{name:'Deckhand',sk:13,hp:90,skill:.5},maxAlive:3,dmgK:.6,s3:{t:'time',v:200},xp:800,unlock:13,
  pre:[['S','Yarr! Ye drained me fuel, so I sailed straight into a snowbank!'],['M','He\'s got a sniper rifle and a lot of angry deckhands. Use the trees for cover.']],
  mid:[['S','All hands! Repel the boarder!'],['S','Ye fight like a whole navy, ye scallywag!']],
  post:[['S','Fine! Bolt promised me a robot crew that never asks for pay!'],['S','The machine is building copies of every fighter in town!'],['M','Copies...? Cuz. Bolt is copying US.'],['M','Saltbeard\'s outfit is yours. Try not to sail it into a snowbank.']]},
 {id:'3-1',ch:2,n:'Blackout',map:'Downtown',type:'collect',goal:6,item:'cell',maxAlive:4,foe:{name:'Static Copy',sk:14,hp:100,skill:.55},dmgK:.65,s3:{t:'time',v:220},xp:650,
  pre:[['M','Bolt\'s copies run on power cells. Six of them are stashed around Downtown.'],['C','And then we unplug him? Like a toaster?'],['M','Exactly like a toaster.']],
  post:[['M','That\'s all six. The copies are going dark...'],['M','Except the ones at the Graveyard. Bolt has a backup generator.']]},
 {id:'3-2',ch:2,n:'Graveyard Shift',map:'Graveyard',type:'survive',time:120,maxAlive:5,foe:{name:'Static Copy',sk:-1,hp:100,skill:.55},dmgK:.65,s3:{t:'kills',v:18},xp:700,
  pre:[['M','Bolt\'s backup generator is in the Graveyard. Of course it is.'],['C','Why is it always a graveyard?'],['M','Hold the line for two minutes while I hack it. The copies look like us, so don\'t get confused.']],
  post:[['M','Generator\'s down! Bolt is falling back to the Colosseum.'],['M','This ends tonight.']]},
 {id:'3-3',ch:2,n:'Last Stand',map:'Colosseum',type:'elim',goal:25,maxAlive:5,allies:[{name:'Martin',sk:9,w:1,hp:400},{name:'Chef',sk:15,w:2,hp:400}],foe:{name:'Static Copy',sk:-1,hp:100,skill:.6},dmgK:.65,s3:{t:'time',v:240},xp:800,
  pre:[['M','Every copy Bolt has left is in the Colosseum.'],['C','I brought snacks. And a shotgun.'],['M','We fight together this time, cuz.']],
  post:[['B','IMPRESSIVE.'],['B','INITIATING... BOLT-9000.']]},
 {id:'3-4',ch:2,n:'BOLT-9000',map:'Colosseum',type:'boss',boss:{name:'BOLT-9000',sk:14,w:1,hp:1700,skill:.8,scale:1.5,spdK:1.05},adds:{name:'Static Copy',sk:-1,hp:100,skill:.55},maxAlive:3,dmgK:.65,s3:{t:'time',v:240},xp:1200,unlock:14,
  pre:[['B','I HAVE COPIED EVERY FIGHTER IN CUZZO CITY. EXCEPT ONE.'],['M','Him. You never copied my cousin.'],['B','ERROR. PREPARING TO FIX ERROR.']],
  mid:[['B','DEPLOYING COPIES. ALL OF THEM.'],['B','WARNING: BATTERY LOW. ANGER HIGH.']],
  post:[['B','SYSTEM... SHUTTING... down... can I have a burger?'],['C','...Fine. One burger.'],['M','Cuzzo City is ours again. Welcome home, cuz.'],['M','And Bolt\'s outfit? All yours. You beat the campaign!']]}
];
const CAMP={m:null,st:null,view:'list',sel:0};
const campSave=()=>{PROG.camp=PROG.camp||{};PROG.camp.m=PROG.camp.m||{};return PROG.camp.m};
const misDone=id=>!!campSave()[id];
const misOpen=i=>i===0||misDone(MIS[i-1].id);
const totalStars=()=>MIS.reduce((a,m)=>a+((campSave()[m.id]||{}).s||0),0);
function s3Text(m){const s=m.s3;return s.t==='time'?'Finish in under '+fmtT(s.v):s.t==='kills'?'Get '+s.v+' eliminations':s.t==='allyhp'?'Keep '+(m.ally?m.ally.name:'your ally')+' above '+s.v+'% health':''}
function objText(m){return m.type==='elim'?'Eliminate '+m.goal+' '+(m.foe.name)+'s':m.type==='collect'?'Collect '+m.goal+' '+(m.item==='page'?'recipe pages':'power cells'):m.type==='survive'?'Survive for '+m.time+' seconds':m.type==='defend'?'Keep '+m.ally.name+' alive for '+m.time+' seconds':m.type==='hold'?'Capture '+m.zones+' valve zones':'Defeat '+m.boss.name}
const fmtT=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
// head-and-shoulders portraits cut from the outfit pictures
const HEADP={};function headPic(i){if(HEADP[i])return HEADP[i];const src=SKP[i];if(!src)return '';const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');const k=im.width/300;g.drawImage(im,65*k,4*k,170*k,170*k,0,0,96,96);HEADP[i]=c.toDataURL('image/png')}catch(e){}};im.src=src;return src}
(function warm(){if(typeof booted==='undefined'||!booted||!SKP.length){setTimeout(warm,300);return}SK.forEach((s,i)=>headPic(i))})();
const portrait=k=>{const w=WHO[k];const i=w[1]<0?me.sk:w[1];return headPic(i)};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---------- menu screens ----------
function campOpen(){if(room||go)return;CAMP.view='list';step('camp');campRender()}
function campRender(){const el=$('s-camp');if(!el)return;const v=CAMP.view;
 if(v==='list'){let h='<div class="chead"><button class="alt" id="cpback">&#9664; Back</button><div><b>&#9733; Campaign</b><small>'+totalStars()+' / '+MIS.length*3+' stars</small></div></div>';
  CH.forEach((c,ci)=>{h+='<h2>Chapter '+(ci+1)+' &middot; '+esc(c.n)+'</h2><p class="cdesc">'+esc(c.d)+'</p><div class="mgrid">';
   MIS.forEach((m,i)=>{if(m.ch!==ci)return;const sv=campSave()[m.id]||{},open=misOpen(i);
    h+='<button class="mcard'+(open?'':' lock')+(sv.s?' done':'')+'" data-i="'+i+'"'+(open?'':' disabled')+'><img src="'+(m.type==='boss'?headPic(m.boss.sk):portrait(m.pre[0][0]))+'"><span><small>'+m.id+(m.type==='boss'?' &middot; BOSS':'')+'</small><b>'+esc(m.n)+'</b><i>'+(open?'★'.repeat(sv.s||0)+'<u>'+'★'.repeat(3-(sv.s||0))+'</u>':'\u{1F512} Locked')+'</i></span></button>'});h+='</div>'});
  el.innerHTML=h;$('cpback').onclick=()=>step('main');el.querySelectorAll('.mcard').forEach(b=>b.onclick=()=>{CAMP.sel=+b.dataset.i;CAMP.view='brief';campRender();if(typeof sfx==='function')sfx('click',{vol:.3})})}
 else if(v==='brief'){const m=MIS[CAMP.sel],sv=campSave()[m.id]||{};
  el.innerHTML='<div class="chead"><button class="alt" id="cpback">&#9664; Missions</button><div><b>'+m.id+' &middot; '+esc(m.n)+'</b><small>Chapter '+(m.ch+1)+': '+esc(CH[m.ch].n)+' &middot; '+esc(m.map)+'</small></div></div>'+
   '<div class="story">'+m.pre.map(l=>dlg(l)).join('')+'</div>'+
   '<div class="card brief"><h2>Objective</h2><b class="obj">'+esc(objText(m))+'</b><h2>Stars</h2><ul class="stars"><li class="'+(sv.s1?'got':'')+'">★ Complete the mission</li><li class="'+(sv.s2?'got':'')+'">★ Die once at most</li><li class="'+(sv.s3?'got':'')+'">★ '+esc(s3Text(m))+'</li></ul>'+
   '<small class="rew">Reward: '+Math.round(m.xp*.75)+' XP'+(m.unlock!=null?' + the '+esc(SK[m.unlock].n)+' outfit':'')+(sv.t?' &middot; best time '+fmtT(sv.t):'')+'</small></div>'+
   '<button id="cpgo" class="big wide">&#9654; Start mission</button>';
  $('cpback').onclick=()=>{CAMP.view='list';campRender()};$('cpgo').onclick=()=>campStart(CAMP.sel);animDlg(el)}
 else if(v==='result'){const R=CAMP.res,m=MIS[R.i];
  el.innerHTML='<div class="cres '+(R.ok?'ok':'bad')+'"><small>'+m.id+' &middot; '+esc(m.n)+'</small><b>'+(R.ok?'MISSION COMPLETE':'MISSION FAILED')+'</b>'+
   (R.ok?'<div class="bigstars">'+[1,2,3].map(k=>'<i class="'+(R['s'+k]?'on':'')+'" style="animation-delay:'+(k*.25)+'s">★</i>').join('')+'</div>':'<p>'+esc(R.why||'')+'</p>')+
   '<div class="rstats"><span>Time <b>'+fmtT(R.t)+'</b></span><span>Eliminations <b>'+R.k+'</b></span><span>Deaths <b>'+R.d+'</b></span>'+(R.ok?'<span>XP <b>+'+R.xp+'</b></span>':'')+'</div>'+
   (R.unl!=null?'<div class="unl"><img src="'+SKP[R.unl]+'"><span><small>NEW OUTFIT UNLOCKED</small><b>'+esc(SK[R.unl].n)+'</b></span></div>':'')+'</div>'+
   (R.ok?'<div class="story">'+m.post.map(l=>dlg(l)).join('')+'</div>':'')+
   '<div class="row cbtns">'+(R.ok&&R.i+1<MIS.length?'<button id="cpnext" class="big">Next mission &#9654;</button>':'')+(R.ok&&R.i+1>=MIS.length?'<button id="cpnext" class="big">Campaign complete! &#9733;</button>':'')+'<button id="cpre" class="'+(R.ok?'alt':'big')+'">'+(R.ok?'Replay':'Try again')+'</button><button id="cpls" class="alt">Missions</button></div>';
  const nx=$('cpnext');if(nx)nx.onclick=()=>{if(R.i+1<MIS.length){CAMP.sel=R.i+1;CAMP.view='brief'}else CAMP.view='list';campRender()};
  $('cpre').onclick=()=>campStart(R.i);$('cpls').onclick=()=>{CAMP.view='list';campRender()};animDlg(el)}
 else if(v==='pause'){const m=MIS[CAMP.st?CAMP.st.i:0];el.innerHTML='<div class="chead"><div><b>Paused</b><small>'+m.id+' &middot; '+esc(m.n)+'</small></div></div><div class="card brief"><h2>Objective</h2><b class="obj">'+esc(objText(m))+'</b></div>'+
   '<button id="cpres" class="big wide">&#9654; Resume</button><div class="row cbtns"><button id="cpre2" class="alt">Restart mission</button><button id="cpquit" class="alt">Quit mission</button></div>';
  $('cpres').onclick=()=>enter();$('cpre2').onclick=()=>{const i=CAMP.st.i;campStop();campStart(i)};$('cpquit').onclick=()=>{campStop();CAMP.view='list';step('camp');campRender()}}}
function dlg(l){const w=WHO[l[0]];return '<div class="dl'+(l[0]==='Y'?' me':'')+'"><img src="'+portrait(l[0])+'"><div><b>'+esc(w[0])+'</b><span>'+esc(l[1])+'</span></div></div>'}
function animDlg(el){el.querySelectorAll('.story .dl').forEach((d,i)=>{d.style.animationDelay=(i*.35)+'s'})}
// ---------- running a mission ----------
function mapByName(n){const i=MAPS.findIndex(M=>M.n===n);return i<0?0:i}
function campStart(i){const m=MIS[i];if(!m||room)return;if(go)campStop();
 practice=true;isHost=true;me.id='h';gm=0;BOTS.list=[];
 const st=CAMP.st={i,m,t:0,k:0,d:0,spawned:0,elim:0,over:false,items:[],zones:[],zi:0,zp:0,boss:null,phase:0,ally:null,allies:[],spawnT:1.5,radio:[],radT:0,start:performance.now(),dmgK:m.dmgK,minAllyHp:1,tick:0};
 BOTS.camp=st;document.body.classList.add('camp');
 loadMap(mapByName(m.map));$('big').textContent='SOLO';
 step('camp');CAMP.view='pause';campRender();
 renderLobby();$('go').disabled=false;$('go').click();// starts the match (and locks the mouse) inside this click
 me.kills=0;me.deaths=0;
 // allies
 const at=[me.x,me.z];
 if(m.ally){const a=botAdd({name:m.ally.name,sk:m.ally.sk,w:m.ally.w,hp:m.ally.hp,fac:0,skill:.6,respawn:false,spawn:[at[0]+2,at[1]+2],guard:[at[0]+2,at[1]+2,2.5]});st.ally=a;st.allyMax=m.ally.hp}
 (m.allies||[]).forEach((o,k)=>{const a=botAdd({name:o.name,sk:o.sk,w:o.w,hp:o.hp,fac:0,skill:.65,respawn:false,spawn:[at[0]+(k?-2:2),at[1]+2],guard:[at[0],at[1],5],follow:me});st.allies.push(a)});
 if(m.type==='collect')campItems(m);if(m.type==='hold')campZones(m);
 if(m.type==='boss'){const b=m.boss;st.boss=botAdd({name:b.name,sk:b.sk,w:b.w,hp:b.hp,fac:1,skill:b.skill,scale:b.scale,spdK:b.spdK,respawn:false,boss:true,hunt:me,spawn:farSpawn(30,90)});st.bossMax=b.hp}
 if(m.tut)setTimeout(()=>{if(CAMP.st===st)radio([['M',(document.body.classList.contains('touch')?'Left thumb to move, right thumb to look, tap FIRE to shoot.':'WASD to move, mouse to aim, left click to shoot, R to reload.')]])},2500);
 radio([['M',objText(m)+'!']]);campHud();if(typeof sfx==='function')sfx('streak',{vol:.35})}
function campStop(){const st=CAMP.st;if(st){st.items.forEach(o=>scene.remove(o.g));st.zones.forEach(o=>scene.remove(o.g))}CAMP.st=null;document.body.classList.remove('camp');$('obj').style.display='none';$('bossbar').style.display='none';$('wps').innerHTML='';$('radio').classList.remove('on');
 if(go||practice){try{leave()}catch(e){console.error(e)}}BOTS.camp=null}
function farSpawn(min,max){const C=spawns.map(s=>[s,Math.hypot(s[0]-me.x,s[1]-me.z)]);let L=C.filter(c=>c[1]>=min&&c[1]<=max);if(!L.length)L=C.filter(c=>c[1]>=min*.6);if(!L.length)L=C;const s=L[Math.random()*L.length|0][0];return[s[0],s[1]]}
function foeSkin(f){if(f.sk>=0)return f.sk;return [9,15,0,1,4,8,2,3,5,7,10][Math.random()*11|0]}
function spawnFoe(f,o){const st=CAMP.st;st.spawned++;const isCopy=f.sk<0;const sk=foeSkin(f);
 return botAdd(Object.assign({name:(isCopy?'Copy of '+(SK[sk].n.split(' ')[0]):f.name),sk,w:f.w,hp:f.hp,fac:1,skill:Math.min(.95,f.skill+(st.m.ch*.04)),respawn:false,hunt:st.m.type==='defend'&&st.ally&&Math.random()<.6?st.ally:me,prefer:st.m.type==='defend'?st.ally:null,spawn:farSpawn(24,75)},o||{}))}
// pickups: recipe pages or power cells, each with a tall light beam you can see from far away
function campItems(m){const st=CAMP.st;const used=[];for(let k=0;k<m.goal;k++){let best=null,bd=-1;for(let t=0;t<30;t++){const s=spawns[Math.random()*spawns.length|0];const d0=Math.hypot(s[0]-me.x,s[1]-me.z);if(d0<14)continue;let md=1e9;for(const u of used)md=Math.min(md,Math.hypot(u[0]-s[0],u[1]-s[1]));if(md>bd){bd=md;best=s}}
  if(!best)best=spawns[k%spawns.length];used.push(best);const p=safeSpot(best[0]+(Math.random()-.5)*4,best[1]+(Math.random()-.5)*4),y=groundAt(p[0],p[1],Hf(p[0],p[1])+30);
  const g=new THREE.Group(),page=m.item==='page';
  const it=page?new THREE.Mesh(new THREE.BoxGeometry(.5,.66,.03),new THREE.MeshStandardMaterial({color:0xfff6dc,emissive:0x7a6a30,roughness:.8})):new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.6,14),new THREE.MeshStandardMaterial({color:0x3fd16a,emissive:0x1f9a4a,roughness:.4,metalness:.3}));
  if(page){const ln=new THREE.Mesh(new THREE.BoxGeometry(.36,.04,.035),new THREE.MeshBasicMaterial({color:0xb03a2a}));ln.position.y=.2;it.add(ln);for(let q=0;q<4;q++){const l2=new THREE.Mesh(new THREE.BoxGeometry(.34,.02,.035),new THREE.MeshBasicMaterial({color:0x8a8070}));l2.position.y=.08-q*.09;it.add(l2)}}
  else{const cap=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.08,14),new THREE.MeshStandardMaterial({color:0xcfd6dc,metalness:.6,roughness:.3}));cap.position.y=.33;it.add(cap);const cap2=cap.clone();cap2.position.y=-.33;it.add(cap2)}
  it.position.y=1.1;g.add(it);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,26,12,1,true),new THREE.MeshBasicMaterial({color:page?0xffd23f:0x3fd16a,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));beam.position.y=13;g.add(beam);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.7,.9,28),new THREE.MeshBasicMaterial({color:page?0xffd23f:0x3fd16a,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;g.add(ring);
  g.position.set(p[0],y,p[1]);scene.add(g);st.items.push({g,it,x:p[0],y,z:p[1],got:0})}}
// capture zones
function campZones(m){const st=CAMP.st;const pts=[];for(let k=0;k<m.zones;k++){let best=null,bd=-1;for(let t=0;t<40;t++){const s=spawns[Math.random()*spawns.length|0];const d0=Math.hypot(s[0]-me.x,s[1]-me.z);if(d0<12&&k===0)continue;let md=k?Math.hypot(s[0]-pts[k-1][0],s[1]-pts[k-1][1]):40;if(md<18)continue;md=Math.min(md,...pts.map(u=>Math.hypot(u[0]-s[0],u[1]-s[1])));if(md>bd){bd=md;best=s}}
  if(!best)best=spawns[(k*3)%spawns.length];pts.push(best);const y=Hf(best[0],best[1]);const g=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.08,40,1,true),new THREE.MeshBasicMaterial({color:0x5ab8ff,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));disc.scale.y=20;disc.position.y=.8;g.add(disc);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(4,40),new THREE.MeshBasicMaterial({color:0x5ab8ff,transparent:true,opacity:.18,depthWrite:false}));fl.rotation.x=-Math.PI/2;fl.position.y=.06;g.add(fl);
  const valve=new THREE.Mesh(new THREE.TorusGeometry(.45,.08,8,20),new THREE.MeshStandardMaterial({color:0xd0463a,metalness:.4,roughness:.5}));valve.position.y=1.3;g.add(valve);const post=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1.3,8),new THREE.MeshStandardMaterial({color:0x8a8f96,metalness:.5}));post.position.y=.65;g.add(post);
  g.position.set(best[0],groundAt(best[0],best[1],y+20),best[1]);g.visible=k===0;scene.add(g);st.zones.push({g,disc,fl,valve,x:best[0],z:best[1],p:0,done:0})}}
// someone in the mission was eliminated (called by js/bots.js)
function campBotDied(p,from,hs){const st=CAMP.st;if(!st||st.over)return;
 if(p.fac===1){st.elim++;if(from===me.id)st.k++;setTimeout(()=>{if(players[p.id])botRemove(p,1)},1500);
  if(st.boss===p){campWin();return}
  if(st.m.type==='elim'&&st.elim>=st.m.goal)campWin()}
 else if(p.fac===0){if(st.ally===p){campFail(p.name+' was eliminated.');return}
  // a friend went down: back in a few seconds
  setTimeout(()=>{if(CAMP.st===st&&players[p.id]&&!st.over){p.rt.hp=p.maxhp;botRespawn(p);p.spawnAt=null;const s=safeSpot(me.x+2,me.z+2);p.rt.x=s[0];p.rt.z=s[1];p.rt.y=groundAt(s[0],s[1],me.y+2)}},5000);radio([[p.name==='Martin'?'M':'C','I\'m down! Back in five!']])}}
// boss health thresholds: call for help
function bossHurt(p){const st=CAMP.st;if(!st||p!==st.boss)return;const f=p.rt.hp/st.bossMax;
 if(st.phase===0&&f<.66){st.phase=1;if(st.m.mid)radio([st.m.mid[0]]);for(let k=0;k<3;k++)spawnFoe(st.m.adds);p.spdK*=1.08}
 else if(st.phase===1&&f<.33){st.phase=2;if(st.m.mid)radio([st.m.mid[1]]);for(let k=0;k<4;k++)spawnFoe(st.m.adds);p.spdK*=1.1;p.skill=Math.min(.95,p.skill+.08)}}
function campTick(dt){const st=CAMP.st;if(!st||!go)return;const paused=!document.pointerLockElement;st.paused=paused;if(st.over)return;
 // death counter (the death screen in js/juice.js respawns you)
 if(me.dwait>0&&!st.dead){st.dead=1;st.d++}else if(!(me.dwait>0))st.dead=0;
 if(paused)return;st.t+=dt;const m=st.m;
 // keep the pressure on: spawn enemies up to the limit
 const alive=BOTS.list.filter(b=>b.fac===1&&!b.dead&&b!==st.boss).length;st.spawnT-=dt;
 let want=m.maxAlive;if(m.type==='survive'||m.type==='defend')want=Math.min(m.maxAlive+2,m.maxAlive+Math.floor(st.t/35));
 if(m.type==='elim')want=Math.min(m.maxAlive,m.goal-st.elim);if(m.type==='boss')want=st.phase?m.maxAlive+1:Math.max(1,m.maxAlive-1);
 if(alive<want&&st.spawnT<=0&&!(m.type==='elim'&&st.spawned>=m.goal)){st.spawnT=m.type==='elim'?1.2:m.type==='boss'?4:2.2;spawnFoe(m.foe||m.adds)}
 // objectives
 if(m.type==='collect'){for(const o of st.items){if(o.got)continue;o.it.rotation.y+=dt*2;o.it.position.y=1.1+Math.sin(st.t*3+o.x)*.12;
   if(!me.dwait&&Math.hypot(me.x-o.x,me.z-o.z)<1.6&&Math.abs(me.y-o.y)<2.5){o.got=1;scene.remove(o.g);if(typeof sfx==='function')sfx('kill',{vol:.5,rate:1.3});const n=st.items.filter(q=>q.got).length;feed((m.item==='page'?'Recipe page':'Power cell')+' '+n+'/'+m.goal,0);if(n>=m.goal){campWin();return}}}}
 if((m.type==='survive'||m.type==='defend')&&st.t>=m.time){campWin();return}
 if(m.type==='defend'&&st.ally){st.minAllyHp=Math.min(st.minAllyHp,st.ally.rt.hp/st.allyMax)}
 if(m.type==='hold'){const z=st.zones[st.zi];if(z){const inside=!me.dwait&&me.hp>0&&Math.hypot(me.x-z.x,me.z-z.z)<4&&Math.abs(me.y-z.g.position.y)<4;
   const foes=BOTS.list.some(b=>b.fac===1&&!b.dead&&Math.hypot(b.rt.x-z.x,b.rt.z-z.z)<4);
   if(inside&&!foes)z.p=Math.min(1,z.p+dt/m.hold);else if(!inside)z.p=Math.max(0,z.p-dt/(m.hold*3));
   z.valve.rotation.z+=dt*(inside&&!foes?4:0);z.disc.material.color.set(inside?(foes?0xffa53a:0x6cc04a):0x5ab8ff);z.fl.material.color.copy(z.disc.material.color);st.contested=inside&&foes;
   if(z.p>=1){z.done=1;z.g.visible=false;st.zi++;if(typeof sfx==='function')sfx('streak',{vol:.45});feed('Valve '+st.zi+' of '+m.zones+' shut',0);if(st.zones[st.zi])st.zones[st.zi].g.visible=true;else{campWin();return}}}}
 campHud();campWaypoints()}
// ---------- HUD for missions ----------
{const h=$('hud');[['obj',''],['bossbar',''],['wps',''],['radio','']].forEach(([id])=>{const d=document.createElement('div');d.id=id;h.appendChild(d)})}
function campHud(){const st=CAMP.st;if(!st)return;const m=st.m,o=$('obj');o.style.display='block';let prog='',bar=-1;
 if(m.type==='elim'){prog=st.elim+' / '+m.goal;bar=st.elim/m.goal}else if(m.type==='collect'){const n=st.items.filter(q=>q.got).length;prog=n+' / '+m.goal;bar=n/m.goal}
 else if(m.type==='survive'||m.type==='defend'){prog=fmtT(Math.max(0,m.time-st.t))+' left';bar=st.t/m.time}
 else if(m.type==='hold'){const z=st.zones[st.zi];prog='Valve '+Math.min(m.zones,st.zi+1)+' / '+m.zones+(st.contested?' · CONTESTED':'');bar=z?z.p:1}
 else if(m.type==='boss')prog='';
 const ally=m.type==='defend'&&st.ally?'<div class="oa"><span>'+esc(st.ally.name)+'</span><div class="ob"><i style="width:'+Math.max(0,st.ally.rt.hp/st.allyMax*100).toFixed(0)+'%;background:'+(st.ally.rt.hp/st.allyMax>.5?'#6cc04a':'#e5534b')+'"></i></div></div>':'';
 const k=m.id+'|'+prog+'|'+(bar*50|0)+'|'+ally+'|'+Math.floor(st.t)+'|'+st.d;if(o._k!==k){o._k=k;
  o.innerHTML='<small>'+m.id+' &middot; '+esc(m.n)+'</small><b>'+esc(objText(m))+'</b>'+(prog?'<span>'+prog+'</span>':'')+(bar>=0?'<div class="ob"><i style="width:'+(bar*100).toFixed(0)+'%"></i></div>':'')+ally+'<em>'+fmtT(st.t)+(st.d?' · '+st.d+' death'+(st.d>1?'s':''):'')+'</em>'}
 const bb=$('bossbar');if(st.boss&&!st.boss.dead){bb.style.display='block';const f=Math.max(0,st.boss.rt.hp/st.bossMax);const kk=(f*200|0);if(bb._k!==kk){bb._k=kk;bb.innerHTML='<b>'+esc(st.boss.name)+'</b><div class="bb"><i style="width:'+(f*100).toFixed(1)+'%"></i></div>'}}else bb.style.display='none'}
// markers on screen pointing at the objective
const _wp=new V();
function campWaypoints(){const st=CAMP.st,el=$('wps');const T=[];
 if(st.m.type==='collect')st.items.forEach(o=>{if(!o.got)T.push([o.x,o.y+1.4,o.z,st.m.item==='page'?'#ffd23f':'#3fd16a'])});
 if(st.m.type==='hold'){const z=st.zones[st.zi];if(z)T.push([z.x,z.g.position.y+2,z.z,'#5ab8ff'])}
 if(st.m.type==='defend'&&st.ally&&!st.ally.dead)T.push([st.ally.rt.x,st.ally.rt.y+2.6,st.ally.rt.z,'#6cc04a']);
 if(st.boss&&!st.boss.dead&&st.t>2)T.push([st.boss.rt.x,st.boss.rt.y+2.4*st.boss.sc,st.boss.rt.z,'#e5534b']);
 while(el.children.length<T.length){const d=document.createElement('div');d.innerHTML='<i></i><small></small>';el.appendChild(d)}while(el.children.length>T.length)el.lastChild.remove();
 const W=innerWidth,H=innerHeight;T.forEach((t,i)=>{const d=el.children[i];_wp.set(t[0],t[1],t[2]);const dist=Math.hypot(t[0]-me.x,t[2]-me.z);_wp.project(cam);let x=(_wp.x+1)/2*W,y=(1-_wp.y)/2*H;const behind=_wp.z>1;
  if(behind){x=W-x;y=H-y}const m=40,off=behind||x<m||x>W-m||y<m||y>H-m;if(off){const cx=W/2,cy=H/2,dx=x-cx,dy=y-cy,s=Math.min((W/2-m)/Math.abs(dx||1e-6),(H/2-m)/Math.abs(dy||1e-6));if(behind||s<1){x=cx+dx*Math.min(1,s);y=cy+dy*Math.min(1,s)}}
  d.style.transform='translate('+x.toFixed(0)+'px,'+y.toFixed(0)+'px)';d.style.setProperty('--c',t[3]);d.className=off?'off':'';d.querySelector('small').textContent=Math.round(dist)+'m'})}
// radio messages: portrait, name and a line of text at the bottom of the screen
function radio(lines){const st=CAMP.st;if(!st)return;st.radio.push(...lines);if(!st.radT)radioNext()}
function radioNext(){const st=CAMP.st,el=$('radio');if(!st){el.classList.remove('on');return}const l=st.radio.shift();if(!l){st.radT=0;el.classList.remove('on');return}
 el.innerHTML='<img src="'+portrait(l[0])+'"><div><b>'+esc(WHO[l[0]][0])+'</b><span>'+esc(l[1])+'</span></div>';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
 st.radT=setTimeout(radioNext,Math.max(2600,l[1].length*55))}
// ---------- the end of a mission ----------
function campWin(){const st=CAMP.st;if(!st||st.over)return;st.over=true;const m=st.m,sv=campSave(),old=sv[m.id]||{};
 const s1=1,s2=st.d<=1?1:0,s3=m.s3.t==='time'?(st.t<=m.s3.v?1:0):m.s3.t==='kills'?(st.k>=m.s3.v?1:0):m.s3.t==='allyhp'?(st.minAllyHp*100>=m.s3.v?1:0):0;
 const nw={s1:old.s1||s1,s2:old.s2||s2,s3:old.s3||s3,t:old.t?Math.min(old.t,Math.round(st.t)):Math.round(st.t),done:1};nw.s=nw.s1+nw.s2+nw.s3;
 const newStars=nw.s-(old.s||0),first=!old.done;let xp=Math.round((first?m.xp:m.xp*.35)*.75)+newStars*60;sv[m.id]=nw;
 let unl=null;if(m.unlock!=null&&!skinOK(m.unlock)){unlockSkin(m.unlock);unl=m.unlock}
 progEvent('mission',{xp,newStars,id:m.id});progSave(1);
 CAMP.res={ok:1,i:st.i,s1,s2,s3,t:st.t,k:st.k,d:st.d,xp,unl};campEnd(true)}
function campFail(why){const st=CAMP.st;if(!st||st.over)return;st.over=true;CAMP.res={ok:0,i:st.i,why,t:st.t,k:st.k,d:st.d};campEnd(false)}
function campEnd(ok){ending=true;banner(ok?'MISSION COMPLETE':'MISSION FAILED',ok);if(typeof sfx==='function')sfx(ok?'lvl':'deny',{vol:.5,jit:0});
 const st=CAMP.st;setTimeout(()=>{if(CAMP.st!==st)return;banner();campStop();CAMP.view='result';step('camp');campRender();$('menu').style.display='flex';if(document.pointerLockElement)document.exitPointerLock()},3200)}
// pause screen inside a mission
function onStep(n){document.body.classList.toggle('incamp',n==='camp')}
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&CAMP.st&&go&&!CAMP.st.over){CAMP.view='pause';step('camp');campRender()}});
// menu button
{const b=$('campb');if(b)b.onclick=()=>{if(typeof sfx==='function')sfx('click',{vol:.3});campOpen()}}
function campMenuInfo(){const s=$('campst');if(!s||!PROG)return;const i=MIS.findIndex((m,k)=>!misDone(m.id));s.textContent=i<0?'All missions done · '+totalStars()+'/'+MIS.length*3+' ★':'Next: '+MIS[i].id+' '+MIS[i].n}
(function loop(){let last=performance.now();setInterval(()=>{const t=performance.now(),dt=Math.min(.1,(t-last)/1000);last=t;try{campTick(dt)}catch(e){console.error(e)}},33)})();
setInterval(()=>{if(!go)campMenuInfo()},1000);
