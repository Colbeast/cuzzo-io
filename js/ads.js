// ===== Ad space =====
// Two banner slots on the menu screens, in the standard sizes ad networks use:
//   #ad-300x250  (medium rectangle, right side)    #ad-728x90  (leaderboard, bottom right)
// They're only shown on the menus, never during a match, and hide themselves on screens too small to
// fit them next to the menu (CSS in style.css, "ad space").
//
// To show real ads, call your ad network's banner function with these element IDs, for example with the
// CrazyGames SDK (after its script is added to index.html):
//   window.CrazyGames.SDK.banner.requestBanner({id:'ad-300x250',width:300,height:250});
//   window.CrazyGames.SDK.banner.requestBanner({id:'ad-728x90',width:728,height:90});
// Until then the boxes show an empty "Advertisement" placeholder. Set SHOW_AD_PLACEHOLDERS to false to hide
// them completely until real ads are connected.
const SHOW_AD_PLACEHOLDERS = true;
(function(){
 const ads=document.getElementById('ads');if(!ads)return;
 if(!SHOW_AD_PLACEHOLDERS)ads.classList.add('off');
 // let the slots know when the menu is open, so a network can refresh banners only while they're visible
 window.adSlotsVisible=()=>!ads.classList.contains('off')&&getComputedStyle(document.getElementById('menu')).display!=='none'&&!go;
})();
