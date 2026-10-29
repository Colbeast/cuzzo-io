// ===== Menu: your character in 3D, turning slowly on a little stand (drag to spin it) =====
// Uses its own small canvas and only draws while the main menu is on screen. Weak devices (Low graphics
// at start) just show the picture instead.
let pvSkin=null;
(function(){const cv=$('pvc');if(!cv)return;if(typeof GFX0!=='undefined'&&GFX0===0){cv.style.display='none';return}
 let r;try{r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'low-power'})}catch(e){cv.style.display='none';return}
 r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.setSize(220,260,false);r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.15;r.shadowMap.enabled=true;
 const sc=new THREE.Scene(),cm=new THREE.PerspectiveCamera(30,220/260,.1,50);cm.position.set(0,1.55,5.6);cm.lookAt(0,1.05,0);
 sc.add(new THREE.HemisphereLight(0xdfe8ff,0x3a2f28,.9));const d=new THREE.DirectionalLight(0xfff2dc,1.6);d.position.set(2.5,5,4);d.castShadow=true;d.shadow.mapSize.set(512,512);
 const c=d.shadow.camera;c.left=c.bottom=-2;c.right=c.top=2;c.near=1;c.far=15;sc.add(d);const rim=new THREE.DirectionalLight(0xf0b23c,1.1);rim.position.set(-3,2.5,-3);sc.add(rim);
 // stand
 const st=new THREE.Mesh(new THREE.CylinderGeometry(.95,1.05,.16,40),new THREE.MeshStandardMaterial({color:0x23272c,roughness:.6,metalness:.3}));st.position.y=-.08;st.receiveShadow=true;sc.add(st);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.0,.025,8,60),new THREE.MeshBasicMaterial({color:0xf0b23c}));ring.rotation.x=Math.PI/2;ring.position.y=.005;sc.add(ring);
 const R=mkRobot();R.g.traverse(o=>{if(o.isMesh)o.castShadow=true});sc.add(R.g);let sk=-1;
 pvSkin=i=>{if(i===sk)return;sk=i;try{applySkin(R,i)}catch(e){}};pvSkin(me.sk||0);
 R.guns.forEach((g,i)=>g.visible=i===1);R.arms.rotation.x=Math.PI/2-.35;
 cv.style.display='block';const img=$('skpic');if(img)img.classList.add('under');
 // drag to turn
 let rot=.5,vel=0,drag=null;cv.addEventListener('pointerdown',e=>{drag=e.clientX;cv.setPointerCapture(e.pointerId)});
 cv.addEventListener('pointermove',e=>{if(drag==null)return;const dx=e.clientX-drag;drag=e.clientX;rot+=dx*.015;vel=dx*.015});
 const up=()=>{drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 let last=0,acc=0;
 (function loop(t){requestAnimationFrame(loop);const dt=Math.min(.1,(t-last)/1000);last=t;acc+=dt;if(acc<1/30)return;const a=acc;acc=0;
  if(go||cv.offsetParent===null)return;// not on screen
  if(me.sk!==sk)pvSkin(me.sk);
  if(drag==null){vel*=.9;rot+=vel+a*.35}const s=Math.sin(t/900);
  R.g.rotation.y=rot;R.g.position.y=0;R.head.rotation.x=Math.sin(t/1700)*.08;R.head.rotation.y=Math.sin(t/2300)*.25;R.arms.rotation.x=Math.PI/2-.35+s*.03;
  R.legs[0].rotation.x=R.legs[1].rotation.x=0;R.g.scale.y=1+s*.006;
  r.render(sc,cm)})(0)})();
