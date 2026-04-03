import express from "express";
import cors from "cors";
import * as functions from "firebase-functions";
import { loadMovies } from "./services/dataLoader";
import sessionRouter from "./routes/session";

const app = express();

app.use(cors());
app.use(express.json());

// ---------- Data loader middleware ----------
// Ensures movie data is loaded before any request is served.

app.use(async (_req, res, next) => {
  try {
    await loadMovies();
    next();
  } catch (err) {
    console.error("[dataLoader] Failed to load movies:", err);
    res.status(503).json({ error: "Service starting up, please retry in a few seconds" });
  }
});

// ---------- Routes ----------
// Mounted at /api/* for local dev and at root for Cloud Functions
// (Hosting rewrites /api/** → function "api")

const apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
apiRouter.use("/session", sessionRouter);

app.use("/api", apiRouter);
app.use("/", apiRouter);

// ---------- Cloud Functions export ----------

export const api = functions.https.onRequest(app);

// ---------- Local dev server ----------

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT ?? 3001;
  loadMovies().then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Listening on http://localhost:${PORT}`);
    });
  });
}
