# VtM Dice Roller

A shared dice roller for Vampire: the Masquerade. Everyone who opens the page sees every roll live.

## Rules

- Roll a pool of d10s. Each die that meets or beats the difficulty (default 6) is a success.
- 10s are successes and get rerolled, and keep chaining while more 10s come up. A 1 rolled on a reroll does nothing.
- Willpower adds one automatic success.
- If the original pool has any 1s, only the first one takes away a success, including the Willpower success.
- 1 or more successes is a success, exactly 0 is a failure, and below 0 (a 1 with nothing to cancel) is a botch.

## One-time setup

### 1. Firebase (stores the shared roll log)

1. Go to https://console.firebase.google.com and click **Create a project**. Give it any name; you can turn off Google Analytics.
2. In the left menu open **Build → Firestore Database**, click **Create database**, pick a location near you, and choose **Start in production mode**.
3. Open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**.
4. Go to **Project settings** (the gear icon), and under **Your apps** click the web icon `</>`. Register an app with any nickname (skip Firebase Hosting).
5. Copy the values from the `firebaseConfig` it shows into `firebase-config.js`.

The web config isn't a secret. It's meant to be public, and `firestore.rules` controls what anyone can do with it: they can read rolls and add valid new ones, but nobody can edit or delete them.

### 2. GitHub Pages (hosts the site)

1. Create a **public** repository on https://github.com, e.g. `vtm-roller`.
2. Push this folder to it.
3. In the repo, open **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and click **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/vtm-roller/`. Send that link to your players.

## Running locally

```
python -m http.server 8000
```

Then open http://localhost:8000. Until `firebase-config.js` is filled in, rolls show only on your own screen.
