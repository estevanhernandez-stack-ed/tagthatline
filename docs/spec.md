# Tag that Line — Technical Spec

## Stack
- **Frontend:** React + TypeScript + Vite — fast dev server, familiar stack from existing MarcusCorp apps
- **Backend:** Express + TypeScript — thin API layer, handles data loading and session assembly
- **Database:** Firebase Firestore via `@lobby-suite/content-db` — movie data pre-populated by a separate agent before build
- **Hosting:** Firebase Hosting (testing environment) + Cloud Functions for Express backend
- **Styling:** CSS with custom properties for the purple-to-navy gradient, gold accent theme

**Documentation links:**
- [React](https://react.dev/)
- [Vite](https://vite.dev/guide/)
- [Express](https://expressjs.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [TMDb API — Image Basics](https://developer.themoviedb.org/docs/image-basics) (poster URLs use `https://image.tmdb.org/t/p/{size}{file_path}`)

## Runtime & Deployment
- **Runtime:** Web app, browser-based, responsive layout
- **Deployment:** Firebase Hosting (testing level) with Express backend deployed as a Cloud Function
- **Environment requirements:**
  - Node 18 or 20 (Cloud Functions runtime)
  - Firebase CLI (`npm install -g firebase-tools`)
  - Firebase project on Blaze plan (required for Cloud Functions with external network calls)
  - `@lobby-suite/content-db` package for Firestore access
- **Firestore collection:** TBD — Estevan will provide the exact collection name once the data agent populates it

## Architecture Overview

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    Firestore     │──────→│     Express      │──────→│      React       │
│  (content-db)    │       │   (Cloud Func)   │       │    (frontend)    │
│                  │       │                  │       │                  │
│  tagline movies  │  on   │  caches full     │  GET  │  runs game       │
│  + poster-only   │ start │  pool in memory  │ /api/ │  entirely        │
│  movies          │       │  assembles       │session│  client-side     │
│                  │       │  sessions        │       │  after load      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

**Data flow:**
1. Express starts → pulls full movie pool from Firestore via `@lobby-suite/content-db` → caches in memory
2. Player hits Play → frontend calls `GET /api/session`
3. Express picks 10 random tagline movies, selects 3 decoys per round (genre + popularity match) from the full pool → returns session payload
4. Frontend runs all 10 rounds locally — tracks taps, score, streak, timer
5. Frontend calculates final score (time modifier, streak multiplier, 90s bonus) → displays end screen with rating tier
6. Play again → new `GET /api/session` → fresh 10 rounds

**Zero Firestore calls during gameplay. Zero calls back to Express after session loads.**

## Frontend

Implements `prd.md > Starting a Session`, `prd.md > Playing a Round`, `prd.md > Scoring and Streaks`, `prd.md > End Screen`, and `prd.md > Error Handling`.

### App Shell
Top-level component managing which view is active. Four states: `start`, `countdown`, `playing`, `results`. No routing library needed — a single state variable drives view switching.

### Start Screen
Implements `prd.md > Starting a Session` (first story).
- Game title displayed on purple-to-navy gradient background with gold accents
- Single prominent Play button
- No other interactive elements — title and play only

### Countdown
Implements `prd.md > Starting a Session` (second story).
- 3-2-1 countdown sequence after tapping Play
- Ends with a clapboard visual (🎬 emoji or styled element — decide during build)
- Timer does not start until countdown finishes

### Game Screen
Implements `prd.md > Playing a Round`.
- **Tagline display:** prominently readable at a glance, centered above the poster grid
- **Poster grid:** four posters visible simultaneously, no scrolling on any reasonable screen size
- **Tap interaction:** tap-until-correct mechanic
  - First correct tap: 5 points
  - Wrong tap: poster grays out / gets an X, becomes untappable
  - Second correct tap: 3 points
  - Third correct tap: 2 points
  - All three wrong tapped first: correct poster revealed, 0 points
  - Player always sees the correct answer before advancing
  - Player controls when to advance to next round (not auto-advance)
- **Streak counter:** visible during gameplay, tracks consecutive first-tap correct answers
- **Timer:** visible during gameplay, counts up from 0, starts after countdown finishes
- **Responsive layout:** adapts to screen size, always keeps tagline + all four posters in view

### Poster Card
Reusable component for each poster option.
- Displays poster image at appropriate size
- States: default, incorrect (grayed/X), correct (highlighted)
- **Fallback:** if poster image fails to load, displays the movie title in readable format instead. Implements `prd.md > Error Handling`.

### End Screen
Implements `prd.md > End Screen`.
- **Score breakdown:** raw score, best streak, time taken, time modifier, 90-second bonus (if earned), final calculated score
- **Math is visible** — player can see how the final score was calculated
- **Rating title:** one of 7 tiers based on final score, each with a movie quote/reference
  - Tiers 1-3: funny, roast-y movie references
  - Tiers 4-5: playful but not mean
  - Tiers 6-7: genuinely complimentary and hype
- **Play again button:** prominent, one tap back into a fresh session

### Hooks

#### useTimer
Manages the session timer. Starts after countdown, counts up, stops when round 10 completes. Returns elapsed time in seconds.

#### useGameState
Manages all session state: current round index, score, streak, tapped posters per round, session data from the API. Exposes actions: `startSession`, `tapPoster`, `advanceRound`. Computes derived values: current streak, round score, total score.

### Scoring Logic (Client-Side)
Implements `prd.md > Scoring and Streaks`.

All scoring runs in the frontend — no server-side validation needed (no leaderboard, no auth).

- **Per-round scoring:** 5 (first tap) / 3 (second) / 2 (third) / 0 (all wrong first)
- **Streak multiplier:** consecutive first-tap correct answers. Multiplier = streak count. Applies only to first-tap 5-point answers. Any wrong tap resets streak to 0. New streak can begin on any subsequent first-tap correct.
- **Time modifier:** multiplier applied to raw score based on total session time. Bracket-based (exact thresholds tuned during build — shape: faster = higher multiplier, very slow = slight reduction)
- **90-second bonus:** flat point bonus added if session completed in under 90 seconds (exact value tuned during build)
- **Rating tiers:** 7 tiers mapped to final score ranges. Thresholds set during build once scoring formula is finalized and playtested.

## Backend

Implements `prd.md > Tagline Pool` and `prd.md > Playing a Round` (decoy selection).

### Express App Entry
- Initializes Express, registers routes, connects to Firestore via `@lobby-suite/content-db`
- On startup: loads the full movie pool into memory
- Exports the Express app as a Cloud Function via `onRequest(app)`

### Data Loader Service
- Connects to Firestore collection (name TBD) via `@lobby-suite/content-db`
- Pulls all movie documents into memory on startup
- Separates movies into two pools:
  - **Tagline pool:** movies with both a tagline and a poster — eligible as correct answers. Implements `prd.md > Tagline Pool` filter: English-language, reasonably popular, has tagline + poster.
  - **Full pool:** all movies with a poster (including tagline movies) — eligible as decoys
- Caches in memory. No Firestore calls after initial load.

### Session Builder Service
- Receives a request for a new session
- Randomly selects 10 tagline movies from the tagline pool (true random, no persistence, no "seen" tracking — pool depth is the defense against repeats)
- For each selected movie, picks 3 decoy posters from the full pool, filtered by similar genre and popularity to the correct movie. Implements `prd.md > Playing a Round` (decoy story).
- Shuffles the 4 posters (correct + 3 decoys) into random order per round
- Returns the full session payload

### Session API Route
`GET /api/session`

**Response shape:**
```typescript
interface SessionResponse {
  rounds: Round[];
}

interface Round {
  tagline: string;
  correctMovieId: string;
  posters: Poster[]; // 4 posters in shuffled order
}

interface Poster {
  movieId: string;
  title: string;
  posterUrl: string;
}
```

The frontend matches `correctMovieId` against tapped poster's `movieId` to determine correct/incorrect. Movie title is included for the poster fallback (if image fails to load).

## Data Model

### Firestore Collection (name TBD)

Each document represents a movie:

| Field        | Type     | Description                                           | Required |
|-------------|----------|-------------------------------------------------------|----------|
| movieId     | string   | Unique identifier                                     | Yes      |
| title       | string   | Movie title (English)                                 | Yes      |
| tagline     | string   | Movie tagline — blank/empty for decoy-only movies     | No       |
| posterPath  | string   | Poster image path (TMDb format or Firebase Storage)   | Yes      |
| genres      | string[] | Genre tags for decoy matching                         | Yes      |
| popularity  | number   | Popularity score for decoy matching                   | Yes      |

- Movies with a non-empty `tagline` are eligible as correct answers
- All movies with a `posterPath` are eligible as decoys
- Target: 20-50 tagline movies, 100+ total movies for a deep decoy pool

## File Structure

```
tag-that-line/
├── client/                       # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── StartScreen.tsx   # Title + play button
│   │   │   ├── Countdown.tsx     # 3-2-1 + clapboard
│   │   │   ├── GameScreen.tsx    # Round layout: tagline + poster grid
│   │   │   ├── PosterCard.tsx    # Individual poster with tap states + fallback
│   │   │   └── EndScreen.tsx     # Score breakdown + rating + play again
│   │   ├── hooks/
│   │   │   ├── useTimer.ts       # Session timer (count-up)
│   │   │   └── useGameState.ts   # Session state, scoring, streak tracking
│   │   ├── lib/
│   │   │   ├── scoring.ts        # Score calculation, time modifier, rating tiers
│   │   │   ├── types.ts          # Shared TypeScript interfaces
│   │   │   └── constants.ts      # Theme colors, scoring brackets, rating titles
│   │   ├── styles/
│   │   │   └── global.css        # Purple-to-navy gradient, gold accents, typography
│   │   ├── App.tsx               # App shell — view state machine
│   │   └── main.tsx              # Vite entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                       # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── session.ts        # GET /api/session endpoint
│   │   ├── services/
│   │   │   ├── dataLoader.ts     # Firestore → in-memory cache
│   │   │   └── sessionBuilder.ts # Random selection + decoy matching
│   │   ├── types/
│   │   │   └── index.ts          # Movie, Round, Session interfaces
│   │   └── index.ts              # Express app + Cloud Function export
│   ├── package.json
│   └── tsconfig.json
├── firebase.json                 # Hosting rewrites + Functions config
├── .firebaserc                   # Firebase project alias
├── docs/                         # Hackathon artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
└── process-notes.md
```

## Key Technical Decisions

### 1. One API call per session, all game logic client-side
**Decided:** Frontend fetches the full session payload once and runs the game entirely offline.
**Why:** No auth, no leaderboard, no reason to protect scoring server-side. One call eliminates latency during gameplay.
**Tradeoff:** If a leaderboard is added later, scoring would need to move server-side. Acceptable — not in scope.

### 2. Firestore data cached in Express memory, not queried per request
**Decided:** Express loads the full movie pool on startup and serves from memory.
**Why:** Pool is small (100-150 movies max). Eliminates Firestore read costs and latency. The data is pre-populated and static during gameplay.
**Tradeoff:** Server restart needed if the Firestore data changes. Fine for a hackathon — the data is seeded once.

### 3. Scoring formula tuned during build, not locked in spec
**Decided:** Spec defines the shape (time brackets, flat bonus, 7 rating tiers) but exact numbers are set during build.
**Why:** Scoring feel can only be judged by playing the game. Locking numbers now would mean arbitrary thresholds.
**Tradeoff:** Minor ambiguity in the spec. Mitigated by clear structure — only the constants change, not the logic.

## Dependencies & External Services

| Dependency               | Purpose                        | Docs / Notes                                                                 |
|--------------------------|--------------------------------|-----------------------------------------------------------------------------|
| React 18+               | Frontend UI                    | [react.dev](https://react.dev/)                                             |
| Vite                     | Frontend build tool            | [vite.dev](https://vite.dev/guide/)                                         |
| TypeScript               | Type safety across client/server | [typescriptlang.org](https://www.typescriptlang.org/)                      |
| Express                  | Backend API                    | [expressjs.com](https://expressjs.com/)                                     |
| @lobby-suite/content-db  | Firestore access               | Internal MarcusCorp package                                                  |
| Firebase Hosting         | Static file hosting            | [Firebase Hosting docs](https://firebase.google.com/docs/hosting)           |
| Firebase Cloud Functions | Express backend hosting        | [Cloud Functions docs](https://firebase.google.com/docs/functions) — Node 18/20, Blaze plan required |
| Firebase CLI             | Deploy tooling                 | `npm install -g firebase-tools`                                              |
| TMDb image CDN           | Poster images at runtime       | `https://image.tmdb.org/t/p/w342{posterPath}` — [Image docs](https://developer.themoviedb.org/docs/image-basics) |

**No API keys needed at runtime** — poster images are public URLs. TMDb API key is only needed by the data-seeding agent (separate from this app).

## Open Issues

1. **Firestore collection name:** TBD — Estevan will provide once the data agent populates it.
2. **Poster image sizing:** TMDb offers w92, w154, w185, w342, w500, w780, original. `w342` is likely the sweet spot for a 4-poster grid — confirm during build based on layout.
3. **`@lobby-suite/content-db` API surface:** Spec assumes standard Firestore read patterns via this package. Exact import paths and method signatures need to be confirmed against the package before build.
4. **Cloud Functions cold start:** First session request after deploy may be slow (~2-3s). Acceptable for a hackathon demo — could add a warm-up ping if it bothers gameplay.
