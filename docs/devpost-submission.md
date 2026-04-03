# Tag that Line — Devpost Submission

## Project Name
Tag that Line

## Tagline
Match the tagline to the movie poster — 10 rounds, streaks, and movie-themed ratings.

## Built With
TypeScript, React, Vite, Express, Firebase Hosting, Firebase Cloud Functions, Firestore, TMDb

## Links
- **Live app:** https://tagthatline.web.app
- **GitHub repo:** https://github.com/estevanhernandez-stack-ed/tagthatline

---

## Elevator Pitch

A 10-round visual trivia game matching iconic movie taglines to real posters. Read the line, tap the poster, build streaks, and race to see if you're an "Award Season Legend" or "Straight to DVD"!

---

## Project Story

### Inspiration

I was sitting in the office at the Denton Movie Tavern when I looked over at Chris Carter and said, "You like movies, and games, and word games. How about a game where you have to connect the tagline for a movie to the poster?"

### What it does

Tag that Line is a movie tagline trivia game. You read a famous tagline and pick the correct poster from four options — 10 rounds per session. Nail it on the first tap for 5 points, build consecutive streaks for multipliers, and race the clock for a time bonus. At the end, you get a full score breakdown and a movie-themed rating from "Straight to DVD" to "Award Season Legend."

### Why we built it

There's a gap in the market. Tagline Toss Up is text-only. Movie Geek does progressive-reveal trivia. Sporcle has tagline quizzes in spreadsheet format. Nobody is doing the visual match — tagline meets poster in a polished, designed experience. Tag that Line was built to fill that gap with a game that has real personality: purple-to-navy gradients, gold accents, and movie-themed roast ratings that make you want to screenshot your score.

### How we built it

The entire project was built using spec-driven development — scope document, product requirements, technical spec, and a sequenced build checklist — all before writing a single line of code.

**Stack:**
- **Frontend:** React + TypeScript + Vite — state machine architecture with four views (start, countdown, gameplay, results)
- **Backend:** Express + TypeScript deployed as a Firebase Cloud Function — loads 1,870+ movies from a shared Firestore database, assembles randomized sessions with genre-matched decoy posters
- **Data:** Firestore collection with 175 tagline movies and 1,868+ poster movies from the guestbuzz-cineperks shared content database (the same database powering CinePerks, Reel Words, Reel Battles, and Box Office Heads Up)
- **Deployment:** Firebase Hosting (frontend) + Cloud Functions (backend API)
- **Design:** CSS custom properties for the theater-lobby aesthetic — purple-to-navy gradient, gold accents, premium typography

The game fetches a single API payload at the start of each session and runs entirely client-side after that — zero server calls during gameplay. Scoring, streaks, timer, and ratings all compute in the browser.

### What we learned

Spec-driven development works. Every screen, mechanic, and scoring formula was documented before building. When we hit deployment issues — the Firebase client SDK had connectivity problems in Cloud Functions — the clean separation of concerns made it easy to swap the data layer to a REST API without touching game logic. The plan adapted to reality, and that's exactly what plans are for.

### What's next

- **Deeper tagline pool** — expand beyond 175 with difficulty tiers (easy/medium/hard)
- **Community median time bonus** — reward players who finish under the community average
- **Share/social features** — the roast ratings are screenshot-worthy, so explicit sharing would amplify that
- **Multi-match mode** — four taglines matched to multiple posters in a drag-and-drop format
- **Welcome screen visual collage** — movie posters and tagline snippets as lobby decoration

---

## Screenshot Descriptions
1. **Start screen** — "Tag that Line" title on purple-to-navy gradient with gold Play button
2. **Gameplay** — Tagline displayed above a 2x2 poster grid, round indicator, timer, and score
3. **Streak moment** — Fire emoji streak counter visible during consecutive first-tap correct answers
4. **End screen** — Full score breakdown with rating title, time modifier, and Play Again button
