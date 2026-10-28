// ===== Ad space =====
// Two banner slots on the menu screens, in standard sizes:
//   #ad-300x250  (medium rectangle, right side)    #ad-728x90  (leaderboard, bottom right)
// They only show on the menus, never during a match, and hide themselves on screens too small to fit them
// next to the menu (CSS in style.css, "ad space").
//
// On CrazyGames the slots are filled with CrazyGames banners through their SDK (the only ads they allow).
// Banners are cleared the moment a match starts and refreshed at most once a minute while a menu is open
// (CrazyGames' limit is one refresh per 30 s). If no banner is available the slot just stays empty.
// Anywhere else the slots show an empty "Advertisement" placeholder; set SHOW_AD_PLACEHOLDERS to false to
// hide them there.
const SHOW_AD_PLACEHOLDERS = true;
(function(){
 const ads=document.getElementById('ads');if(!ads)return;
 if(!SHOW_AD_PLACEHOLDERS)ads.classList.add('off');
 const SLOTS=[{id:'ad-300x250',w:300,h:250},{id:'ad-728x90',w:728,h:90}];
 const st={};SLOTS.forEach(s=>st[s.id]={t:0,filled:false,dead:false});
 let disabled=false;
 const menuOpen=()=>document.body.classList.contains('inmenu')&&getComputedStyle(document.getElementById('menu')).display!=='none'&&!go;
 const fits=el=>{if(!el||el.offsetParent===null||getComputedStyle(el).display==='none')return false;const r=el.getBoundingClientRect();return r.width>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight};
 window.adSlotsVisible=menuOpen;
 window.cgBannersClear=function(){const CG=window.CG;if(!CG||!CG.on)return;let any=false;SLOTS.forEach(s=>{if(st[s.id].filled){st[s.id].filled=false;any=true}});
  if(any)try{CG.sdk.banner.clearAllBanners()}catch(e){}};
 setInterval(()=>{const CG=window.CG;if(!CG||!CG.on||disabled)return;ads.classList.add('cg');
  if(!menuOpen()){window.cgBannersClear();return}
  const now=Date.now();
  SLOTS.forEach(s=>{const el=document.getElementById(s.id),q=st[s.id];if(q.dead||!fits(el))return;
   if(q.filled&&now-q.t<60000)return;if(!q.filled&&q.t&&now-q.t<35000)return;
   q.t=now;
   Promise.resolve().then(()=>CG.sdk.banner.requestBanner({id:s.id,width:s.w,height:s.h})).then(()=>{q.filled=true;el.classList.remove('nofill')})
    .catch(e=>{const c=e&&(e.code||e.message||e);q.filled=false;el.classList.add('nofill');
     if(c==='bannersDisabled'){disabled=true;ads.classList.add('off')}else if(c==='invalidSize')q.dead=true})});
 },1000);
})();
