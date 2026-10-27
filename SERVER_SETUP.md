# Cuzzo io server setup (Cloudflare, free)

The `server` folder is one Cloudflare Worker named `cuzzo-io` that does two jobs:
- **TURN relay logins**, so players on phone data or school networks can connect
- **The room list**, so players can see public rooms (with a Join button) and private rooms (with a lock;
  you need the host's code to join)

Free limits: 100,000 requests a day for the Worker and the room list, and 1,000 GB a month for the relay.
That's plenty to start. If the game gets big, the Workers Paid plan is $5/month.

## What you need
- Your Cloudflare account, with the `cuzzo-io` Worker and its 3 settings already added
  (`TURN_KEY_ID`, `TURN_KEY_API_TOKEN`, `ALLOWED_ORIGINS`). Steps for those are at the bottom.
- **Node.js** installed on your computer (the LTS version from https://nodejs.org)

## Deploy the server (once now, and again whenever the server code changes)
1. Unzip the game and open a terminal **inside the `server` folder**:
   - Windows: open the `server` folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - Mac: right-click the `server` folder > **New Terminal at Folder**.
2. Log in to Cloudflare (a browser window opens; click **Allow**):
   ```
   npx wrangler login
   ```
   If it asks to install wrangler, type `y` and press Enter.
3. Deploy:
   ```
   npx wrangler deploy
   ```
   This replaces the code in your `cuzzo-io` Worker and keeps the 3 settings you already added.
   At the end it prints your Worker's address, like `https://cuzzo-io.yourname.workers.dev`.

## Connect the game
1. In `js/turn-config.js`, set your Worker address (skip this if you already did it for the relay):
   ```js
   window.TURN_WORKER_URL = 'https://cuzzo-io.yourname.workers.dev';
   ```
   The room list uses the same address automatically.
2. Upload the game to your website again.

## Test it
1. Open your game in two browser windows (or on two devices).
2. In window 1, click **Host server**. Under the code you'll see **Public / Private**.
3. In window 2, look at **Rooms** on the main menu (it refreshes every 10 seconds). The room shows with
   a globe and a **Join** button.
4. In window 1, click **Private**. Within about 10 seconds, window 2 shows it with a lock and a **Code**
   button. The code itself never appears in the list.
5. When the host leaves, the room disappears (within 75 seconds if they just close the tab).

## If something's wrong
- **"can't reach the room list right now"**: the deploy didn't work, `TURN_WORKER_URL` is wrong, or
  `ALLOWED_ORIGINS` doesn't exactly match your site's address. Press F12, open the Network tab and look
  at the request to `/rooms` and its status.
- **No Rooms section on the menu**: `TURN_WORKER_URL` in `js/turn-config.js` is empty.
- **The lobby says "(Room list: too many rooms from you)"**: one network can have at most 3 rooms open at
  once. Close old tabs and wait a minute.

## How it's protected
- Only your own site (from `ALLOWED_ORIGINS`) can use the server.
- Only the host who opened a room can change or close it (it gets a secret token the first time).
- Private room codes are never sent to anyone browsing the list.
- At most 3 rooms per network and 500 rooms total, with limits on how fast anyone can ask for the list.
- Room names are cleaned and shown as plain text, so nobody can inject code into your page.

---

## Relay (TURN) setup, if you haven't done it yet
1. In Cloudflare, go to **Realtime** (or **Calls**) > **TURN Server** > **Create**. Copy the
   **Turn Token ID** and the **API Token** (the token only shows once).
2. On the `cuzzo-io` Worker, go to **Settings** > **Variables and Secrets** and add:
   - `TURN_KEY_ID` (Text): the Turn Token ID
   - `TURN_KEY_API_TOKEN` (Secret): the API Token
   - `ALLOWED_ORIGINS` (Text): your game's site, e.g. `https://yourname.github.io` (no slash at the end;
     separate several sites with commas)
3. Deploy the server as above.
4. Set a billing alert in Cloudflare so you hear about it if relay use ever goes past the free 1,000 GB.
