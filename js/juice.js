// ===== Game feel: sound effects, hit and kill feedback, kill streaks, damage direction, death screen, effects =====
// All sounds are generated in code (no audio files) and go through one AudioContext, so the CrazyGames
// mute setting (which pauses that AudioContext) silences everything.
// ---------------------------------------------------------------------------------------------------------
// ---------- sound ----------
const SFX={buf:{},master:null,ok:false};
const sfxMuted=()=>typeof CG!=='undefined'&&(CG.muteSdk||CG.muteAd);
function sfxCtx(){if(sfxMuted())return null;try{ac=ac||new AudioContext()}catch(e){return null}
 if(!SFX.master){SFX.master=ac.createGain();SFX.master.gain.value=.5;const c=ac.createDynamicsCompressor();c.threshold.value=-14;c.ratio.value=4;SFX.master.connect(c);c.connect(ac.destination);sfxBuild()}
 return ac}
// build every sound once, sample by sample
function mkBuf(dur,fn){const sr=ac.sampleRate,n=Math.max(1,Math.floor(dur*sr)),b=ac.createBuffer(1,n,sr),d=b.getChannelData(0);let st={lp:0,lp2:0,ph:0,ph2:0};for(let i=0;i<n;i++)d[i]=fn(i/sr,st,sr);
 let mx=0;for(let i=0;i<n;i++)mx=Math.max(mx,Math.abs(d[i]));if(mx>0)for(let i=0;i<n;i++)d[i]*=.95/mx;return b}
function gunBuf(o){return mkBuf(o.dur,(t,s,sr)=>{const n=Math.random()*2-1;s.lp+=(n-s.lp)*o.lp;s.lp2+=(s.lp-s.lp2)*Math.min(1,o.lp*1.6);
  const body=s.lp*Math.exp(-t*o.dec)*1.0,tail=s.lp2*Math.exp(-t*o.tail)*o.tailA,crack=t<.006?n*(1-t/.006)*o.crack:0;
  const f=o.f1+(o.f0-o.f1)*Math.exp(-t*30);s.ph+=f/sr*6.283;const thump=Math.sin(s.ph)*Math.exp(-t*o.td)*o.ta;
  return body+tail+crack+thump})}
function toneBuf(dur,notes,type,dec){return mkBuf(dur,(t,s,sr)=>{let v=0;for(const[f,t0,a]of notes){if(t<t0)continue;const u=t-t0,p=u*f*6.283;const w=type==='sq'?Math.sign(Math.sin(p))*.5:type==='tri'?Math.asin(Math.sin(p))*.64:Math.sin(p)+Math.sin(p*2)*.25;v+=w*Math.exp(-u*(dec||9))*(a||1)*Math.min(1,u*400)}return v})}
function sfxBuild(){const G=(k,o)=>SFX.buf[k]=gunBuf(o);
 G('pistol',{dur:.45,lp:.32,dec:20,tail:6,tailA:.18,crack:.8,f0:190,f1:55,td:22,ta:.7});
 G('heavy',{dur:.6,lp:.28,dec:14,tail:5,tailA:.22,crack:.9,f0:150,f1:45,td:16,ta:.9});
 G('rifle',{dur:.36,lp:.42,dec:26,tail:7,tailA:.16,crack:.7,f0:170,f1:50,td:26,ta:.6});
 G('smg',{dur:.24,lp:.5,dec:34,tail:10,tailA:.12,crack:.6,f0:200,f1:60,td:34,ta:.45});
 G('shotgun',{dur:.75,lp:.22,dec:10,tail:4,tailA:.25,crack:.9,f0:110,f1:38,td:11,ta:1.1});
 G('sniper',{dur:1.3,lp:.55,dec:12,tail:2.6,tailA:.3,crack:1.2,f0:95,f1:32,td:8,ta:1});
 G('quiet',{dur:.16,lp:.12,dec:40,tail:30,tailA:.05,crack:.1,f0:300,f1:120,td:40,ta:.25});
 SFX.buf.ray=mkBuf(.32,(t,s,sr)=>{const f=2200*Math.exp(-t*9)+260;s.ph+=f/sr*6.283;return Math.sin(s.ph)*Math.exp(-t*7)*.8+Math.sign(Math.sin(s.ph*.5))*.15*Math.exp(-t*12)});
 SFX.buf.hit=mkBuf(.09,(t,s,sr)=>{s.ph+=2600/sr*6.283;return(Math.sin(s.ph)*.7+(Math.random()*2-1)*.35*Math.exp(-t*90))*Math.exp(-t*55)});
 SFX.buf.hs=toneBuf(.45,[[2093,0,1],[3136,0,.6],[4186,.0,.25]],'sine',11);
 SFX.buf.kill=toneBuf(.6,[[880,0,.8],[1318.5,.07,1],[1760,.07,.35]],'sine',7);
 SFX.buf.streak=toneBuf(.9,[[523.3,0,.8],[659.3,.09,.8],[784,.18,.8],[1046.5,.27,1]],'tri',5);
 SFX.buf.hurt=mkBuf(.3,(t,s,sr)=>{const n=Math.random()*2-1;s.lp+=(n-s.lp)*.08;s.ph+=(110*Math.exp(-t*6)+40)/sr*6.283;return(s.lp*1.5+Math.sin(s.ph)*.8)*Math.exp(-t*14)});
 SFX.buf.reload=mkBuf(.5,(t,s,sr)=>{const c=(t0)=>t>t0&&t<t0+.03?(Math.random()*2-1)*Math.exp(-(t-t0)*160):0;s.ph+=1800/sr*6.283;return c(0)+c(.22)*1.2+Math.sin(s.ph)*.25*(t>.22&&t<.26?Math.exp(-(t-.22)*80):0)});
 SFX.buf.ready=mkBuf(.12,(t,s,sr)=>{const n=Math.random()*2-1;return n*Math.exp(-t*120)+Math.sin(t*2400*6.283)*.3*Math.exp(-t*60)});
 SFX.buf.lvl=toneBuf(1.4,[[523.3,0,.7],[659.3,.12,.7],[784,.24,.7],[1046.5,.36,.9],[1318.5,.52,1],[1568,.52,.5]],'tri',3.2);
 SFX.buf.click=toneBuf(.08,[[1400,0,.7]],'sine',60);
 SFX.buf.step=mkBuf(.12,(t,s,sr)=>{const n=Math.random()*2-1;s.lp+=(n-s.lp)*.12;s.ph+=(70+40*Math.exp(-t*40))/sr*6.283;return(s.lp*1.4+Math.sin(s.ph)*.5)*Math.exp(-t*38)});
 SFX.buf.land=mkBuf(.25,(t,s,sr)=>{const n=Math.random()*2-1;s.lp+=(n-s.lp)*.07;s.ph+=(60*Math.exp(-t*8)+30)/sr*6.283;return(s.lp*1.6+Math.sin(s.ph))*Math.exp(-t*16)});
 SFX.buf.whoosh=mkBuf(.5,(t,s)=>{const n=Math.random()*2-1;s.lp+=(n-s.lp)*(.02+.2*Math.sin(Math.PI*t/.5));return s.lp*Math.sin(Math.PI*t/.5)*2});
 SFX.buf.deny=toneBuf(.35,[[196,0,1],[155.6,.12,1]],'sq',8);
 SFX.ok=true}
function sfx(name,o){const c=sfxCtx();if(!c||!SFX.ok)return;const b=SFX.buf[name];if(!b)return;o=o||{};
 try{const src=c.createBufferSource();src.buffer=b;src.playbackRate.value=(o.rate||1)*(o.jit===0?1:1+(Math.random()-.5)*.08);
  let n=src;if(o.lp&&o.lp<18000){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;n.connect(f);n=f}
  const g=c.createGain();g.gain.value=o.vol==null?1:o.vol;n.connect(g);n=g;
  if(o.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));n.connect(p);n=p}
  n.connect(SFX.master);src.start()}catch(e){}}
const GUNSND={0:'pistol',1:'rifle',2:'shotgun',3:'sniper',4:'pistol',7:'heavy',10:'quiet',11:'ray',17:'heavy',18:'smg'};
function gunSound(w){const n=GUNSND[w];if(!n)return false;sfx(n,{vol:.85});return true}
// a shot somewhere in the world: quieter and duller with distance, panned left/right
function shotSound(x,y,z,w){const n=GUNSND[w]||'rifle',p=cam.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz,y-p.y);if(d>150)return;
 const yaw=Math.atan2(-dx,-dz)-camYaw(),pan=-Math.sin(yaw)*Math.min(1,d/6)*.8;
 sfx(n,{vol:Math.min(.75,1.6/(1+d/9)),lp:d<8?20000:Math.max(700,15000*Math.exp(-d/45)),pan})}
function camYaw(){const v=new V();cam.getWorldDirection(v);return Math.atan2(-v.x,-v.z)}
// ---------- screen shake ----------
let SHK=0;function shake(a){SHK=Math.min(.6,Math.max(SHK,a))}
let ROLL=0;
{const r0=ren.render.bind(ren);ren.render=function(s,c){if(c===cam&&go&&(SHK>0.001||Math.abs(ROLL)>.0005)&&!(me.dwait>0)&&!me.car&&!me.bus){const q=cam.quaternion.clone(),k=SHK*SHK*.05;
  cam.rotateZ(ROLL);if(SHK>0.001){cam.rotation.x+=(Math.random()-.5)*k;cam.rotation.y+=(Math.random()-.5)*k;cam.rotation.z+=(Math.random()-.5)*k*.6}r0(s,c);cam.quaternion.copy(q)}else r0(s,c)}}
// ---------- HUD bits added by this file ----------
{const h=$('hud');const add=(id,cls)=>{const d=document.createElement('div');d.id=id;if(cls)d.className=cls;h.appendChild(d);return d};
 add('lowhp');add('dmgdir');add('kpop');add('medal');add('dscr');add('xpbar').innerHTML='<i></i>'}
// ---------- when you hit someone ----------
function onHit(p,d,hs){sfx(hs?'hs':'hit',{vol:hs?.55:.5,jit:0,rate:hs?1:1+Math.min(.3,d/200)});const h=$('hm');h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop');
 if(typeof impactFx==='function'){const r=p.rt;impactFx(new V(r.x,r.y+(hs?1.9:1.1)*(p.sc||1),r.z),null,hs?0xffd23f:0xffffff,7)}}
// ---------- kills and streaks ----------
const STK={n:0,multi:0,lastK:0};
const MEDALS={2:'DOUBLE KILL',3:'TRIPLE KILL',4:'QUAD KILL',5:'MEGA KILL'},SPREE={3:'ON FIRE',5:'KILLING SPREE',8:'RAMPAGE',10:'UNSTOPPABLE',15:'LEGENDARY'};
function onMyKill(m){const now=performance.now(),v=st(m.v);STK.n++;STK.multi=now-STK.lastK<4500?STK.multi+1:1;STK.lastK=now;
 sfx('kill',{vol:.6,jit:0});shake(.12);const h=$('hm');h.classList.remove('kill');void h.offsetWidth;h.classList.add('kill');
 let xp=60+(m.hs?15:0),tags=[];if(m.hs)tags.push('HEADSHOT');
 const medal=MEDALS[Math.min(5,STK.multi)]||'',spree=SPREE[STK.n]||'';if(medal){xp+=25*(STK.multi-1);tags.push(medal)}if(spree){xp+=40;tags.push(spree)}
 if(typeof BOTS!=='undefined'&&BOTS.camp)xp=Math.round(xp*.4);kpop((v?v.name:'?'),xp,m.hs);if(medal||spree)showMedal(spree||medal,medal&&spree?medal:'');
 if(typeof progEvent==='function')progEvent('kill',{xp,hs:!!m.hs,victim:v,streak:STK.n,multi:STK.multi,w:me.w})}
function kpop(name,xp,hs){const k=$('kpop'),d=document.createElement('div');d.className='kp';
 d.innerHTML='<b>'+(hs?'<em>HEADSHOT</em> ':'')+'ELIMINATED</b><span></span><i>+'+xp+' XP</i>';d.querySelector('span').textContent=name;
 k.prepend(d);while(k.children.length>3)k.lastChild.remove();setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),400)},2200)}
function showMedal(t,sub){const m=$('medal');m.innerHTML='<b></b>'+(sub?'<small></small>':'');m.querySelector('b').textContent=t;if(sub)m.querySelector('small').textContent=sub;
 m.classList.remove('on');void m.offsetWidth;m.classList.add('on');sfx('streak',{vol:.5,jit:0});clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove('on'),2000)}
// kill feed lines: "Killer [weapon] Victim", yours highlighted
function killFeed(kl,v,hs,src){const d=document.createElement('div');const mine=kl===me,dead=v===me;d.className='kf'+(mine?' mine':'')+(dead?' bad':'');
 const a=document.createElement('b'),c=document.createElement('b');a.textContent=src==='storm'?'The storm':src==='lava'?'Lava':kl?kl.name:'?';c.textContent=v?v.name:'?';
 const ic=document.createElement('i');ic.className=hs?'hs':'';ic.innerHTML=hs?'<svg viewBox="0 0 20 20" width="15" height="15"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 1v5M10 14v5M1 10h5M14 10h5" stroke="currentColor" stroke-width="2"/></svg>':'<svg viewBox="0 0 24 14" width="20" height="12"><path d="M1 4h13l3-3h6v6h-4l-2 2h-3l-1 4H9l1-4H1z" fill="currentColor"/></svg>';d.append(a,ic,c);$('feed').appendChild(d);while($('feed').children.length>6)$('feed').firstChild.remove();setTimeout(()=>d.remove(),5000)}
// ---------- getting hurt ----------
function hurtFrom(x,z){const el=document.createElement('i'),a=Math.atan2(x-me.x,z-me.z),y=Math.atan2(-Math.sin(me.yaw),-Math.cos(me.yaw));
 el.style.transform='rotate('+(-(a-y)*180/Math.PI+180).toFixed(1)+'deg)';$('dmgdir').appendChild(el);setTimeout(()=>el.remove(),1100)}
{const d0=dmg;dmg=function(m){const hp0=me.hp,r=d0.apply(this,arguments);if(me.hp<hp0){shake(.22);const s=m&&m.f!=null?st(m.f):null;if(s&&s!==me&&s.rt)hurtFrom(s.rt.x,s.rt.z)}return r}}
// ---------- death screen with a look at who got you, then respawn ----------
const DW={k:null,t:0,x:0,y:0,z:0,cy:0,cp:0};
function deathWait(k,hs){me.dwait=2.8;me.hp=0;DW.k=k;DW.x=me.x;DW.y=me.y;DW.z=me.z;DW.cy=me.yaw;DW.cp=me.pitch;STK.n=0;STK.multi=0;down=false;
 const kl=k&&k!=='storm'&&k!=='lava'?st(k):null,d=$('dscr');
 d.innerHTML='<div class="dk">'+(kl&&kl!==me?'ELIMINATED BY':'ELIMINATED')+'</div><div class="dn2"></div><div class="dsub"></div><div class="drb"><i></i></div><small>Respawning...</small>';
 d.querySelector('.dn2').textContent=kl&&kl!==me?kl.name:k==='storm'?'The storm':k==='lava'?'Lava':'';
 if(kl&&kl!==me&&kl.rt)d.querySelector('.dsub').textContent=(hs?'Headshot · ':'')+(WP[kl.rt.w]?WP[kl.rt.w].n:'')+' · '+Math.max(0,Math.round(kl.rt.hp))+' HP left';
 d.classList.add('on');sfx('whoosh',{vol:.5});if(typeof progEvent==='function')progEvent('death',{k})}
function deathCam(dt){const kl=DW.k?st(DW.k):null,p=new V(DW.x,DW.y+1.7,DW.z);let tgt=null;if(kl&&kl!==me&&kl.rt)tgt=new V(kl.rt.x,kl.rt.y+1.3,kl.rt.z);
 const u=1-Math.max(0,me.dwait)/2.8,back=new V(-Math.sin(DW.cy),0,-Math.cos(DW.cy));
 const want=p.clone().addScaledVector(back,-2.5*u).add(new V(0,1.2+2.2*u,0));cam.position.lerp(want,Math.min(1,dt*4));
 if(tgt){const m=new THREE.Matrix4().lookAt(cam.position,tgt,new V(0,1,0)),q=new THREE.Quaternion().setFromRotationMatrix(m);cam.quaternion.slerp(q,Math.min(1,dt*5))}
 else{cam.rotation.x+=(-.6-cam.rotation.x)*Math.min(1,dt*2)}}
{const s0=send;send=function(m){if(m&&m.t==='p'&&me.dwait>0)m.bs=1;return s0.apply(this,arguments)}}
{const dm0=diedMsg;diedMsg=function(){if(!ELIM())return;return dm0.apply(this,arguments)}}
{const r0=respawn;respawn=function(){const out=r0.apply(this,arguments);me.spT=performance.now();me.dwait=0;$('dscr').classList.remove('on');return out}}
// ---------- particles: sparks and dust where bullets land ----------
const PTN=240,ptPos=new Float32Array(PTN*3),ptCol=new Float32Array(PTN*3),PT=[];let ptI=0;
const ptGeo=new THREE.BufferGeometry();ptGeo.setAttribute('position',new THREE.BufferAttribute(ptPos,3));ptGeo.setAttribute('color',new THREE.BufferAttribute(ptCol,3));
const ptMat=new THREE.PointsMaterial({size:.09,vertexColors:true,transparent:true,depthWrite:false,sizeAttenuation:true}),ptObj=new THREE.Points(ptGeo,ptMat);ptObj.frustumCulled=false;scene.add(ptObj);
for(let i=0;i<PTN;i++){PT.push({t:9,life:1,v:new V()});ptPos[i*3+1]=-9999}
const _pc=new THREE.Color();
function impactFx(p,n,col,cnt){cnt=cnt||8;for(let k=0;k<cnt;k++){const i=ptI=(ptI+1)%PTN,q=PT[i];q.t=0;q.life=.25+Math.random()*.35;
  q.v.set((Math.random()-.5)*5,Math.random()*4+1,(Math.random()-.5)*5);if(n)q.v.addScaledVector(n,-3);
  ptPos[i*3]=p.x;ptPos[i*3+1]=p.y;ptPos[i*3+2]=p.z;_pc.set(col!=null?(k%3?col:0xffe7a0):(k%2?0xffcf5a:0x9c968c));ptCol[i*3]=_pc.r;ptCol[i*3+1]=_pc.g;ptCol[i*3+2]=_pc.b}}
function ptTick(dt){let any=false;for(let i=0;i<PTN;i++){const q=PT[i];if(q.t>=q.life){if(ptPos[i*3+1]>-9000){ptPos[i*3+1]=-9999;any=true}continue}q.t+=dt;q.v.y-=14*dt;
  ptPos[i*3]+=q.v.x*dt;ptPos[i*3+1]+=q.v.y*dt;ptPos[i*3+2]+=q.v.z*dt;any=true}if(any)ptGeo.attributes.position.needsUpdate=true,ptGeo.attributes.color.needsUpdate=true}
// ---------- muzzle flash: a bright star and a quick flash of light ----------
{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fffbe8');gr.addColorStop(.25,'#ffd970');gr.addColorStop(.6,'#ff8a2066');gr.addColorStop(1,'#ff6a0000');
 g.fillStyle=gr;g.fillRect(0,0,64,64);g.globalCompositeOperation='lighter';g.strokeStyle='#ffe9a8';g.lineWidth=3;for(let a=0;a<4;a++){g.beginPath();const t=a*Math.PI/4+.3;g.moveTo(32-Math.cos(t)*30,32-Math.sin(t)*30);g.lineTo(32+Math.cos(t)*30,32+Math.sin(t)*30);g.stroke()}
 const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,transparent:true}));
 sp.scale.set(.32,.32,1);sp.renderOrder=10;flashM.material.visible=false;flashM.add(sp);window.MFS=sp;
 if(GFX0>0){const L=new THREE.PointLight(0xffc870,0,9,2);L.position.set(0,0,-.2);flashM.add(L);window.MFL=L}}
// ---------- every frame ----------
const J={sx:0,sy:0,gr:1,fall:0,ph:0};const bAngJ=a=>Math.atan2(Math.sin(a),Math.cos(a));
let jLast=0;(function jt(t){requestAnimationFrame(jt);const rdt=Math.min(.5,Math.max(0,(t-jLast)/1000)),dt=Math.min(.05,rdt);jLast=t;try{
 SHK=Math.max(0,SHK-dt*2.2);ptTick(dt);
 if(go&&!me.out){// weapon lags a little behind the camera, the view leans into strafes, landings thump, feet make noise
  const dy=bAngJ(me.yaw-(J.yaw??me.yaw)),dp=me.pitch-(J.pitch??me.pitch);J.yaw=me.yaw;J.pitch=me.pitch;
  J.sx+=(Math.max(-.08,Math.min(.08,-dy*1.2))-J.sx)*Math.min(1,dt*10);J.sy+=(Math.max(-.06,Math.min(.06,dp*1.2))-J.sy)*Math.min(1,dt*10);
  vm.rotation.y=J.sx;vm.rotation.z=J.sx*.6;if(!(me.rl>0))vm.rotation.x=J.sy;
  const lk=!!document.pointerLockElement,st=lk&&typeof held_==='function'?(held_('right')?1:0)-(held_('left')?1:0):0;ROLL+=(-st*.012-ROLL)*Math.min(1,dt*8);
  const gr=Math.abs(me.vy)<.01;if(gr&&!J.gr&&J.fall<-9){shake(Math.min(.35,(-J.fall-9)*.03+.12));sfx('land',{vol:.5})}J.gr=gr;J.fall=me.vy<0?Math.min(J.fall,me.vy):0;if(gr)J.fall=0;
  const ph=Math.floor(bob/Math.PI);if(ph!==J.ph){J.ph=ph;if(gr&&lk&&!me.swim)sfx('step',{vol:me.sprint?.32:.2,rate:.9+Math.random()*.25})}}
 if(window.MFS){const on=flashM.visible;if(on){MFS.material.rotation=Math.random()*6.28;const s=.24+Math.random()*.18;MFS.scale.set(s,s,1)}if(window.MFL)MFL.intensity=on?2.2:0}
 const low=go&&!me.out&&me.hp>0&&me.hp<35&&!(me.dwait>0);$('lowhp').style.opacity=low?(.55+.25*Math.sin(t/180)).toFixed(2):'0';
 if(me.dwait>0){if(!go||ending){me.dwait=0;$('dscr').classList.remove('on')}else{me.dwait-=rdt;const b=$('dscr').querySelector('.drb i');if(b)b.style.width=Math.min(100,(1-me.dwait/2.8)*100)+'%';if(me.dwait<=0){respawn();sfx('ready',{vol:.4})}}}
}catch(e){console.error(e)}})(0);
