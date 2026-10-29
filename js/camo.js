// ===== Gun skins (camos) =====
// Unlocked by levelling up (and one by beating the campaign). Your gun skin shows on your guns in first
// person and on your character for everyone else in the match. Patterns are drawn in code, no image files.
const CAMOS=[
 {n:'Factory',lv:0},{n:'Woodland',lv:3},{n:'Desert',lv:5},{n:'Arctic',lv:8},{n:'Tiger',lv:11},{n:'Cherry Blossom',lv:14},
 {n:'Neon',lv:17},{n:'Lava',lv:21},{n:'Galaxy',lv:25},{n:'Gold',lv:30},{n:'Diamond',lv:40},{n:'Static',camp:'3-4',d:'Beat BOLT-9000 in the campaign'}];
const camoOK=i=>{const c=CAMOS[i];if(!c)return false;if(c.camp)return !!(PROG&&PROG.camp&&PROG.camp.m&&PROG.camp.m[c.camp]&&PROG.camp.m[c.camp].done);return !!PROG&&PROG.lvl>=c.lv};
const camoReq=i=>{const c=CAMOS[i];return c.camp?c.d:'Reach level '+c.lv};
// ---------- patterns ----------
function camoCanvas(i){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');let s=i*977+13;const R=()=>(s=(s*16807)%2147483647)/2147483647;
 const blobs=(cols,n,r0,r1)=>{for(let k=0;k<n;k++){g.fillStyle=cols[k%cols.length];const x=R()*64,y=R()*64,r=r0+R()*(r1-r0);for(const dx of [-64,0,64])for(const dy of [-64,0,64]){g.beginPath();g.ellipse(x+dx,y+dy,r,r*(.5+R()*.6),R()*3,0,7);g.fill()}}};
 const fill=c0=>{g.fillStyle=c0;g.fillRect(0,0,64,64)};
 switch(i){
  case 1:fill('#56653a');blobs(['#2e3a20','#7a6a42','#1e2414','#3f5a2a'],22,5,11);break;
  case 2:fill('#c9a86a');blobs(['#a8864a','#8a6a3a','#e0c890'],20,5,12);break;
  case 3:fill('#e8eef2');blobs(['#b8c4cc','#8a98a4','#d0d8de'],22,4,10);break;
  case 4:fill('#e8901f');g.fillStyle='#14100c';for(let k=0;k<9;k++){const y=k*8+R()*3;g.beginPath();g.moveTo(-4,y);g.lineTo(30+R()*10,y+2+R()*3);g.lineTo(68,y+R()*2);g.lineTo(68,y+3);g.lineTo(28,y+5);g.lineTo(-4,y+3.5);g.fill()}break;
  case 5:fill('#f4b8cf');for(let k=0;k<16;k++){const x=R()*64,y=R()*64;g.fillStyle=k%3?'#ffffff':'#d9487f';for(let a=0;a<5;a++){g.beginPath();g.arc(x+Math.cos(a*1.257)*2.4,y+Math.sin(a*1.257)*2.4,2,0,7);g.fill()}g.fillStyle='#ffd23f';g.fillRect(x-.8,y-.8,1.6,1.6)}break;
  case 6:fill('#0b0d14');g.lineWidth=1.6;for(let k=0;k<=64;k+=8){g.strokeStyle=k%16?'#ff3ad8':'#2ef2ff';g.beginPath();g.moveTo(k,0);g.lineTo(k,64);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(64,k);g.stroke()}break;
  case 7:fill('#241612');blobs(['#3a2420','#1a0e0a'],14,6,12);g.strokeStyle='#ff7a1a';g.lineWidth=2;for(let k=0;k<10;k++){let x=R()*64,y=R()*64;g.beginPath();g.moveTo(x,y);for(let q=0;q<4;q++){x+=R()*16-8;y+=R()*16-8;g.lineTo(x,y)}g.stroke()}g.strokeStyle='#ffd23f';g.lineWidth=.8;g.stroke();break;
  case 8:{const gr=g.createLinearGradient(0,0,64,64);gr.addColorStop(0,'#1a0b3a');gr.addColorStop(.5,'#3a1a6a');gr.addColorStop(1,'#0b1a4a');g.fillStyle=gr;g.fillRect(0,0,64,64);blobs(['#5a2a9a55','#2a6aaa44'],8,8,16);for(let k=0;k<40;k++){g.fillStyle=k%7?'#ffffff':'#ffd2ff';g.fillRect(R()*64,R()*64,1,1)}break}
  case 9:{const gr=g.createLinearGradient(0,0,64,64);gr.addColorStop(0,'#f6d77a');gr.addColorStop(.5,'#c9962a');gr.addColorStop(1,'#f2cc5a');g.fillStyle=gr;g.fillRect(0,0,64,64);break}
  case 10:fill('#8fe4ff');for(let k=0;k<30;k++){g.fillStyle=['#c9f4ff','#5ac8f0','#ffffff','#7ad8ff'][k%4];g.beginPath();const x=R()*64,y=R()*64;g.moveTo(x,y);g.lineTo(x+R()*14-7,y+R()*14-7);g.lineTo(x+R()*14-7,y+R()*14-7);g.fill()}break;
  case 11:fill('#22262e');g.strokeStyle='#3ad8ff';g.lineWidth=1.5;for(let k=0;k<7;k++){let x=R()*64,y=0;g.beginPath();g.moveTo(x,y);while(y<64){x+=R()*12-6;y+=6+R()*6;g.lineTo(x,y)}g.stroke()}break;
  default:fill('#5a5f66')}
 return c}
const CTEX={},CMAT={},CPIC={};
function camoMat(i){if(CMAT[i])return CMAT[i];const t=new THREE.CanvasTexture(camoCanvas(i));t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;CTEX[i]=t;
 const glow={6:1,7:1,8:.35,11:.8}[i]||0,o={map:t,roughness:i===9?.28:i===10?.15:.55,metalness:i===9?.85:i===10?.35:.12};if(glow){o.emissive=0xffffff;o.emissiveMap=t;o.emissiveIntensity=glow}
 return CMAT[i]=new THREE.MeshStandardMaterial(o)}
function camoPic(i){return CPIC[i]||(CPIC[i]=camoCanvas(i).toDataURL())}
// dark parts (barrels, grips, sights) keep their own colour so the gun still reads as a gun
function camoDark(m){if(!m||!m.color)return true;const c=m.color;const l=.2126*c.r+.7152*c.g+.0722*c.b;return l<.012}
function applyCamo(root,i){if(!root)return;root.traverse(m=>{if(!m.isMesh||Array.isArray(m.material)||m.userData.ns||m.isSprite)return;if(m.userData.om===undefined)m.userData.om=m.material;const om=m.userData.om;
 m.material=(!i||!CAMOS[i]||camoDark(om))?om:camoMat(i)})}
// ---------- your gun skin ----------
me.gc=0;try{if(PROG&&camoOK(PROG.gc|0))me.gc=PROG.gc|0}catch(e){}
function camoSet(i){if(!camoOK(i)){if(typeof sfx==='function')sfx('deny',{vol:.4});status(CAMOS[i].n+': '+camoReq(i)+' to unlock.');return false}
 me.gc=i;if(PROG){PROG.gc=i;progSave()}camoUI();if(go||room){if(isHost)lob();else send({t:'sk',sk:me.sk,gc:i})}if(typeof pvCamo==='function')pvCamo(i);return true}
// ---------- picker ----------
{const b=document.createElement('div');b.id='gcbox';b.innerHTML='<div class="cbx"><h3>Gun skins</h3><p class="fine">Your gun skin shows on all your guns, for you and for everyone in the match. Level up to unlock more.</p><div id="gcl"></div><div class="row" style="justify-content:center;margin-top:12px"><button id="gcx" class="alt">Close</button></div></div>';document.body.appendChild(b);
 b.onclick=e=>{if(e.target===b)b.style.display='none'};$('gcx').onclick=()=>b.style.display='none'}
function camoOpen(){const L=$('gcl');L.innerHTML=CAMOS.map((c,i)=>{const ok=camoOK(i);return '<button class="gcc'+(i===me.gc?' on':'')+(ok?'':' lock')+'" data-i="'+i+'"><img src="'+(i?camoPic(i):camoPic(-1))+'"><b>'+(ok?'':'\u{1F512} ')+c.n+'</b><small>'+(ok?(i===me.gc?'Equipped':'Unlocked'):camoReq(i))+'</small></button>'}).join('');
 L.querySelectorAll('.gcc').forEach(x=>x.onclick=()=>{if(camoSet(+x.dataset.i)){if(typeof sfx==='function')sfx('click',{vol:.3});$('gcbox').style.display='none'}});$('gcbox').style.display='flex'}
addEventListener('keydown',e=>{if($('gcbox').style.display==='flex'&&e.code==='Escape')$('gcbox').style.display='none'});
function camoUI(){['gcb1','gcb2'].forEach(id=>{const b=$(id);if(b)b.innerHTML='<span>&#9670;</span> '+(me.gc?CAMOS[me.gc].n:'Gun skin')})}
{const add=(id,after)=>{const a=$(after);if(!a)return;const b=document.createElement('button');b.id=id;b.className='alt';a.parentNode.insertBefore(b,a.nextSibling);b.onclick=camoOpen};add('gcb1','clsb1');add('gcb2','clsb2');camoUI()}
// level-up toast also lists new gun skins
{const l0=lvlToast;lvlToast=function(L,skins){const o=l0.apply(this,arguments);try{const nu=CAMOS.map((c,i)=>i).filter(i=>!CAMOS[i].camp&&CAMOS[i].lv===L);if(nu.length){const d=$('lvlup');let sp=d.querySelector('span');if(!sp){sp=document.createElement('span');d.appendChild(sp)}sp.textContent=(sp.textContent?sp.textContent+' · ':'Unlocked: ')+nu.map(i=>CAMOS[i].n+' gun skin').join(', ')}}catch(e){}return o}}
// ---------- keep every gun in the right skin ----------
let vgCamo=-1;
setInterval(()=>{try{if(vgCamo!==me.gc){vg.forEach(g=>applyCamo(g,me.gc));vgCamo=me.gc}
 for(const p of Object.values(players)){const c=CAMOS[p.gc|0]?p.gc|0:0;if(p.R.gcA!==c){p.R.guns.forEach(g=>applyCamo(g,c));p.R.gcA=c}}}catch(e){}},200);
// lobby: your outfit, class and gun skin, next to the buttons that change them
setInterval(()=>{if(cur!=='lobby')return;try{const im=$('lmpic');if(im&&SKP[me.sk]&&im.getAttribute('src')!==SKP[me.sk])im.src=SKP[me.sk];
 $('lmname').textContent=me.name||'Player';$('lmsub').textContent=(SK[me.sk]?SK[me.sk].n:'')+(gm===0&&typeof CLASSES!=='undefined'?' · '+CLASSES[CLS.sel].n:'')+' · '+CAMOS[me.gc|0].n+' gun skin'}catch(e){}},300);
