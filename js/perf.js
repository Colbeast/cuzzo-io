// ===== Graphics quality (Settings > Graphics) =====
// Low:    lower resolution, no shadows, no grass / clouds / falling snow, short view distance, simple lighting,
//         minimap redrawn every other frame
// Medium: native resolution (capped at 1x), cheaper 1024 hard-edged shadows, everything else on
// High:   up to 1.5x resolution on sharp screens, soft 2048 shadows, antialiasing
// Auto:   starts on Low for phones, tablets and weak computers and Medium otherwise, then keeps an eye on the
//         frame rate: if the game drops under ~40 fps it lowers the resolution a step at a time, and if that
//         is not enough it drops to the next quality level.
const GQ=[
 {n:'Low',pr:.7,prMax:1,sh:0,ms:512,gr:0,cl:0,lite:1,farA:240,farO:320,fogA:175,fogO:280},
 {n:'Medium',pr:1,prMax:1,sh:1,ms:1024,soft:0,gr:1,cl:1},
 {n:'High',pr:1,prMax:1.5,sh:1,ms:2048,soft:1,gr:1,cl:1}];
let GFX=GFX0,DRS=1,PERF=GFX===0,SHMS=GQ[GFX].ms;
const gfxAuto=()=>GFXS==='auto';

// software renderers and the weakest mobile / integrated GPUs start on Low even when the CPU looks fine
try{const gl=ren.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):'';
 if(gfxAuto()&&GFX>0&&/swiftshader|llvmpipe|software|mali-[47]|adreno \(tm\) [345]|powervr|intel\(r\) hd graphics( [2-5]|$)|gma/i.test(gpu)){GFX=0;PERF=true;SHMS=GQ[0].ms}}catch(e){}

// simple lighting for Low: the world's PBR materials are swapped for Lambert (much cheaper per pixel on weak GPUs)
const LITE=new Map();
function liteMat(m){if(!m||!m.isMeshStandardMaterial)return m;let q=LITE.get(m);if(q)return q;
 q=new THREE.MeshLambertMaterial({color:m.color,map:m.map,vertexColors:m.vertexColors,emissive:m.emissive,emissiveIntensity:m.emissiveIntensity,emissiveMap:m.emissiveMap,
  transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,depthWrite:m.depthWrite,fog:m.fog});q.userData.std=m;LITE.set(m,q);return q}
function liteWorld(on){if(typeof world==='undefined'||!world)return;LITE.clear();
 world.traverse(o=>{if(!o.isMesh||!o.material)return;const a=Array.isArray(o.material);const L=a?o.material:[o.material];
  const n=L.map(m=>on?liteMat(m):(m&&m.userData&&m.userData.std)||m);o.material=a?n:n[0]})}

function gfxPR(){const q=GQ[GFX];return Math.max(.4,Math.min(devicePixelRatio||1,q.prMax)*q.pr*DRS)}
function gfxSize(){ren.setPixelRatio(gfxPR());ren.setSize(innerWidth,innerHeight)}
function perfWorld(){if(typeof world==='undefined'||!world)return;const M=MAPS[mapIdx],u=world.userData,q=GQ[GFX];
 if(u.gr)u.gr.visible=!!q.gr;if(u.cl)u.cl.visible=!!q.cl;if(u.snow)u.snow.visible=!!q.cl;
 const far=M.far||420,fog=M.fog,fogN=M.fogN||30,big=(M.sz||66)>600;
 cam.far=q.farA?Math.min(far,big?q.farO:q.farA):far;cam.updateProjectionMatrix();
 if(typeof skyM!=='undefined'&&skyM)skyM.scale.setScalar(Math.min(1,cam.far*.9/300));// the sky dome is 300m across; keep it inside the view distance or it clips to black
 scene.fog.far=q.fogA?Math.min(fog,big?q.fogO:q.fogA):fog;scene.fog.near=q.fogA?Math.min(fogN,scene.fog.far*.35):fogN;
 if(typeof lamps!=='undefined')lamps.forEach(l=>{if(!l.isDirectionalLight)return;l.castShadow=!!q.sh;
  if(l.shadow.mapSize.x!==q.ms){l.shadow.mapSize.set(q.ms,q.ms);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null}}});
 liteWorld(!!q.lite)}
let gfxShadowKey='';
function perfApply(){const q=GQ[GFX];PERF=GFX===0;SHMS=q.ms;gfxSize();
 const key=(q.sh?1:0)+'|'+(q.soft?1:0);
 if(key!==gfxShadowKey){gfxShadowKey=key;ren.shadowMap.enabled=!!q.sh;ren.shadowMap.type=q.soft?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
 perfWorld();gfxUI()}
function gfxUI(){const s=$('perfm');if(s)s.value=GFXS;const h=$('perfh');if(!h)return;
 const aa=GFX>=2,aaNow=GFX0>=2;
 h.textContent=(gfxAuto()?'Auto is using '+GQ[GFX].n+(DRS<1?' at '+Math.round(DRS*100)+'% resolution':'')+'. ':'')+
  'Low = fastest (no shadows, grass or clouds, shorter view). Medium = balanced. High = soft shadows, sharper image and antialiasing.'+
  (aa!==aaNow?' Antialiasing '+(aa?'turns on':'turns off')+' the next time you load the page.':'')}
{const s=$('perfm');if(s){s.innerHTML='<option value="auto">Auto (recommended)</option><option value="0">Low - fastest</option><option value="1">Medium</option><option value="2">High - best looking</option>';
 s.onchange=()=>{GFXS=s.value;try{localStorage.setItem('cf_gfx',GFXS);localStorage.removeItem('cf_perf')}catch(e){}
  DRS=1;GFX=gfxAuto()?(WEAKDEV?0:1):+GFXS;perfApply();feed('Graphics: '+(gfxAuto()?'Auto ('+GQ[GFX].n+')':GQ[GFX].n))}}}
{document.querySelectorAll('#ctb .sr span').forEach(e=>{if(/Performance mode/.test(e.textContent))e.textContent='Graphics quality'})}

// Auto: watch the frame rate during a match and step the resolution / quality down if the game is struggling,
// and the resolution back up once there is headroom again
{let acc=0,n=0,lt=0,hi=0;
 const tick=t=>{requestAnimationFrame(tick);
  if(!gfxAuto()||!go||document.hidden){lt=0;acc=n=hi=0;return}
  if(lt){const dt=t-lt;if(dt>0&&dt<250){acc+=dt;n++}}lt=t;if(acc<2500)return;
  const fps=1000*n/acc;acc=n=0;
  if(fps<40){if(DRS>.62){DRS=Math.max(.6,DRS*.85);gfxSize();gfxUI()}else if(GFX>0){GFX--;DRS=1;perfApply();feed('Lowered graphics to '+GQ[GFX].n+' to keep the game smooth')}hi=0}
  else if(fps>56&&DRS<1){if(++hi>=2){DRS=Math.min(1,DRS/.85);gfxSize();gfxUI();hi=0}}
  else hi=0};
 requestAnimationFrame(tick)}
addEventListener('resize',()=>gfxSize());
perfApply();
