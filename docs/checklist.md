# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A (autonomous mode)
- **Git:** Commit after each checklist item with message: "Complete step N: [title]"
- **Verification:** Yes — checkpoints every 4-5 items
- **Check-in cadence:** N/A (autonomous mode)

## Checklist

- [x] **1. Seed the Firestore database with tagline and decoy movies**
  Spec ref: `spec.md > Data Model > Firestore Collection`
  What to build: Populate the Firestore collection with movie documents. 20+ movies must have both a `tagline` and `posterPath` (eligible as correct answers). 50-100 additional movies need only a `posterPath` (decoy pool). Every document needs `movieId`, `title`, `posterPath`, `genres`, and `popularity`. Movies should be English-language, reasonably popular titles the target audience would recognize. Taglines sourced from TMDb movie details. Estevan provides the collection name.
  Acceptance: Firestore collection contains 20+ tagline movies and 50+ poster-only movies. Each document has all required fields. Tagline movies have non-empty taglines. All movies have valid TMDb poster paths.
  Verify: Open Firebase Console, navigate to the collection, and confirm document count and field structure. Spot-check 5 tagline movies and 5 decoy-only movies for complete, accurate data.

- [x] **2. Express backend — data loader and session endpoint**
  Spec ref: `spec.md > Backend > Express App Entry`, `spec.md > Backend > Data Loader Service`, `spec.md > Backend > Session Builder Service`, `spec.md > Backend > Session API Route`
  What to build: Scaffold the Express + TypeScript server. Implement the data loader service that connects to Firestore via `@lobby-suite/content-db`, pulls all movie documents into memory on startup, and separates them into tagline pool and full pool. Implement the session builder that randomly selects 10 tagline movies, picks 3 decoys per round filtered by genre and popularity similarity, and shuffles poster order. Expose `GET /api/session` returning the `SessionResponse` shape from the spec. Export the Express app for Cloud Functions via `onRequest(app)`.
  Acceptance: Hitting `GET /api/session` returns a JSON payload with 10 rounds, each containing a tagline string, a correctMovieId, and 4 shuffled posters with movieId, title, and posterUrl. Decoys are plausible (similar genre/popularity). No duplicate movies across rounds.
  Verify: Run the Express server locally and `curl http://localhost:PORT/api/session`. Confirm the response shape matches the spec. Check that decoy posters are genre-appropriate and poster URLs resolve to real images.

- [x] **3. React app shell and styled start screen**
  Spec ref: `spec.md > Frontend > App Shell`, `spec.md > Frontend > Start Screen`
  What to build: Scaffold the Vite + React + TypeScript frontend. Build the App component as a state machine with four views: `start`, `countdown`, `playing`, `results`. Build the StartScreen component — game title, single prominent Play button, no other interactive elements. Apply the purple-to-navy gradient background, gold accents, and theater-lobby typography via CSS custom properties in `global.css`.
  Acceptance: The start screen displays the game title on the purple-to-navy gradient with gold accents. The Play button is prominent and clearly tappable. No other interactive elements are visible.
  Verify: Run `npm run dev`, open the browser, and confirm the start screen matches the theater-lobby aesthetic — gradient background, gold accents, title, and a single Play button.

- [x] **4. Countdown sequence**
  Spec ref: `spec.md > Frontend > Countdown`
  What to build: Build the Countdown component. After tapping Play, display a 3-2-1 countdown on screen, ending with a clapboard visual (🎬 emoji or styled element). Wire the App shell so tapping Play transitions to the countdown view, and the countdown completing transitions to the playing view. The timer must not start until the countdown finishes.
  Acceptance: Tapping Play triggers a visible 3-2-1 countdown. The countdown ends with a clapboard visual. After the clapboard, the view transitions to the game screen.
  Verify: Run dev server, tap Play, and watch the countdown animate through 3-2-1 and the clapboard before the game screen appears.

- [x] **5. Game screen — tagline display, poster grid, and tap mechanic**
  Spec ref: `spec.md > Frontend > Game Screen`, `spec.md > Frontend > Poster Card`
  What to build: Build the GameScreen component — fetch a session from `GET /api/session` when entering the playing state, display the current round's tagline prominently above a 2x2 poster grid. Build the PosterCard component with tap states: default, incorrect (grayed/X, untappable), correct (highlighted). Implement the tap-until-correct mechanic: first correct tap = 5 pts, second = 3 pts, third = 2 pts, all wrong first = 0 pts. Player always sees the correct poster highlighted before advancing. Player controls when to advance (tap/button to go to next round). Implement poster fallback — if an image fails to load, display the movie title instead.
  Acceptance: A tagline and four posters are visible simultaneously without scrolling. Tapping a wrong poster grays it out. Tapping the correct poster highlights it. Points are awarded per the 5/3/2/0 scheme. The correct poster is always revealed. Player advances manually. Broken poster images show the movie title.
  Verify: Run dev server, play through several rounds. Deliberately tap wrong posters to confirm gray-out and scoring. Check that the layout works on different window sizes. Test poster fallback by temporarily breaking an image URL.

  **🔲 CHECKPOINT — Pause here.** Run the app end-to-end from start screen through several gameplay rounds. Confirm the data pipeline (Firestore → Express → React) is working, posters are loading, and the tap mechanic feels right.

- [ ] **6. Scoring, streak tracking, and timer**
  Spec ref: `spec.md > Frontend > Hooks > useTimer`, `spec.md > Frontend > Hooks > useGameState`, `spec.md > Frontend > Scoring Logic`
  What to build: Implement the `useTimer` hook — starts after countdown, counts up, visible during gameplay, stops when round 10 completes. Implement streak tracking in `useGameState` — consecutive first-tap correct answers, multiplier = streak count, resets on any wrong tap, new streak can begin anytime. Display the streak counter and timer visibly during gameplay. Implement the scoring logic in `scoring.ts` — per-round 5/3/2/0 scoring, streak multiplier on first-tap answers, time modifier as a bracket-based multiplier on raw score, flat 90-second bonus. Define the 7 rating tiers with movie-themed titles and score thresholds.
  Acceptance: Timer counts up during gameplay and is visible. Streak counter is visible and updates correctly (increments on first-tap correct, resets on any wrong tap). End-of-session calculation includes raw score, streak multiplier, time modifier, and 90-second bonus. The math is correct.
  Verify: Play a full 10-round session. Watch the timer and streak counter during gameplay. Check that first-tap correct answers build the streak and any wrong tap resets it. Note your raw score and verify the final calculation makes sense.

- [ ] **7. End screen — score breakdown, rating title, play again**
  Spec ref: `spec.md > Frontend > End Screen`
  What to build: Build the EndScreen component. Display the full score breakdown: raw score, best streak, time taken, time modifier, 90-second bonus (if earned), and final calculated score. Show the math visibly so the player can trace the calculation. Display the rating title from the 7-tier system based on final score. Add a prominent Play Again button that starts a fresh session with a new `GET /api/session` call.
  Acceptance: End screen shows all score components and the visible calculation. Rating title matches the score tier. Play Again button starts a completely fresh session with new random taglines.
  Verify: Complete a full session and review the end screen. Verify the math adds up. Tap Play Again and confirm a fresh session with different taglines loads.

- [ ] **8. Visual polish and responsive layout pass**
  Spec ref: `spec.md > Frontend > Game Screen` (responsive layout), `spec.md > Stack` (CSS custom properties)
  What to build: Polish all screens to match the theater-lobby aesthetic — consistent purple-to-navy gradient, gold accents, gradient buttons across every view. Ensure the game screen layout is responsive: tagline + all four posters visible without scrolling on mobile, tablet, and desktop. Polish the countdown animation, poster card transitions (tap feedback, gray-out, correct highlight), and end screen score reveal. Typography and spacing should feel premium, not template-y.
  Acceptance: All screens use the consistent purple/navy/gold theme. The game is fully playable without scrolling on mobile-width screens. Tap feedback is smooth and clear. The overall feel is "theater lobby, not quiz template."
  Verify: Run the app and play through a full session on both desktop and a mobile-width browser window. Check that every screen feels polished and on-brand. No layout breaks, no unstyled elements.

  **🔲 CHECKPOINT — Pause here.** Play a complete session from start to finish on both desktop and mobile. Check scoring math, rating tiers, visual consistency, and overall game feel. This is the last check before deployment.

- [ ] **9. Deploy to Firebase Hosting**
  Spec ref: `spec.md > Runtime & Deployment`
  What to build: Configure `firebase.json` for Hosting (static frontend) + Cloud Functions (Express backend) with rewrites. Set up `.firebaserc` with the project alias. Build the frontend for production. Deploy the Express backend as a Cloud Function. Deploy the frontend to Firebase Hosting. Confirm the live app works end-to-end.
  Acceptance: The app is accessible at the Firebase Hosting URL. `GET /api/session` works through the Cloud Function. A full game session plays through without errors on the live deployment.
  Verify: Open the Firebase Hosting URL in a browser. Play a complete session on the live deployment. Check that poster images load, scoring works, and Play Again starts a fresh session.

- [ ] **10. Submit your project to Devpost**
  Spec ref: `prd.md > What We're Building` (the core submission story)
  What to build: Walk through the Devpost submission form. Write a project name and tagline. Draft the project story using scope.md and prd.md as source material — explain what you built, why, and what you learned. Add "built with" tags for the tech stack (TypeScript, React, Express, Firebase, TMDb). Take screenshots of the working app: start screen, gameplay round, streak/multiplier moment, end screen with rating. Record a Spotlight tour demo video and upload to YouTube. Link the video in the submission. Upload the docs/ folder artifacts (scope, PRD, spec, checklist). Link the GitHub repo (https://github.com/estevanhernandez-stack-ed/tagthatline). Link the live Firebase deployment. Review everything and submit.
  Acceptance: Submission is live on Devpost with project name, tagline, description, built-with tags, screenshots, demo video, docs artifacts, repo link, and live deployment link. All required fields are complete.
  Verify: Open your Devpost submission page and confirm the green "Submitted" badge appears. Read the project description — would someone who knows nothing about your project understand what it does and why it matters? Watch the embedded video to confirm it plays.
