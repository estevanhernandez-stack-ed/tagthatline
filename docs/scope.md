# Tag that Line

## Idea
A movie tagline-to-poster matching game where players read a famous tagline and pick the correct movie poster from four options — 10 rounds per session, scored with streak tracking and a timer.

## Who It's For
Movie aficionados, film buffs, and moviegoers — especially customers of movie theaters. People who appreciate the forgotten art of movie taglines and want a quick, replayable game with personality.

## Inspiration & References
- [Tagline Toss Up](https://www.amazon.com/Tagline-Toss-Up-Movie-Trivia/dp/B009KY00XE) — text-only tagline guessing with arcade/survival/casual modes. No visual component, no design energy. Proves the concept works but leaves the visual match completely untapped.
- [Movie Geek](https://apps.apple.com/us/app/movie-geek-a-film-quiz/id924869841) — progressive-reveal trivia (poster, cast, director, tagline). Smart mechanic but different format — "name the movie" not "match tagline to poster."
- [Sporcle tagline quizzes](https://www.sporcle.com/games/tags/movietaglines) — massive library, community-driven, but all text-in-a-list. No posters, no visual game feel.
- **Key gap in the market:** Nobody is doing the visual match — tagline meets poster in a polished, designed experience. Everything out there is either text-only trivia or poster-only identification.

Design energy: Purple-to-navy-blue gradient background, gradient buttons, touches of gold. Premium movie-night feel — consistent with the existing We See You at the Movies universe (weseeyouatthemovies.firebaseapp.com). Should feel like a theater lobby, not a quiz template. Expressive, confident, alive.

## Goals
- Build a tight, replayable game loop that feels good to play
- Showcase the movie-theater aesthetic universe (purple/navy/gold)
- Leverage existing MarcusCorp/626 Labs infrastructure (Firebase content-db, TMDb API)
- Create something that could eventually slot into the Lobby Suite ecosystem
- Demonstrate spec-driven development with a polished, shippable product

## What "Done" Looks Like
A web app where you:
1. Land on a styled start screen
2. Hit play and get 10 rounds of "here's a tagline, pick the right poster from four"
3. A timer counts up through the session (speed modifier for streak)
4. See your final score (correct/total), streak count, and a movie-themed rating title
   - Bottom 5 ratings are funny and roast-y (e.g., "Hasta la vista, baby")
   - Top 5 ratings are genuinely complimentary
5. Get invited to play again and beat your score
6. Every session pulls randomly from a deep tagline pool — never starts with the same tagline twice

Built with TypeScript, React, Express, and a lightweight local database. Ties into the existing Firebase content-db for movie data. Styled with the purple-to-navy gradient, gold accents, gradient buttons.

## What's Explicitly Cut
- **User authentication / login** — no accounts, no saved sessions. You play, you score, you play again.
- **Persistent user history** — no tracking across sessions. Replay value comes from pool depth and randomization, not progress saving.
- **Multiple difficulty tiers** — ship with one solid pool. Easy/medium/hard can come later if the tagline data supports it.
- **Multi-match mode** — the four-taglines-to-multiple-posters drag-and-drop variant. Cool idea, but the one-tagline-four-posters format is cleaner to build and immediately readable as a game.
- **Share/social features** — the roast ratings will make people want to screenshot, but building explicit share functionality is out of scope.

## Loose Implementation Notes
- **Data sources:** TMDb API for taglines (movie details endpoint) and poster images. Existing `@lobby-suite/content-db` package for movie catalog and poster paths from Firebase/Firestore (`movieQuestionStats` collection).
- **Tagline sourcing is the critical path.** The `questionBank` has trivia questions but not taglines specifically. Need to pull taglines from TMDb movie details or source them separately. Pool depth drives replay value.
- **Decoy poster selection:** When presenting four poster options, the three wrong answers should be plausible — similar era, genre, or popularity to avoid obvious eliminations.
- **Randomization:** Solid shuffle algorithm, never start with the same tagline. With no user sessions, can't track "seen" taglines, so pool size is the defense against repeats.
- **Timer:** Counts up, doesn't penalize. Fast + accurate = streak modifier for the end-of-session rating.
- **Stack:** TypeScript, React (frontend), Express (backend/API layer), lightweight local database for tagline game data (SQLite or similar — keep it simple). Firebase content-db (`@lobby-suite/content-db`) for movie catalog and poster paths. No need for a full Postgres setup when the heavy lifting is already in Firestore.
