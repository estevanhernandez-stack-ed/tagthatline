# Connecting to the Movie Database

## Overview

Tag That Line connects to the **guestbuzz-cineperks** Firestore database — the same shared content database used by CinePerks, WeSeeYouAtTheMovies, Reel Words, Reel Battles, and Box Office Heads Up. It contains 1,870+ movies with trivia questions, metadata, and now **taglines**.

## Firebase Config

No API key or service account needed for reads — the database is open for reads.

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config — store in .env, do NOT commit
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

Create a `.env` file (gitignored) with the actual values. Ask Este for the Firebase credentials.

## Collections

### `movieQuestionStats` — Movie Metadata (1,870+ docs)

This is the main collection. Each document represents one movie.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `movieTitle` | string | Display title | "The Dark Knight" |
| `movieTitleNormalized` | string | Lowercase for queries | "the dark knight" |
| `tagline` | string | Movie tagline from TMDb | "Welcome to a world without rules." |
| `totalQuestions` | number | Trivia questions available | 100 |
| `tmdbId` | number | TMDb movie ID | 155 |
| `posterPath` | string | TMDb poster path | "/qJ2tW6WMUDux..." |
| `certification` | string | Rating | "PG-13" |
| `releaseYear` | number | Year released | 2008 |
| `releaseDate` | string | Full date | "2008-07-18" |
| `genres` | string[] | Genre list | ["Drama", "Action", "Crime"] |
| `kidFriendlyCount` | number | Kid-safe questions | 30 |
| `adultCount` | number | Adult questions | 70 |
| `status` | string | "building" or "complete" | "complete" |

**175 movies currently have taglines.** To get only movies with taglines:

```typescript
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Get 50 movies that have taglines, ordered by most questions (popularity proxy)
const q = query(
  collection(db, 'movieQuestionStats'),
  where('tagline', '!=', null),
  orderBy('tagline'),
  limit(50)
);

const snapshot = await getDocs(q);
snapshot.forEach(doc => {
  const data = doc.data();
  console.log(`${data.movieTitle}: "${data.tagline}"`);
  // Poster: https://image.tmdb.org/t/p/w500${data.posterPath}
});
```

### `questionBank` — Trivia Questions (50,000+ docs)

Individual trivia questions per movie.

| Field | Type | Description |
|-------|------|-------------|
| `movieTitle` | string | Which movie |
| `text` | string | The question text |
| `options` | string[] | 4 answer choices |
| `correctAnswerIndex` | number | 0-3 |
| `hint` | string | Optional hint |
| `isKidFriendly` | boolean | Safe for kids |
| `difficulty` | string | "easy", "medium", "hard" |

```typescript
// Get 5 random questions for a specific movie
const q = query(
  collection(db, 'questionBank'),
  where('movieTitle', '==', 'Inception'),
  limit(5)
);
```

## Poster URLs

TMDb poster images are constructed from the `posterPath` field:

```
https://image.tmdb.org/t/p/w500${posterPath}
```

Sizes available: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`

## Using the content-db Package (Monorepo Only)

If building inside the Quiz Show monorepo, use the shared package instead of raw Firestore:

```typescript
import { getAllMovieStats, getQuestionsFromBank } from '@lobby-suite/content-db';

const stats = await getAllMovieStats();
const questions = await getQuestionsFromBank('The Dark Knight', false, 5);
```

## Quick Start Example

```typescript
// Fetch a random movie with a tagline for the game
async function getRandomTaglineMovie(db) {
  const snapshot = await getDocs(
    query(collection(db, 'movieQuestionStats'), where('tagline', '!=', null))
  );
  
  const movies = [];
  snapshot.forEach(doc => movies.push(doc.data()));
  
  const movie = movies[Math.floor(Math.random() * movies.length)];
  
  return {
    title: movie.movieTitle,
    tagline: movie.tagline,
    year: movie.releaseYear,
    poster: movie.posterPath 
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` 
      : null,
    genres: movie.genres || [],
    rating: movie.certification,
  };
}
```

## Security Rules

- **Reads:** Open to all (no auth required)
- **Writes:** Blocked from client SDK. Use Firebase Admin SDK with the `guestbuzz-cineperks` service account for writes.

## Data Stats

| Metric | Count |
|--------|-------|
| Total movies | 1,870+ |
| Movies with taglines | 175 |
| Movies with 50+ questions | 300+ |
| Total trivia questions | 50,000+ |
| Movies with posters | 1,500+ |
