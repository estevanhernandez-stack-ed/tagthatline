import { useEffect, useState, useCallback } from "react";
import PosterCard from "./PosterCard";
import { useTimer } from "../hooks/useTimer";
import { useGameState } from "../hooks/useGameState";
import type { SessionResponse, GameEndData } from "../lib/types";

interface GameScreenProps {
  onGameEnd: (data: GameEndData) => void;
}

type CardStateMap = Record<string, "default" | "incorrect" | "correct">;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function GameScreen({ onGameEnd }: GameScreenProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardStates, setCardStates] = useState<CardStateMap>({});

  const { elapsedSeconds, start: startTimer, stop: stopTimer } = useTimer();
  const {
    session,
    currentRound,
    score,
    currentStreak,
    bestStreak,
    wrongTapsThisRound,
    isRoundComplete,
    isSessionComplete,
    roundResults,
    startSession,
    tapPoster,
    advanceRound,
  } = useGameState();

  useEffect(() => {
    let cancelled = false;
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data: SessionResponse = await res.json();
        if (!cancelled) {
          startSession(data);
          setLoading(false);
          startTimer();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load game");
          setLoading(false);
        }
      }
    }
    fetchSession();
    return () => {
      cancelled = true;
    };
  }, [startSession, startTimer]);

  // Stop timer when session completes
  useEffect(() => {
    if (isSessionComplete) {
      stopTimer();
    }
  }, [isSessionComplete, stopTimer]);

  const round = session?.rounds[currentRound] ?? null;

  const handleTap = useCallback(
    (movieId: string) => {
      if (!round || isRoundComplete) return;

      const isCorrect = movieId === round.correctMovieId;
      tapPoster(movieId, isCorrect);

      if (isCorrect) {
        setCardStates((prev) => ({ ...prev, [movieId]: "correct" }));
      } else {
        setCardStates((prev) => ({ ...prev, [movieId]: "incorrect" }));

        // If this was the 3rd wrong tap, auto-reveal correct
        if (wrongTapsThisRound + 1 >= 3) {
          setCardStates((prev) => ({
            ...prev,
            [movieId]: "incorrect",
            [round.correctMovieId]: "correct",
          }));
        }
      }
    },
    [round, isRoundComplete, wrongTapsThisRound, tapPoster]
  );

  const handleNext = useCallback(() => {
    if (!session) return;

    const nextRound = currentRound + 1;
    if (nextRound >= session.rounds.length) {
      onGameEnd({
        score,
        maxScore: session.rounds.length * 5,
        rawScore: score,
        bestStreak,
        elapsedSeconds,
        rounds: roundResults,
      });
      return;
    }

    advanceRound();
    setCardStates({});
  }, [
    session,
    currentRound,
    score,
    bestStreak,
    elapsedSeconds,
    roundResults,
    onGameEnd,
    advanceRound,
  ]);

  /* -- Loading state -- */
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
      {/* -- Header bar -- */}
      <div className="game-screen__header">
        <span className="game-screen__round-indicator">
          Round {currentRound + 1} of {totalRounds}
        </span>
        <span className="game-screen__timer">{formatTime(elapsedSeconds)}</span>
        <span className="game-screen__score">Score: {score}</span>
      </div>

      {/* -- Tagline + optional streak -- */}
      <blockquote className="game-screen__tagline">
        &ldquo;{round.tagline}&rdquo;
        {currentStreak > 0 && (
          <span className="game-screen__streak">
            <span className="game-screen__streak-fire">&#x1F525;</span>{" "}
            {currentStreak}
          </span>
        )}
      </blockquote>

      {/* -- Poster grid -- */}
      <div className="game-screen__grid">
        {round.posters.map((poster) => (
          <PosterCard
            key={poster.movieId}
            poster={poster}
            state={cardStates[poster.movieId] ?? "default"}
            onTap={handleTap}
            disabled={isRoundComplete && cardStates[poster.movieId] !== "default"}
          />
        ))}
      </div>

      {/* -- Next button -- */}
      {isRoundComplete && (
        <button className="btn-play game-screen__next" onClick={handleNext}>
          {currentRound + 1 >= totalRounds ? "See Results" : "Next"}
        </button>
      )}
    </div>
  );
}

export default GameScreen;
