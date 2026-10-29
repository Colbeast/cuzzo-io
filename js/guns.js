// ===== First-person weapon models =====
// More detailed versions of the guns you hold in first person (other players still see the simple ones,
// which are tiny on screen). Same size and grip position as the originals, so hands and aiming line up.
(function(){
 const M={},mat=(k,c,ro,me,em)=>M[k]||(M[k]=new THREE.MeshStandardMaterial({color:c,roughness:ro,metalness:me,emissive:em||0}));
 const GM=()=>mat('gm',0x50565f,.45,.22),GL=()=>mat('gl',0xaab2bb,.35,.3),PO=()=>mat('po',0x33363c,.72,.05),PO2=()=>mat('po2',0x4a4f57,.68,.06),
  WD=()=>mat('wd',0x9a5e33,.62,0),WD2=()=>mat('wd2',0x6e4020,.65,0),BR=()=>mat('br',0xd9b04f,.35,.35),OR=()=>mat('or',0xff8a2a,.5,0,0x8a3a00),
  GR=()=>mat('gr',0x3fd16a,.4,0,0x1f8a3a),RD=()=>mat('rd',0xff3a2a,.3,0,0xff2010),LN=()=>mat('ln',0x5ab8ff,.1,.2,0x0a2a4a),TN=()=>mat('tn',0x7d7b55,.7,.04);
 function G(){const g=new THREE.Group();g.userData.mz=-.32;return g}
 function B(g,w,h,d,m,x,y,z,rx,ry,rz){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx||ry||rz)o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o}
 function C(g,r,len,m,x,y,z,seg,r2){const o=new THREE.Mesh(new THREE.CylinderGeometry(r2!=null?r2:r,r,len,seg||14),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o}
 // shared parts
 function guard(g,y,z0,z1){B(g,.05,.01,z1-z0,PO(),0,y,(z0+z1)/2);B(g,.05,.04,.012,PO(),0,y+.02,z0);B(g,.012,.035,.012,GM(),0,y+.018,(z0+z1)/2+.005,-.3)}
 function grip(g,y,z,h,col,rake){const o=B(g,.062,h||.15,.075,col||PO(),0,y,z,rake==null?.22:rake);for(let k=0;k<4;k++)B(o,.064,.008,.06,PO2(),0,-.04+k*.025,0);return o}
 function pistol(o){o=o||{};const g=G(),sl=o.slide||GM();
  B(g,.07,.068,.31,sl,0,.025,-.155);// slide
  for(let k=0;k<5;k++){B(g,.072,.05,.006,PO(),0,.025,-.015-k*.014)}// rear serrations
  B(g,.072,.012,.06,PO(),0,.025,-.2);// ejection port
  B(g,.066,.045,.25,o.frame||PO(),0,-.03,-.135);// frame
  B(g,.04,.012,.12,PO2(),0,-.056,-.2);// rail
  C(g,.015,.03,GM(),0,.03,-.315);C(g,.009,.032,PO(),0,.03,-.317);// barrel tip
  guard(g,-.08,-.14,-.06);grip(g,-.12,-.005,.16,o.grip);
  B(g,.068,.016,.08,PO(),0,-.205,.012,.22);// magazine base
  B(g,.014,.018,.014,GM(),0,.067,-.29);B(g,.006,.006,.004,OR(),0,.072,-.298);// front sight + dot
  B(g,.05,.016,.014,GM(),0,.066,-.02);B(g,.012,.017,.016,PO(),0,.067,-.02);// rear sight
  B(g,.02,.012,.03,GM(),0,.05,.0,.5);// hammer
  g.userData.mz=-.33;return g}
 function rifle(){const g=G();
  B(g,.08,.1,.36,GM(),0,0,-.15);B(g,.084,.03,.09,PO(),0,.01,-.13);// receiver + ejection port cover
  B(g,.032,.018,.5,PO(),0,.06,-.28);for(let k=0;k<12;k++)B(g,.036,.008,.012,PO2(),0,.072,-.06-k*.04);// top rail
  B(g,.078,.088,.3,PO2(),0,-.005,-.48);for(let k=0;k<5;k++)B(g,.08,.012,.04,PO(),0,-.005,-.37-k*.055);// handguard with vents
  C(g,.016,.24,GM(),0,.0,-.74);B(g,.034,.034,.06,GM(),0,0,-.87);for(let k=0;k<3;k++)B(g,.036,.006,.008,PO(),0,0,-.85-k*.018);// barrel + muzzle brake
  B(g,.02,.05,.02,GM(),0,.05,-.6);// front sight post
  B(g,.05,.05,.1,PO(),0,.1,-.19);C(g,.024,.012,LN(),0,.1,-.245);B(g,.006,.006,.004,RD(),0,.104,-.25);// red dot sight
  B(g,.06,.05,.012,PO(),0,.075,-.15);B(g,.06,.05,.012,PO(),0,.075,-.23);
  B(g,.06,.16,.08,PO(),0,-.12,-.22,-.18);B(g,.06,.1,.075,PO(),0,-.23,-.26,-.35);// curved mag
  guard(g,-.06,-.11,-.02);grip(g,-.11,.0,.13,PO(),.28);
  B(g,.05,.06,.12,GM(),0,.0,.08);B(g,.07,.11,.22,PO2(),0,-.02,.22);B(g,.074,.12,.03,PO(),0,-.025,.33);// buffer tube + stock + butt pad
  g.userData.mz=-.9;return g}
 function shotgun(){const g=G();
  B(g,.075,.095,.26,GM(),0,0,-.1);B(g,.077,.04,.08,PO(),0,.01,-.08);
  C(g,.021,.62,GL(),0,.03,-.52);C(g,.024,.03,GM(),0,.03,-.83);C(g,.018,.48,GM(),0,-.02,-.45);// barrel, muzzle, magazine tube
  B(g,.075,.065,.2,WD(),0,-.022,-.42);for(let k=0;k<6;k++)B(g,.078,.008,.012,WD2(),0,-.022,-.34-k*.03);// pump with grooves
  B(g,.012,.016,.012,BR(),0,.058,-.8);// bead sight
  guard(g,-.065,-.08,.0);grip(g,-.1,.05,.12,WD(),.45);
  B(g,.07,.1,.3,WD(),0,-.05,.2,.08);B(g,.074,.12,.03,PO(),0,-.065,.35,.08);// stock
  g.userData.mz=-.86;return g}
 function sniper(){const g=G();
  B(g,.075,.09,.42,TN(),0,0,-.16);B(g,.07,.07,.5,TN(),0,-.01,-.55);// receiver + forestock
  C(g,.014,.62,GM(),0,.015,-.82);C(g,.022,.1,GM(),0,.015,-1.12);// barrel + suppressor-ish brake
  C(g,.032,.34,PO(),0,.115,-.2);C(g,.042,.07,PO(),0,.115,-.38,14,.034);C(g,.04,.06,PO(),0,.115,-.02,14,.033);C(g,.036,.004,LN(),0,.115,-.418);// scope
  B(g,.03,.045,.03,GM(),0,.06,-.12);B(g,.03,.045,.03,GM(),0,.06,-.28);// scope rings
  B(g,.014,.014,.06,GL(),.05,.03,-.02,0,.8);C(g,.016,.02,GL(),.085,.03,.01);// bolt handle
  guard(g,-.06,-.1,-.02);grip(g,-.11,.02,.12,TN(),.35);
  B(g,.068,.12,.34,TN(),0,-.04,.2);B(g,.05,.04,.16,PO(),0,.04,.18);B(g,.072,.14,.03,PO(),0,-.045,.37);// stock, cheek rest, pad
  B(g,.012,.12,.012,GM(),.03,-.09,-.75,.3);B(g,.012,.12,.012,GM(),-.03,-.09,-.75,.3);// bipod legs folded
  g.userData.mz=-1.18;return g}
 function revolver(){const g=G();
  C(g,.02,.24,GL(),0,.03,-.2);B(g,.03,.012,.22,GL(),0,.052,-.2);// barrel + rib
  C(g,.046,.075,GL(),0,.01,-.04,6);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;C(g,.008,.077,PO(),Math.cos(a)*.03,.01+Math.sin(a)*.03,-.04,8)}// cylinder
  B(g,.05,.07,.1,GL(),0,.0,.03);B(g,.012,.03,.035,GM(),0,.05,.07,.6);// frame + hammer
  B(g,.012,.02,.012,GL(),0,.065,-.3);guard(g,-.055,-.04,.04);grip(g,-.1,.08,.14,WD(),.42);
  g.userData.mz=-.33;return g}
 function smg(){const g=G();
  B(g,.075,.11,.32,PO2(),0,0,-.15);B(g,.077,.03,.08,GM(),0,.03,-.12);B(g,.03,.016,.3,PO(),0,.064,-.15);
  C(g,.018,.14,GM(),0,.01,-.37);B(g,.07,.07,.12,PO(),0,-.03,-.27);// barrel + foregrip block
  B(g,.04,.12,.04,PO(),0,-.11,-.3);// vertical foregrip
  B(g,.05,.2,.06,PO(),0,-.15,-.16,-.08);// straight mag
  guard(g,-.06,-.07,.0);grip(g,-.11,.03,.13,PO(),.3);
  B(g,.016,.02,.016,GM(),0,.08,-.28);B(g,.04,.02,.016,GM(),0,.08,-.03);
  B(g,.02,.02,.2,GM(),.025,.0,.1);B(g,.02,.02,.2,GM(),-.025,.0,.1);B(g,.07,.09,.02,GM(),0,-.02,.2);// folding stock
  g.userData.mz=-.45;return g}
 function silenced(){const g=pistol({slide:mat('sv',0x3a4048,.45,.5)});C(g,.026,.22,PO(),0,.03,-.42);C(g,.027,.012,GM(),0,.03,-.53);g.userData.mz=-.55;return g}
 const MAKE={0:()=>pistol(),1:rifle,2:shotgun,3:sniper,4:()=>pistol({slide:PO(),frame:PO2()}),7:revolver,10:silenced,17:()=>{const g=pistol({slide:mat('hv',0x23262b,.35,.6),grip:WD()});B(g,.072,.012,.31,BR(),0,.06,-.155);g.scale.setScalar(1.12);g.userData.mz=-.37;return g},18:smg};
 for(const k in MAKE){const i=+k;if(!vg[i])continue;const g=MAKE[k]();g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});g.rotation.y=.07;g.rotation.z=-.03;g.visible=vg[i].visible;vm.remove(vg[i]);vm.add(g);vg[i]=g}
 // put the muzzle flash at the end of the barrel
 const s0=setW;setW=function(i){const r=s0.apply(this,arguments);const g=vg[i];flashM.position.set(0,.03,g&&g.userData.mz!=null?g.userData.mz-.05:-1);return r};
 try{setW(me.w)}catch(e){}
})();
