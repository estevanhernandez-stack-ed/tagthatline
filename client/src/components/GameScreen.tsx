import { useEffect, useState, useCallback } from "react";
import PosterCard from "./PosterCard";
import type {
  SessionResponse,
  GameEndData,
  RoundResult,
} from "../lib/types";

interface GameScreenProps {
  onGameEnd: (data: GameEndData) => void;
}

type CardStateMap = Record<string, "default" | "incorrect" | "correct">;

function pointsForWrongCount(wrongTaps: number): number {
  if (wrongTaps === 0) return 5;
  if (wrongTaps === 1) return 3;
  if (wrongTaps === 2) return 2;
  return 0;
}

function GameScreen({ onGameEnd }: GameScreenProps) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [cardStates, setCardStates] = useState<CardStateMap>({});
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data: SessionResponse = await res.json();
        if (!cancelled) {
          setSession(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load game");
          setLoading(false);
        }
      }
    }
    fetchSession();
    return () => { cancelled = true; };
  }, []);

  const round = session?.rounds[currentRound] ?? null;

  const handleTap = useCallback(
    (movieId: string) => {
      if (!round || roundComplete) return;

      if (movieId === round.correctMovieId) {
        const pts = pointsForWrongCount(wrongTaps);
        setScore((s) => s + pts);
        setCardStates((prev) => ({ ...prev, [movieId]: "correct" }));
        setRoundComplete(true);

        const correctPoster = round.posters.find(
          (p) => p.movieId === round.correctMovieId
        );
        setRoundResults((prev) => [
          ...prev,
          {
            tagline: round.tagline,
            correctTitle: correctPoster?.title ?? "Unknown",
            wrongTaps,
            pointsEarned: pts,
          },
        ]);
      } else {
        const newWrongTaps = wrongTaps + 1;
        setWrongTaps(newWrongTaps);
        setCardStates((prev) => ({ ...prev, [movieId]: "incorrect" }));

        // If all 3 wrong posters have been tapped, auto-reveal correct
        if (newWrongTaps >= 3) {
          setCardStates((prev) => ({
            ...prev,
            [movieId]: "incorrect",
            [round.correctMovieId]: "correct",
          }));
          setRoundComplete(true);

          const correctPoster = round.posters.find(
            (p) => p.movieId === round.correctMovieId
          );
          setRoundResults((prev) => [
            ...prev,
            {
              tagline: round.tagline,
              correctTitle: correctPoster?.title ?? "Unknown",
              wrongTaps: newWrongTaps,
              pointsEarned: 0,
            },
          ]);
        }
      }
    },
    [round, roundComplete, wrongTaps]
  );

  const handleNext = useCallback(() => {
    if (!session) return;

    const nextRound = currentRound + 1;
    if (nextRound >= session.rounds.length) {
      onGameEnd({
        score,
        maxScore: session.rounds.length * 5,
        rounds: roundResults,
      });
      return;
    }

    setCurrentRound(nextRound);
    setWrongTaps(0);
    setCardStates({});
    setRoundComplete(false);
  }, [session, currentRound, score, roundResults, onGameEnd]);

  /* ── Loading state ──────────────────────────────── */
  if (loading) {
    return (
      <div className="game-screen game-screen--loading">
        <div className="game-screen__loader">
          <div className="game-screen__spinner" />
          <p>Loading rounds...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !round) {
    return (
      <div className="game-screen game-screen--loading">
        <p>{error ?? "Something went wrong"}</p>
      </div>
    );
  }

  const totalRounds = session.rounds.length;

  return (
    <div className="game-screen">
      {/* ── Header bar ─────────────────────────────── */}
      <div className="game-screen__header">
        <span className="game-screen__round-indicator">
          Round {currentRound + 1} of {totalRounds}
        </span>
        <span className="game-screen__score">Score: {score}</span>
      </div>

      {/* ── Tagline ────────────────────────────────── */}
      <blockquote className="game-screen__tagline">
        &ldquo;{round.tagline}&rdquo;
      </blockquote>

      {/* ── Poster grid ────────────────────────────── */}
      <div className="game-screen__grid">
        {round.posters.map((poster) => (
          <PosterCard
            key={poster.movieId}
            poster={poster}
            state={cardStates[poster.movieId] ?? "default"}
            onTap={handleTap}
            disabled={roundComplete && cardStates[poster.movieId] !== "default"}
          />
        ))}
      </div>

      {/* ── Next button ────────────────────────────── */}
      {roundComplete && (
        <button className="btn-play game-screen__next" onClick={handleNext}>
          {currentRound + 1 >= totalRounds ? "See Results" : "Next"}
        </button>
      )}
    </div>
  );
}

export default GameScreen;
