# 🌱 Touch Grass

A playful React web app that makes you prove you went outside. Snap or upload a photo, and the app analyzes it in the browser to decide whether you actually touched grass. It then roasts or praises you, tracks your streak, and ranks you on a leaderboard.

## Features

- **Photo check-ins**: take a photo with your phone camera or upload one from your device
- **In-browser image analysis**: pixel-level brightness and color analysis on an HTML canvas, with no server round-trip
- **Streaks and stats**: current streak, best streak, and success rate
- **Achievements**: unlock badges such as *On Fire* (3-day streak) and *Grass Master* (25 successful touches)
- **Leaderboard**: top 10 users ranked by best streak
- **History**: your 20 most recent check-ins, with the verdict and commentary for each
- **Mobile-first UI**: built with Tailwind CSS and Lucide icons

## How the grass detection works

The uploaded image is drawn onto an offscreen `<canvas>`, and every pixel is inspected:

1. **Brightness**: the average of the R, G and B channels across the image. Outdoor daylight photos score above 100/255.
2. **Greenness**: the share of pixels where green is the dominant channel and bright enough to count (`g > r && g > b && g > 100`). Grass-heavy photos have more than 10% of these pixels.

A photo counts as "touching grass" only when it is **both** bright and green. The result screen shows both measurements, so users can see why a photo passed or failed.

## Tech stack

| Layer   | Technology                               |
| ------- | ---------------------------------------- |
| UI      | React 19, Tailwind CSS 3, Lucide React   |
| Tooling | Create React App (`react-scripts`)       |
| Storage | Browser `localStorage` (no backend)      |
| Testing | Jest, React Testing Library              |

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/djdelacruz2024/touch-grass-app.git
cd touch-grass-app
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000). Enter any username to start; no account or password is required.

### Scripts

| Command         | Description                                   |
| --------------- | --------------------------------------------- |
| `npm start`     | Run the development server with hot reload    |
| `npm test`      | Run the test suite in watch mode              |
| `npm run build` | Create an optimized production build in `build/` |

## Project structure

```
src/
├── App.js         # All views: login, camera, leaderboard, history, profile
├── storage.js     # Async key/value wrapper around localStorage
├── App.test.js    # Component tests
└── index.js       # React entry point
```

## Limitations and future work

- **Heuristic detection**: bright green scenes (a sunny park, or a green wall) are what pass, not grass specifically. A natural next step is an image-classification model such as a TensorFlow.js model running in the browser.
- **Local-only data**: users, history and the leaderboard live in the browser's `localStorage`, so they aren't shared across devices. A backend (for example Firebase or Supabase) would make the leaderboard global and add real authentication.
- **One photo per streak day is not enforced**: each successful photo increases the streak, even when several are taken on the same day.
