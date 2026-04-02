# Tag that Line — Product Requirements

## Problem Statement
Movie tagline trivia exists only as text-based quizzes or poster-only identification games — nobody is doing the visual match of tagline to poster. Film buffs and moviegoers have no polished, designed experience that tests their tagline knowledge against actual movie posters. Tag that Line fills that gap with a fast, replayable 10-round game that feels like a theater lobby, not a quiz template.

## User Stories

### Starting a Session

- As a movie fan, I want to land on a clean, styled start screen so that I immediately know what this game is and feel the movie-night energy.
  - [ ] Start screen displays the game title on the purple-to-navy gradient background with gold accents
  - [ ] A single play button is prominent and clearly tappable
  - [ ] No other interactive elements — just title and play

- As a player, I want a countdown after I hit play so that I have a beat to get ready before the game starts.
  - [ ] After tapping play, a 3-2-1 countdown appears on screen
  - [ ] The countdown ends with a clapboard visual (emoji or styled element)
  - [ ] The timer does not start until the countdown finishes and the first tagline appears

### Playing a Round

- As a player, I want to see a tagline and four movie posters all at once so that I can read, decide, and tap without scrolling or hunting.
  - [ ] The tagline is displayed prominently — easy to read at a glance
  - [ ] Four movie posters are visible on screen simultaneously
  - [ ] On any reasonable screen size, the full round is visible without scrolling
  - [ ] Layout adapts to screen size but always keeps tagline and all four posters in view

- As a player, I want to tap posters until I find the right one so that I stay in control of the pace and always learn the correct answer.
  - [ ] Tapping the correct poster on the first try awards 5 points
  - [ ] Tapping a wrong poster visually marks it as incorrect (grayed out, X, or similar) and it becomes untappable
  - [ ] Second correct tap awards 3 points
  - [ ] Third correct tap awards 2 points
  - [ ] If all three wrong posters are tapped first, the correct poster is revealed and the player gets 0 points
  - [ ] The player always sees which poster was correct before moving on
  - [ ] After finding the correct poster, the player advances to the next round (they control when, not auto-advance)

- As a player, I want plausible decoy posters so that the game feels fair and I can't just eliminate obvious wrong answers.
  - [ ] The three wrong posters are selected based on similar genre and popularity to the correct movie
  - [ ] Decoys are drawn from the same pool of English-language, reasonably popular movies
  - [ ] No decoy is so obscure or so obviously different that it gives away the answer

### Scoring and Streaks

- As a player, I want my consecutive first-tap correct answers to build a streak multiplier so that confidence and momentum are rewarded.
  - [ ] A streak counter tracks consecutive rounds answered correctly on the first tap
  - [ ] The streak multiplier equals the current streak count (streak of 3 = 3x multiplier)
  - [ ] The multiplier applies only to first-tap answers (5-point base)
  - [ ] Any wrong tap on any round resets the streak to 0
  - [ ] A new streak can begin on any subsequent first-tap correct answer
  - [ ] The streak counter is visible during gameplay

- As a player, I want a timer running through my session so that speed adds excitement and factors into my final score.
  - [ ] The timer counts up from 0, starting when the first tagline appears (after countdown)
  - [ ] The timer is visible during gameplay
  - [ ] The timer stops when the player completes round 10
  - [ ] Total time is used to calculate a time modifier applied to the final score
  - [ ] Completing the session in under 90 seconds earns a bonus on top of the time modifier

### End Screen

- As a player, I want to see a full score breakdown after my session so that I understand how I performed and what contributed to my score.
  - [ ] End screen displays: raw score, streak count (best streak), time taken, time modifier, 90-second bonus (if earned), and final calculated score
  - [ ] The time modifier is applied as a multiplier to the raw score
  - [ ] The math is visible — the player can see how their final score was calculated

- As a player, I want a movie-themed rating title based on my performance so that the result feels personal and entertaining.
  - [ ] 7 rating tiers based on final score after all modifiers
  - [ ] Bottom tiers (roughly 1-3) are funny, roast-y movie references
  - [ ] Middle tiers (roughly 4-5) are playful but not mean
  - [ ] Top tiers (roughly 6-7) are genuinely complimentary and hype
  - [ ] Each tier has a distinct movie quote or reference that fits the vibe

- As a player, I want to immediately play again so that the game loop stays tight and replayable.
  - [ ] A play again button is prominent on the end screen
  - [ ] Tapping play again starts a fresh session with a new random pull from the pool
  - [ ] No other navigation required — one tap back into the game

### Tagline Pool

- As a player, I want every session to feel different so that I keep coming back.
  - [ ] Minimum 20 taglines in the pool for the demo (target: more)
  - [ ] Each session randomly selects 10 taglines from the pool
  - [ ] True random selection — no persistence, no "seen" tracking
  - [ ] Pool depth is the defense against repeat sessions
  - [ ] Only movies with both a tagline and a poster image are included in the pool
  - [ ] Movies are filtered for English-language, reasonably popular titles the target audience would recognize

### Error Handling

- As a player, I want the game to handle missing poster images gracefully so that a broken image doesn't ruin a round.
  - [ ] If a poster image fails to load, the movie title is displayed in its place
  - [ ] The movie title is cleaned up from the image filename — proper spacing, readable format
  - [ ] The round remains fully playable with text fallback posters

## What We're Building
Everything above — a complete 10-round tagline-to-poster matching game with:
- Styled start screen (title + play button on purple-to-navy gradient with gold accents)
- 3-2-1 countdown with clapboard before the first round
- Gameplay: tagline + four posters visible at once, tap-until-correct mechanic
- Scoring: 5/3/2/0 per round with streak multiplier on first-tap answers
- Timer: counts up, time modifier as multiplier on final score, 90-second bonus
- Smart decoy selection based on genre and popularity
- End screen: full score breakdown, 7-tier movie-themed ratings, play again button
- Tagline pool: 20+ English-language popular movies with taglines and posters
- Poster fallback: movie title displayed if image fails to load

## What We'd Add With More Time
- **Welcome screen visual collage** — movie posters and tagline snippets scattered as decoration on the start screen. Intentionally mismatched so players can't cheese answers from the lobby. (Estevan already built a poster pile collage prototype.)
- **Community median time bonus** — measure completion times across all players and award a bonus for finishing under the median (or 10 seconds under it). Drives community competition and return visits.
- **Deeper tagline pool** — expand well beyond 20, potentially with difficulty tiers (easy/medium/hard) based on how recognizable the tagline is.
- **Multi-match mode** — four taglines matched to multiple posters in a drag-and-drop format. Different game feel, higher complexity.
- **Share/social features** — the roast ratings will make people want to screenshot. Explicit share functionality would amplify that.
- **Persistent session history** — track scores across sessions, show personal bests, graph improvement over time.
- **Smarter repeat prevention** — track seen taglines per player and ensure fresh pulls across sessions.

## Non-Goals
- **No user authentication or accounts.** The game is sessionless — play, score, play again. No login, no saved profiles.
- **No persistent user history.** No cross-session tracking. Replay value comes from pool depth and randomization.
- **No multiple difficulty tiers.** Ship with one solid pool. Difficulty tiers require more tagline data and balancing.
- **No international/non-English taglines.** The target audience is English-speaking moviegoers. Bollywood, foreign cinema, etc. are out of scope.
- **No drag-and-drop multi-match mode.** The one-tagline-four-posters format is cleaner and immediately readable as a game.

## Open Questions
- **Time modifier formula:** What's the exact multiplier curve based on total session time? Needs to feel rewarding without making raw score irrelevant. (Resolve in /spec.)
- **90-second bonus value:** How much does the under-90-second bonus add? Needs to be meaningful but not game-breaking. (Resolve in /spec.)
- **Rating tier score thresholds:** With streak multipliers and time modifiers, the theoretical max score could be very high. Need to map the 7 tiers to score ranges once the math is finalized. (Resolve in /spec.)
- **Tagline data source:** TMDb movie details endpoint has taglines, but coverage varies. Need to confirm pool can hit 20+ quality taglines from available data. (Resolve before /build.)
- **Clapboard visual:** Emoji (🎬) or a styled/animated element? Depends on how much time the countdown deserves. (Can decide during /build.)
