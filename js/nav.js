// ===== Bot navigation: a walkable grid of the map and A* path finding =====
// Built on the host, a little at a time (a few milliseconds per frame) after a map loads, so it never
// freezes the game. Each cell knows its ground height and which neighbours you can walk to (walls, fences,
// rocks and steps that are too high block the way; doors count as open, because bots open them).
// Paths only cover the ground floor; a bot up on a roof or upstairs just walks straight.
const NAV={ready:false,world:null,cs:1.6,x0:0,z0:0,nx:0,nz:0,h:null,ok:null,m:null,bi:0,phase:0,heap:null,g:null,from:null,stamp:null,sid:0};
function navBlockedAt(x,z,y){if(BND>0&&x*x+z*z>BND*BND)return true;if(RBX>0&&(Math.abs(x)>RBX||Math.abs(z)>RBZ))return true;
 for(const b of near(x,z)){if(b.t)continue;if(fo(b,x,z)&&b[4]>y+.55&&b[5]<y+1.8)return true}return false}
function navReset(){NAV.ready=false;NAV.world=world;NAV.phase=0;NAV.bi=0;
 let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const s of spawns){a=Math.min(a,s[0]);b=Math.max(b,s[0]);c=Math.min(c,s[1]);d=Math.max(d,s[1])}
 let E=Math.max(40,Math.max(Math.abs(a),Math.abs(b),Math.abs(c),Math.abs(d))+35);if(BND>0)E=Math.min(E,BND+2);if(RBX>0)E=Math.min(E,Math.max(RBX,RBZ)+2);E=Math.min(E,300);
 NAV.cs=E>130?2.4:1.6;NAV.x0=-E;NAV.z0=-E;NAV.nx=NAV.nz=Math.ceil(2*E/NAV.cs);const N=NAV.nx*NAV.nz;
 NAV.h=new Float32Array(N);NAV.ok=new Uint8Array(N);NAV.m=new Uint8Array(N);NAV.g=new Float32Array(N);NAV.from=new Int32Array(N);NAV.stamp=new Uint32Array(N);NAV.cl=new Uint32Array(N);NAV.heap=[]}
const navX=i=>NAV.x0+(i%NAV.nx+.5)*NAV.cs,navZ=i=>NAV.z0+(Math.floor(i/NAV.nx)+.5)*NAV.cs;
const navCell=(x,z)=>{const i=Math.floor((x-NAV.x0)/NAV.cs),j=Math.floor((z-NAV.z0)/NAV.cs);return i<0||j<0||i>=NAV.nx||j>=NAV.nz?-1:j*NAV.nx+i};
const NDIR=[[1,0],[0,1],[1,1],[-1,1]];// edges stored on the lower cell: bit k = can walk in direction NDIR[k]
function navEdge(i,k){const nx=NAV.nx,ci=i%nx,cj=Math.floor(i/nx),[di,dj]=NDIR[k],ti=ci+di,tj=cj+dj;if(ti<0||tj<0||ti>=nx||tj>=NAV.nz)return false;const t=tj*nx+ti;
 if(!NAV.ok[i]||!NAV.ok[t])return false;const h0=NAV.h[i],h1=NAV.h[t];if(Math.abs(h1-h0)>.7)return false;
 if(di&&dj&&(!NAV.ok[cj*nx+ti]||!NAV.ok[tj*nx+ci]))return false;
 const x0=navX(i),z0=navZ(i),x1=navX(t),z1=navZ(t),n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.4);
 for(let s=1;s<n;s++){const f=s/n,x=x0+(x1-x0)*f,z=z0+(z1-z0)*f,y=h0+(h1-h0)*f;if(navBlockedAt(x,z,y))return false;if(groundAt(x,z,y+.6)>y+.75)return false}return true}
// build a slice of the grid; returns true when finished
function navBuild(ms){if(NAV.world!==world)navReset();if(NAV.ready)return true;const t0=performance.now(),N=NAV.nx*NAV.nz;
 while(performance.now()-t0<ms){if(NAV.phase===0){for(let k=0;k<200&&NAV.bi<N;k++,NAV.bi++){const i=NAV.bi,x=navX(i),z=navZ(i),y=groundAt(x,z,Hf(x,z)+.15);NAV.h[i]=y;NAV.ok[i]=y>-50&&!navBlockedAt(x,z,y)?1:0}
   if(NAV.bi>=N){NAV.phase=1;NAV.bi=0}}
  else{for(let k=0;k<120&&NAV.bi<N;k++,NAV.bi++){const i=NAV.bi;let m=0;if(NAV.ok[i])for(let d=0;d<4;d++)if(navEdge(i,d))m|=1<<d;NAV.m[i]=m}
   if(NAV.bi>=N){NAV.ready=true;return true}}}
 return false}
function navCan(i,di,dj){const nx=NAV.nx;// can you step from cell i by (di,dj)?
 for(let k=0;k<4;k++){const d=NDIR[k];if(d[0]===di&&d[1]===dj)return !!(NAV.m[i]&1<<k);if(d[0]===-di&&d[1]===-dj){const t=i+dj*nx+di;return t>=0&&t<NAV.m.length&&!!(NAV.m[t]&1<<k)}}return false}
function navNear(x,z,y){const c=navCell(x,z);if(c<0)return -1;if(NAV.ok[c]&&(y==null||Math.abs(NAV.h[c]-y)<1.2))return c;
 const nx=NAV.nx,ci=c%nx,cj=Math.floor(c/nx);let best=-1,bd=1e9;for(let r=1;r<=3;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=nx||j>=NAV.nz)continue;const t=j*nx+i;if(!NAV.ok[t]||(y!=null&&Math.abs(NAV.h[t]-y)>1.2))continue;const d=di*di+dj*dj;if(d<bd){bd=d;best=t}}return best}
// A*: list of [x,z] points from (sx,sz) to (gx,gz). If the goal can't be reached it goes as close as it can.
function navPath(sx,sz,sy,gx,gz,maxExp){if(!NAV.ready)return null;const s=navNear(sx,sz,sy),g=navNear(gx,gz);if(s<0||g<0)return null;if(s===g)return[[gx,gz]];
 const nx=NAV.nx,id=++NAV.sid,G=NAV.g,F=NAV.from,S=NAV.stamp,CL=NAV.cl,H=[],gi=g%nx,gj=Math.floor(g/nx),hf=i=>{const a=Math.abs(i%nx-gi),b=Math.abs(Math.floor(i/nx)-gj);return(Math.max(a,b)+.414*Math.min(a,b))};
 const push=(f,i)=>{H.push([f,i]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p}};
 const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m}}return top};
 S[s]=id;G[s]=0;F[s]=-1;push(hf(s),s);let best=s,bh=hf(s),n=0;maxExp=maxExp||5000;
 while(H.length&&n<maxExp){const[,c]=pop();if(CL[c]===id)continue;CL[c]=id;n++;if(c===g){best=g;break}const hc=hf(c);if(hc<bh){bh=hc;best=c}
  const ci=c%nx,cj=Math.floor(c/nx);for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ti=ci+di,tj=cj+dj;if(ti<0||tj<0||ti>=nx||tj>=NAV.nz)continue;if(!navCan(c,di,dj))continue;
   const t=tj*nx+ti,ng=G[c]+(di&&dj?1.414:1)+Math.abs(NAV.h[t]-NAV.h[c])*.5;if(S[t]!==id||ng<G[t]){S[t]=id;G[t]=ng;F[t]=c;push(ng+hf(t)*1.05,t)}}}
 const out=[];for(let c=best;c>=0&&out.length<2000;c=F[c]){out.push([navX(c),navZ(c)]);if(c===s)break}out.reverse();if(best===g)out.push([gx,gz]);return out}
// is the straight line between two points walkable? (used to cut corners on a path)
function navLine(x0,z0,y0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(NAV.cs*.45)));let py=y0;
 for(let s=1;s<=n;s++){const f=s/n,x=x0+(x1-x0)*f,z=z0+(z1-z0)*f,c=navCell(x,z);if(c<0||!NAV.ok[c])return false;const y=NAV.h[c];if(Math.abs(y-py)>.7)return false;if(navBlockedAt(x,z,y))return false;py=y}return true}
