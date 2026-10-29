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

// ---------- PLAY NOW: one click into an online match (matchmaking), one button per mode ----------
// Free-for-all: join a public free-for-all that's already running and has space (you respawn straight in).
// Battle Royale / Squads: join a public lobby of that mode that's waiting to start (joining one that has
// already started would only let you spectate).
// If there's nothing to join, it opens a new public match of that mode and starts it right away, with bots
// filling the empty places (js/bots.js); it shows in the Rooms list so the next player can join you.
// If online play isn't possible at all on this network, you play the same mode offline against bots.
let qpBusy=false;
const alone=()=>roster().filter(e=>!isBot(e)).length<=1;
const QPB=['qplay','qpbr','qpsq'],MODEN=['free-for-all','Battle Royale','Squads'];
const qpDisable=v=>QPB.forEach(id=>{const b=$(id);if(b)b.disabled=v});
function modeMap(mode){if(mode===1){if(!MAPS[mapIdx].br||SQM(MAPS[mapIdx]))loadMap(MAPS[lastBR]&&!SQM(MAPS[lastBR])?lastBR:BRI)}
 else if(mode===2){if(!SQM(MAPS[mapIdx]))loadMap(SQM(MAPS[lastSQ])?lastSQ:SQI)}else if(MAPS[mapIdx].br)loadMap(lastFFA)}
function offlineNow(mode){if(room||go||practice)return;mode=mode|0;
 if(mode===0){$('prac').click();$('go').click();return}
 practice=true;isHost=true;me.id='h';gm=mode;modeMap(mode);$('big').textContent='SOLO';step('lobby');renderLobby();$('go').disabled=false;$('go').click()}
function hostNow(mode){if(room||go||practice)return;mode=mode|0;
 if(typeof rtcOK==='function'&&!rtcOK()){offlineNow(mode);return}
 isHost=true;me.id='h';
 if(gm!==mode&&typeof hostMode==='function')hostMode(mode);modeMap(mode);
 let code;do{code=Array.from({length:4},()=>AL[Math.random()*AL.length|0]).join('')}while(hasBadWords(code));/* never a code that spells something rude */
 $('big').textContent=code;step('lobby');
 if(typeof roomSetPriv==='function')roomSetPriv(false,true);// Play now matches are always public (doesn't change your Host server choice)
 renderLobby();$('go').disabled=false;// the Start button is disabled until the menu knows you're the host
 $('go').click();// starts the match and locks the mouse inside this click, so you're playing immediately
 status('Your public '+MODEN[mode]+' match is open. Players who press Play now can join you.');
 startRoom(code).then(()=>{if(typeof feed==='function')feed('Online: other players can join your match')})
  .catch(e=>{console.error(e);if(room||!go||!isHost)return;
   // online play is blocked on this network: keep playing against bots so you're not alone
   practice=true;
   status('Online play is blocked on this network, so you\'re playing against bots.');
   if(typeof feed==='function')feed('Can\'t go online here - playing against bots',1)});
}
async function quickPlay(mode){mode=mode|0;if(typeof booted!=='undefined'&&!booted)return;if(room||go||practice||qpBusy)return;
 let rooms=[];
 if(typeof roomsNow==='function'){qpBusy=true;qpDisable(true);status('Looking for a '+MODEN[mode]+' match...');
  try{rooms=await roomsNow(2500)}catch(e){rooms=[]}}
 qpBusy=false;qpDisable(false);
 const pick=rooms.filter(r=>r&&!r.priv&&r.code&&r.mode===mode&&(mode===0?r.started:!r.started)&&r.players<r.max).sort((a,b)=>b.players-a.players)[0];
 if(!pick||(typeof rtcOK==='function'&&!rtcOK())){hostNow(mode);return}
 qpBusy=true;qpDisable(true);status('Joining '+cleanWords(String(pick.name||'a match'))+'...');isHost=false;
 const giveUp=()=>{qpBusy=false;qpDisable(false);try{leave()}catch(e){}hostNow(mode)};// that host didn't answer: open our own match instead
 try{await startRoom(pick.code)}catch(e){giveUp();return}
 const t0=performance.now();
 const tm=setInterval(()=>{
  if(hostLink){clearInterval(tm);qpBusy=false;qpDisable(false);$('big').textContent=pick.code;step('lobby');status(mode===0?'Connected. Joining the match...':'Connected. The match starts when the host presses Start.');renderLobby();return}
  if(!room){clearInterval(tm);qpBusy=false;qpDisable(false);return}// left in the meantime
  if(performance.now()-t0>8000){clearInterval(tm);giveUp()}},200);
}
QPB.forEach((id,m)=>{const b=$(id);if(b)b.onclick=()=>quickPlay(m)});

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
  if(go&&ending&&!wasEnding&&(ELIM()||practice||(isHost&&alone())))setTimeout(midgame,2500);// match over (BR / Squads go back to the lobby; a solo host's next round waits for the ad)
  if(go&&me.out&&!wasOut&&!ending&&ELIM())setTimeout(midgame,2000);// eliminated, now spectating
  wasEnding=!!(go&&ending);wasOut=!!(go&&me.out);
  // CrazyGames invite button + Copy invite link whenever your room can be joined: in the lobby, or during a
  // free-for-all match (people can join those halfway). Hidden when the room is full, between rounds, or while a
  // Battle Royale / Squads match is on (someone joining then would only be able to spectate).
  const code=($('big').textContent||'').trim(),n=roster().filter(e=>!isBot(e)).length;
  const joinable=!go||(gm===0&&!ending);
  const key=(room&&!practice&&/^[A-HJ-NP-Z2-9]{4}$/.test(code)&&n<8&&joinable)?code:'';
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
if(typeof newMatch==='function'){const n0=newMatch;newMatch=function(){if(CG.adBusy&&(practice||(isHost&&alone()))){const a=arguments,t=this;CG.after=()=>newMatch.apply(t,a);return}return n0.apply(this,arguments)}}

// "Copy invite link" button under the room code, for everyone in the room, host or not (CrazyGames only)
function inviteUI(code){let b=$('cginv');const bar=$('codebar');if(!bar)return;
 if(!b){b=document.createElement('button');b.id='cginv';b.className='alt';b.textContent='\u{1F517} Copy invite link';b.style.marginTop='8px';(bar.firstElementChild||bar).appendChild(b);
  b.onclick=()=>{const c=b.dataset.code;if(!c)return;let link='';safe(()=>{link=CG.sdk.game.inviteLink({room:c})});if(!link)return;
   const ok=()=>status('Invite link copied. Send it to your friends!');
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(ok,()=>fallback(link,ok));else fallback(link,ok)}}
 b.dataset.code=code;b.style.display=code?'':'none'}
function fallback(t,ok){const i=document.createElement('textarea');i.value=t;i.style.position='fixed';i.style.opacity='0';document.body.appendChild(i);i.select();try{document.execCommand('copy');ok()}catch(e){status('Invite link: '+t)}i.remove()}
})();
