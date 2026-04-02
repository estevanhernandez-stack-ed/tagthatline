import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// ---------- Firebase init (public, read-only) ----------

const firebaseConfig = {
  apiKey: "AIzaSyCgy-GIFMAvwNErU7iIroFOrH3dFNQKBnk",
  authDomain: "guestbuzz-cineperks.firebaseapp.com",
  projectId: "guestbuzz-cineperks",
  storageBucket: "guestbuzz-cineperks.firebasestorage.app",
  messagingSenderId: "252784643304",
  appId: "1:252784643304:web:6d9017c5e19947b9ae8d5d",
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ---------- Types ----------

export interface MovieDoc {
  movieTitle: string;
  tagline: string;
  posterPath: string;
  genres: string[];
  totalQuestions: number;
  tmdbId: number;
  releaseYear: number;
  certification: string;
}

// ---------- In-memory caches ----------

/** Movies with a non-empty tagline AND posterPath — eligible as correct answers */
let taglinePool: MovieDoc[] = [];

/** All movies with a posterPath — eligible as decoys (superset of taglinePool) */
let fullPool: MovieDoc[] = [];

let loaded = false;

// ---------- Public API ----------

export async function loadMovies(): Promise<void> {
  if (loaded) return;

  const snapshot = await getDocs(collection(db, "movieQuestionStats"));

  const allDocs: MovieDoc[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    allDocs.push({
      movieTitle: d.movieTitle ?? "",
      tagline: d.tagline ?? "",
      posterPath: d.posterPath ?? "",
      genres: Array.isArray(d.genres) ? d.genres : [],
      totalQuestions: d.totalQuestions ?? 0,
      tmdbId: d.tmdbId ?? 0,
      releaseYear: d.releaseYear ?? 0,
      certification: d.certification ?? "",
    });
  });

  taglinePool = allDocs.filter(
    (m) => m.tagline.trim() !== "" && m.posterPath.trim() !== ""
  );

  fullPool = allDocs.filter((m) => m.posterPath.trim() !== "");

  loaded = true;
  console.log(
    `[dataLoader] Loaded ${allDocs.length} docs — ${taglinePool.length} tagline-eligible, ${fullPool.length} poster-eligible`
  );
}

export function getTaglinePool(): MovieDoc[] {
  return taglinePool;
}

export function getFullPool(): MovieDoc[] {
  return fullPool;
}
