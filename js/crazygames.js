// ===== CrazyGames integration + PLAY button =====
// Everything CrazyGames-specific only runs when the game is actually on CrazyGames (or on localhost / with
// ?useLocalSdk=true for testing). On any other website the SDK reports "disabled" and this file does nothing
// except the PLAY button, so the same files work on your own site too.
//
// What it does on CrazyGames:
//  - loadingStart / loadingStop while the game loads, gameplayStart / gameplayStop whenever a match is
//    actually being played vs paused / in menus / spectating / watching an ad
//  - uses the player's CrazyGames username as their in-game name
//  - respects the CrazyGames "mute audio" and "disable chat" settings (and keeps listening for changes)
//  - midgame video ads only at natural breaks: after a Battle Royale / Squads match ends, after you're
//    eliminated (spectating), or after a practice match ends. Never during play or on a button click.
//    Audio is muted and the screen is blocked while the ad plays, as CrazyGames requires.
//  - banner ads in the two menu ad slots (js/ads.js), cleared as soon as gameplay starts
//  - invite links for your lobby ("Copy invite link" button + the CrazyGames invite button), joining from an
//    invite link, and "instant multiplayer" (starts a private room right away when CrazyGames asks for it)
(function(){
const CG={on:false,sdk:null,adBusy:false,lastAd:0,muteSdk:false,muteAd:false,chatOff:false,user:null,nameLocked:false};
window.CG=CG;
const muted=()=>CG.muteSdk||CG.muteAd;

// ---------- audio: one switch for everything (all game sounds go through beep / lTone) ----------
function applyMute(){try{if(typeof ac!=='undefined'&&ac){if(muted()){if(ac.state==='running')ac.suspend()}else if(ac.state==='suspended')ac.resume()}}catch(e){}}
if(typeof beep==='function'){const b0=beep;beep=function(){if(muted())return;return b0.apply(this,arguments)}}
if(typeof lTone==='function'){const l0=lTone;lTone=function(){if(muted())return;return l0.apply(this,arguments)}}
// iOS / Safari only allow sound to start inside a tap or click
['touchend','click','keydown'].forEach(ev=>addEventListener(ev,()=>{if(!muted())applyMute()},{passive:true}));

// ---------- chat: off when CrazyGames says so ----------
if(typeof openChat==='function'){const o0=openChat;openChat=function(){if(CG.chatOff)return;return o0.apply(this,arguments)}}
if(typeof chatMsg==='function'){const c0=chatMsg;chatMsg=function(){if(CG.chatOff)return;return c0.apply(this,arguments)}}
function applySettings(s){if(!s)return;CG.muteSdk=!!s.muteAudio;CG.chatOff=!!s.disableChat;applyMute();
 const L=$('chatlog');if(L)L.style.display=CG.chatOff?'none':'';if(CG.chatOff&&typeof chatOn!=='undefined'&&chatOn&&typeof closeChat==='function')closeChat()}

// ---------- PLAY NOW: one click into a match ----------
// 1. If a public free-for-all room is in the middle of a match and has space, join it (you respawn straight in).
// 2. Otherwise (or if that host doesn't answer within 8 s), start a practice match against the bot.
// Free-for-all only, because joining a Battle Royale or Squads match halfway puts you in as a spectator.
let qpBusy=false;
function practiceNow(){if(room||go||practice)return;
 $('prac').click();// sets up a practice free-for-all on the current arena map
 $('go').click();// starts it and locks the mouse in the same click when possible, so you're playing at once
}
async function quickPlay(){if(typeof booted!=='undefined'&&!booted)return;if(room||go||practice||qpBusy)return;
 const btn=$('qplay');let rooms=[];
 if(typeof roomsNow==='function'&&typeof rtcOK==='function'){qpBusy=true;btn.disabled=true;status('Looking for a match...');
  try{rooms=await roomsNow(2500)}catch(e){rooms=[]}}
 const pick=rooms.filter(r=>r&&!r.priv&&r.code&&r.mode===0&&r.started&&r.players<r.max).sort((a,b)=>b.players-a.players)[0];
 if(!pick||!rtcOK()){qpBusy=false;btn.disabled=false;practiceNow();return}
 status('Joining '+cleanWords(String(pick.name||'a match'))+'...');isHost=false;
 const giveUp=()=>{qpBusy=false;btn.disabled=false;try{leave()}catch(e){}status('That match didn\'t answer, so here\'s a practice match instead.');practiceNow()};
 try{await startRoom(pick.code)}catch(e){giveUp();return}
 const t0=performance.now();
 const tm=setInterval(()=>{
  if(hostLink){clearInterval(tm);qpBusy=false;btn.disabled=false;$('big').textContent=pick.code;step('lobby');status('Connected. Joining the match...');renderLobby();return}
  if(!room){clearInterval(tm);qpBusy=false;btn.disabled=false;return}// left in the meantime
  if(performance.now()-t0>8000){clearInterval(tm);giveUp()}},200);
}
{const q=$('qplay');if(q)q.onclick=quickPlay}

// ---------- the rest needs the CrazyGames SDK ----------
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function getSDK(){for(let i=0;i<100;i++){if(window.CrazyGames&&window.CrazyGames.SDK)return window.CrazyGames.SDK;await wait(100)}return null}
const safe=f=>{try{return f()}catch(e){console.warn('CrazyGames SDK:',e&&e.message||e)}};

(async()=>{
 const sdk=await getSDK();if(!sdk)return;
 try{await sdk.init()}catch(e){console.warn('CrazyGames SDK init failed',e);return}
 if(sdk.environment!=='crazygames'&&sdk.environment!=='local')return;// "disabled" = not on CrazyGames
 CG.on=true;CG.sdk=sdk;document.body.classList.add('cg');
 safe(()=>sdk.game.loadingStart());

 // settings: mute audio / disable chat
 safe(()=>applySettings(sdk.game.settings));
 safe(()=>sdk.game.addSettingsChangeListener(applySettings));

 // username
 const useUser=u=>{CG.user=u||null;const i=$('nm');if(!i)return;
  if(u&&u.username){const n=cleanName(u.username,16);i.value=n;me.name=n;i.readOnly=true;i.title='Your CrazyGames username';CG.nameLocked=true}
  else if(CG.nameLocked){i.readOnly=false;i.title='';CG.nameLocked=false}};
 try{if(sdk.user&&sdk.user.isUserAccountAvailable!==false){useUser(await sdk.user.getUser())}}catch(e){}
 safe(()=>sdk.user.addAuthListener(useUser));

 // wait for the game itself to finish loading
 while(typeof booted==='undefined'||!booted)await wait(100);
 await wait(300);
 safe(()=>sdk.game.loadingStop());

 // joined from an invite link? go straight to that room. Instant multiplayer? open a private room.
 let inv=null;safe(()=>{inv=sdk.game.getInviteParam('room')});
 if(inv&&/^[A-HJ-NP-Z2-9]{4}$/i.test(inv)){$('code').value=inv.toUpperCase();$('join').onclick()}
 else if(safe(()=>sdk.game.isInstantMultiplayer)){if(typeof roomSetPriv==='function')roomSetPriv(true);$('host').click()}

 startWatchers();
})();

// ---------- gameplay start / stop, midgame ads, banners, invite button ----------
function playingNow(){return !!go&&!!document.pointerLockElement&&!ending&&!me.out&&!CG.adBusy}
function startWatchers(){const sdk=CG.sdk;let playing=false,wasEnding=false,wasOut=false,invKey='';
 setInterval(()=>{
  // gameplay events
  const p=playingNow();
  if(p!==playing){playing=p;if(p){safe(()=>sdk.game.gameplayStart());if(typeof cgBannersClear==='function')cgBannersClear()}else safe(()=>sdk.game.gameplayStop())}
  // natural breaks for a midgame ad
  if(go&&ending&&!wasEnding&&(ELIM()||practice))setTimeout(midgame,2500);// match over (BR / Squads go back to the lobby; practice waits for the ad)
  if(go&&me.out&&!wasOut&&!ending&&ELIM())setTimeout(midgame,2000);// eliminated, now spectating
  wasEnding=!!(go&&ending);wasOut=!!(go&&me.out);
  // CrazyGames invite button while you're in a lobby that can be joined
  const code=($('big').textContent||'').trim(),n=roster().filter(e=>e.id!=='bot').length;
  const key=(room&&!go&&!practice&&/^[A-HJ-NP-Z2-9]{4}$/.test(code)&&n<8)?code:'';
  if(key!==invKey){invKey=key;if(key){if(typeof sdk.game.showInviteButton==='function')safe(()=>sdk.game.showInviteButton({room:key}))}
   else if(typeof sdk.game.hideInviteButton==='function')safe(()=>sdk.game.hideInviteButton())}
  inviteUI(key);
 },250);
}

function midgame(){const sdk=CG.sdk;if(!sdk||CG.adBusy||Date.now()-CG.lastAd<180000)return;// CrazyGames' usual gap is 3 minutes
 if(!go)return;CG.adBusy=true;CG.lastAd=Date.now();const blk=$('cgblock');if(blk)blk.style.display='block';
 const done=()=>{if(!CG.adBusy)return;CG.adBusy=false;CG.muteAd=false;applyMute();if(blk)blk.style.display='none';const f=CG.after;CG.after=null;if(f)f()};
 safe(()=>sdk.ad.requestAd('midgame',{
  adStarted:()=>{CG.muteAd=true;applyMute();if(document.pointerLockElement)document.exitPointerLock()},
  adFinished:done,adError:done}));
 setTimeout(done,90000);// never leave the game blocked if the SDK goes quiet
}
// a practice match restarts by itself after 6 s; if an ad is playing, start the next one once it's over
if(typeof newMatch==='function'){const n0=newMatch;newMatch=function(){if(CG.adBusy&&practice){const a=arguments,t=this;CG.after=()=>newMatch.apply(t,a);return}return n0.apply(this,arguments)}}

// "Copy invite link" button in the lobby (CrazyGames only)
function inviteUI(code){let b=$('cginv');const row=$('privrow');if(!row)return;
 if(!b){b=document.createElement('button');b.id='cginv';b.className='alt';b.textContent='\u{1F517} Copy invite link';b.style.marginTop='6px';row.appendChild(b);
  b.onclick=()=>{const c=b.dataset.code;if(!c)return;let link='';safe(()=>{link=CG.sdk.game.inviteLink({room:c})});if(!link)return;
   const ok=()=>status('Invite link copied. Send it to your friends!');
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(ok,()=>fallback(link,ok));else fallback(link,ok)}}
 b.dataset.code=code;b.style.display=code?'':'none'}
function fallback(t,ok){const i=document.createElement('textarea');i.value=t;i.style.position='fixed';i.style.opacity='0';document.body.appendChild(i);i.select();try{document.execCommand('copy');ok()}catch(e){status('Invite link: '+t)}i.remove()}
})();
