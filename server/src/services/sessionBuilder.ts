import { MovieDoc, getTaglinePool, getFullPool } from "./dataLoader";

// ---------- Types ----------

export interface Poster {
  movieId: string;
  title: string;
  posterUrl: string;
}

export interface Round {
  tagline: string;
  correctMovieId: string;
  posters: Poster[];
}

export interface SessionResponse {
  rounds: Round[];
}

// ---------- Helpers ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function movieId(m: MovieDoc): string {
  return String(m.tmdbId);
}

function posterUrl(m: MovieDoc): string {
  return `https://image.tmdb.org/t/p/w342${m.posterPath}`;
}

function toPoster(m: MovieDoc): Poster {
  return {
    movieId: movieId(m),
    title: m.movieTitle,
    posterUrl: posterUrl(m),
  };
}

/**
 * Pick up to `count` decoys from `candidates`, preferring genre overlap and
 * similar popularity (totalQuestions) to the correct movie.
 */
function pickDecoys(
  correct: MovieDoc,
  candidates: MovieDoc[],
  count: number
): MovieDoc[] {
  const correctGenres = new Set(correct.genres);

  // Score each candidate: genre overlap first, then closeness in popularity
  const scored = candidates.map((c) => {
    const genreOverlap = c.genres.filter((g) => correctGenres.has(g)).length;
    const popDiff = Math.abs(c.totalQuestions - correct.totalQuestions);
    return { movie: c, genreOverlap, popDiff };
  });

  // Sort: most genre overlap first, then smallest popularity difference
  scored.sort((a, b) => {
    if (b.genreOverlap !== a.genreOverlap) return b.genreOverlap - a.genreOverlap;
    return a.popDiff - b.popDiff;
  });

  return scored.slice(0, count).map((s) => s.movie);
}

// ---------- Public API ----------

export function buildSession(): SessionResponse {
  const taglinePool = getTaglinePool();
  const fullPool = getFullPool();

  if (taglinePool.length < 10) {
    throw new Error(
      `Not enough tagline movies to build a session (need 10, have ${taglinePool.length})`
    );
  }

  // Pick 10 random tagline movies for the rounds
  const shuffledTagline = shuffle(taglinePool);
  const roundMovies = shuffledTagline.slice(0, 10);

  // Track every movie used in this session to avoid duplicates
  const usedIds = new Set<string>(roundMovies.map(movieId));

  const rounds: Round[] = roundMovies.map((correct) => {
    // Build candidate list: full pool minus any movie already used
    const candidates = fullPool.filter((m) => !usedIds.has(movieId(m)));

    const decoys = pickDecoys(correct, candidates, 3);

    // Mark decoys as used
    decoys.forEach((d) => usedIds.add(movieId(d)));

    const posters = shuffle([correct, ...decoys].map(toPoster));

    return {
      tagline: correct.tagline,
      correctMovieId: movieId(correct),
      posters,
    };
  });

  return { rounds };
}
