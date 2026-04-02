import { Router } from "express";
import { buildSession } from "../services/sessionBuilder";

const router = Router();

router.get("/", (_req, res) => {
  try {
    const session = buildSession();
    res.json(session);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[session] Error building session:", message);
    res.status(500).json({ error: message });
  }
});

export default router;
