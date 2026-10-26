# Setting up the TURN relay (Cloudflare, free up to 1,000 GB/month)

Players on phone data, school or work networks often can't connect to each other directly. A TURN relay
passes their game traffic through Cloudflare instead. Your secret key lives only inside a Cloudflare Worker;
the game just gets a temporary login that expires after 4 hours.

## 1. Create the TURN key
1. Make a free account at https://dash.cloudflare.com and log in.
2. In the left menu open **Realtime** (older accounts may call it **Calls**) and choose **TURN Server**.
3. Click **Create**, give it a name like `cuzzo`, and create it.
4. Copy the **Turn Token ID** and the **API Token** into a notepad. The API token is only shown once.
   Never put these in the game files.

## 2. Create the Worker
1. In the left menu open **Workers & Pages** (under Compute) and click **Create** > **Create Worker**
   (start from "Hello World").
2. Name it, for example `cuzzo-turn`, and click **Deploy**.
3. Click **Edit code**, delete everything in the editor, paste the whole contents of `turn-worker/worker.js`,
   and click **Deploy**.

## 3. Add the settings
On the Worker, go to **Settings** > **Variables and Secrets** and add:

| Type   | Name                 | Value |
|--------|----------------------|-------|
| Text   | `TURN_KEY_ID`        | the Turn Token ID from step 1 |
| Secret | `TURN_KEY_API_TOKEN` | the API Token from step 1 |
| Text   | `ALLOWED_ORIGINS`    | your game's website, e.g. `https://yourname.github.io` |

`ALLOWED_ORIGINS` is just `https://` plus the domain, with no path and no slash at the end. If the game
lives on more than one site, separate them with commas. Click **Deploy** if it asks.

## 4. Point the game at the Worker
1. Copy the Worker's address from its page (it looks like `https://cuzzo-turn.yourname.workers.dev`).
2. Open `js/turn-config.js` and put it between the quotes:
   `window.TURN_WORKER_URL = 'https://cuzzo-turn.yourname.workers.dev';`
3. Upload the game files to your website again.

## 5. Check it works
- Visit your Worker address directly in the browser: it should say **Forbidden**. That's correct, because it
  only answers your game's site.
- Open your game, press F12 > Console, and host a server. There should be no "TURN worker" warnings.
- The real test: host on home Wi-Fi and join from a phone on mobile data.

## 6. Protect your wallet
The first 1,000 GB each month is free; after that Cloudflare charges $0.05 per GB. In the Cloudflare
dashboard, set up a billing notification so you hear about it if usage ever climbs.

## How it stays safe
- The API token only exists inside the Worker, so nobody can copy it from your game.
- The Worker only hands out logins to pages on your own site, and only 10 per minute per player.
- Each login expires after 4 hours. If someone grabs one, it soon stops working.
- A determined person could still fake requests from a script, so the billing alert is your safety net.
  If you ever see abuse, create a new TURN key and update the Worker's two settings. Old logins stop working
  within 4 hours.
