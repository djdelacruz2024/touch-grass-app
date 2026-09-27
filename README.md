# 🌱 Touch Grass

A playful web app that makes you prove you went outside. Snap or upload a photo of yourself touching grass. Claude's vision model judges whether it's real, then praises or roasts you. The app also tracks your daily streak and ranks you on a leaderboard.

**Live demo:** [touch-grass-app-beta.vercel.app](https://touch-grass-app-beta.vercel.app/)

## Features

- **Photo check-ins**: take a photo with your phone camera or upload one from your device
- **AI judging**: Claude checks that a real person is touching real, outdoor grass. It isn't fooled by houseplants, screens, paintings, or a lawn with nobody on it.
- **Daily streaks**: one successful check-in per day keeps the streak alive. A failed photo never breaks it; missing a day does.
- **Achievements**: unlock badges such as *On Fire* (3-day streak) and *Grass Master* (25 successful touches)
- **Leaderboard**: top 10 users ranked by best streak
- **History**: your 20 most recent check-ins, with the verdict and commentary for each
- **Mobile-first UI**: built with Tailwind CSS and Lucide icons

## How it works

```
Browser (React)                        Vercel serverless function         Claude API
───────────────                        ──────────────────────────         ──────────
photo → resize to ≤1024px JPEG ──POST /api/analyze──▶ validate image ──────▶ vision model
                                                         │                    │
result card ◀──── { touching_grass, confidence, ◀───────┴── structured JSON ◀┘
                    reason, roast_or_praise }
```

1. The browser downscales the photo on a canvas, which keeps uploads small and fast.
2. [`api/analyze.mjs`](api/analyze.mjs) validates the image and sends it to Claude with a judging prompt. It asks for a response that must match a [zod](https://zod.dev) schema, so the app always gets well-formed JSON back.
3. The API key stays on the server and is never shipped to the browser.
4. If a check fails (unreadable image, network error, or API error), the app shows an error, and the attempt is not counted against your stats or streak.

## Tech stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, Tailwind CSS 3, Lucide React                  |
| Backend  | Vercel serverless function (Node.js)                    |
| AI       | Claude vision via the Anthropic SDK, with structured outputs |
| Storage  | Browser `localStorage`                                  |
| Testing  | Jest, React Testing Library                             |

## Getting started

**Prerequisites:** Node.js 20+, npm, and an [Anthropic API key](https://console.anthropic.com/).

```bash
git clone https://github.com/djdelacruz2024/touch-grass-app.git
cd touch-grass-app
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
npm run dev
```

The app opens at [http://localhost:3000](http://localhost:3000). `npm run dev` starts the React dev server together with a local copy of the API on port 3001, and the dev server forwards `/api/*` requests to it. Enter any username to start; no account or password is required.

### Scripts

| Command         | Description                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Run the app and the local API together (recommended)    |
| `npm start`     | Run only the React dev server                           |
| `npm run api`   | Run only the local API server                           |
| `npm test`      | Run the test suite in watch mode                        |
| `npm run build` | Create an optimized production build in `build/`        |

### Environment variables

| Variable            | Required | Description                                         |
| ------------------- | -------- | --------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Yes      | Used by the API function to call Claude             |
| `CLAUDE_MODEL`      | No       | Overrides the model (default: `claude-opus-5`)      |

## Deployment

The app deploys to [Vercel](https://vercel.com) with no extra configuration. Vercel builds the React app and turns [`api/analyze.mjs`](api/analyze.mjs) into a serverless function. Add `ANTHROPIC_API_KEY` under **Project Settings → Environment Variables**; every push to `main` then deploys automatically.

## Project structure

```
api/
└── analyze.mjs       # Serverless function: sends the photo to Claude, returns a verdict
server/
└── dev-api.mjs       # Local stand-in for Vercel's /api routes
src/
├── App.js            # All views: login, camera, leaderboard, history, profile
├── streak.js         # Daily streak rules
├── storage.js        # Async key/value wrapper around localStorage
├── App.test.js       # Component tests (API mocked)
├── streak.test.js    # Streak rule tests
└── index.js          # React entry point
```

## Limitations and future work

- **Local-only data**: users, history and the leaderboard live in the browser's `localStorage`, so they aren't shared across devices. A database (for example Supabase or Vercel KV) would make the leaderboard global and add real accounts.
- **No rate limiting**: the analyze endpoint is public, so anyone can call it. For wider use, add per-IP rate limiting and set a spend limit on the Anthropic account.
