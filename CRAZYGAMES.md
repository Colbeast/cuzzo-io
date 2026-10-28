# Putting Cuzzo io on CrazyGames

## 1. Let your server answer CrazyGames
The room list and relay only answer the sites listed in `ALLOWED_ORIGINS`, and the server needs its new
code, which understands wildcards.
1. Redeploy the server from a Codespace on your repo, same as before:
   ```
   cd server
   export CLOUDFLARE_API_TOKEN=PASTE_TOKEN_HERE
   npx wrangler deploy
   ```
2. In Cloudflare, open the `cuzzo-io` Worker > **Settings** > **Variables and Secrets** and change
   `ALLOWED_ORIGINS` to this, with your own site first:
   ```
   https://colbeast.github.io, https://*.crazygames.com, https://crazygames.com
   ```
   If your site's address is different, use it in place of `https://colbeast.github.io` (just `https://`
   and the domain, no folder name).

## 2. Upload the game
1. Go to the CrazyGames Developer Portal (developer.crazygames.com), sign in and add a new game.
2. Choose **HTML5** and upload `cuzzo-io-crazygames.zip`. It has `index.html` at the top level and only the
   game files (about 1.6 MB).
3. Fill in the details: the name **Cuzzo io**, a short description, the controls (below), and the cover
   images or video they ask for.
4. Test it with their **Preview** tool before submitting. Check the Play now button, hosting a room,
   joining with a code from another browser, and the room list.

## 3. Controls text you can paste
Desktop: WASD move, mouse aim, left click shoot, right click aim, R reload, 1-4 or scroll to switch weapon,
Space jump, Shift sprint, C crouch, E use / open doors / enter cars, Q use powerup, M map,
Tab inventory (Battle Royale), / chat, Esc pause.

Mobile: left thumb moves (push all the way up to sprint), right thumb looks around, on-screen buttons for
fire, aim, jump, crouch, reload, swap and use.

## What's already done for their rules
- SDK: loading start/stop and gameplay start/stop (pausing, menus, spectating and ads all count as stopped)
- One click (Play now) from the menu to gameplay: it joins a running public free-for-all match if there is one,
  otherwise it starts a practice match against the bot
- The player's CrazyGames username is their in-game name
- Follows CrazyGames' mute-audio and disable-chat settings
- Chat moderation: a filter for swear words and slurs in chat, player names and room names
- Ads only through the CrazyGames SDK:
  - midgame ads only at natural breaks, never during play and never on a button click
  - audio muted and the screen blocked while an ad plays
  - the game still works with an adblocker (no ads, nothing taken away)
  - banners only on the menu screens, never covering the menu, cleared when a match starts
- Invite links, joining from an invite link, and instant multiplayer (starts a private room)
- Players stay together between rounds (same room)
- Works with mouse and keyboard and with touch, in landscape

## Things to know
- On a **Basic Launch**, CrazyGames turns ads off, so you won't earn yet. If they pick the game for a
  **Full Launch**, ads switch on automatically with this same build.
- Multiplayer uses peer-to-peer connections plus your own Cloudflare server, which CrazyGames doesn't host.
  If their QA has trouble connecting, the relay (TURN) setup in SERVER_SETUP.md is what fixes it.
- CrazyGames' phone apps use their own web addresses. If the room list says it can't reach the server
  inside the CrazyGames app, ask CrazyGames which addresses their apps use and add them to
  `ALLOWED_ORIGINS`.
