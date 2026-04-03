// ---------- Firestore REST API ----------
// Uses the public REST API to read from guestbuzz-cineperks Firestore.
// More reliable in Cloud Functions than the Firebase client SDK.

const PROJECT_ID = "guestbuzz-cineperks";
const COLLECTION = "movieQuestionStats";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;

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

let taglinePool: MovieDoc[] = [];
let fullPool: MovieDoc[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;

// ---------- Firestore REST helpers ----------

function extractString(field: any): string {
  return field?.stringValue ?? "";
}

function extractNumber(field: any): number {
  return Number(field?.integerValue ?? field?.doubleValue ?? 0);
}

function extractStringArray(field: any): string[] {
  const arr = field?.arrayValue?.values;
  if (!Array.isArray(arr)) return [];
  return arr.map((v: any) => v.stringValue ?? "").filter(Boolean);
}

function parseDoc(fields: Record<string, any>): MovieDoc {
  return {
    movieTitle: extractString(fields.movieTitle),
    tagline: extractString(fields.tagline),
    posterPath: extractString(fields.posterPath),
    genres: extractStringArray(fields.genres),
    totalQuestions: extractNumber(fields.totalQuestions),
    tmdbId: extractNumber(fields.tmdbId),
    releaseYear: extractNumber(fields.releaseYear),
    certification: extractString(fields.certification),
  };
}

// ---------- Public API ----------

export function loadMovies(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = doLoad().catch((err) => {
    loadPromise = null; // allow retry on next request
    throw err;
  });
  return loadPromise;
}

async function doLoad(): Promise<void> {

  const allDocs: MovieDoc[] = [];
  let nextPageToken: string | undefined;

  // Firestore REST paginates at 300 docs by default
  do {
    const url = new URL(FIRESTORE_URL);
    url.searchParams.set("pageSize", "1000");
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Firestore REST error: ${res.status} ${await res.text()}`);
    }

    const body: any = await res.json();
    const documents: any[] = body.documents ?? [];

    for (const doc of documents) {
      if (doc.fields) {
        allDocs.push(parseDoc(doc.fields));
      }
    }

    nextPageToken = body.nextPageToken as string | undefined;
  } while (nextPageToken);

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
