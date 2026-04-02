import express from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import { loadMovies } from "./services/dataLoader";
import sessionRouter from "./routes/session";

const app = express();

app.use(cors());
app.use(express.json());

// ---------- Routes ----------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/session", sessionRouter);

// ---------- Data loader (runs once) ----------

const dataReady = loadMovies().catch((err) => {
  console.error("[startup] Failed to load movie data:", err);
  process.exit(1);
});

// ---------- Cloud Functions export ----------

export const api = onRequest(app);

// ---------- Local dev server ----------

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT ?? 3001;
  dataReady.then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Listening on http://localhost:${PORT}`);
    });
  });
}
