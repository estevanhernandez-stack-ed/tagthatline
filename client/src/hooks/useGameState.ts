import { useCallback, useState } from "react";
import { pointsForRound } from "../lib/scoring";
import type { SessionResponse, RoundResult } from "../lib/types";

interface GameState {
  session: SessionResponse | null;
  currentRound: number;
  score: number;
  wrongTapsThisRound: number;
  currentStreak: number;
  bestStreak: number;
  roundComplete: boolean;
  roundResults: RoundResult[];
}

const initialState: GameState = {
  session: null,
  currentRound: 0,
  score: 0,
  wrongTapsThisRound: 0,
  currentStreak: 0,
  bestStreak: 0,
  roundComplete: false,
  roundResults: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const startSession = useCallback((data: SessionResponse) => {
    setState({ ...initialState, session: data });
  }, []);

  const tapPoster = useCallback(
    (_movieId: string, isCorrect: boolean) => {
      setState((prev) => {
        if (!prev.session || prev.roundComplete) return prev;

        const round = prev.session.rounds[prev.currentRound];
        if (!round) return prev;

        if (isCorrect) {
          const wrongTaps = prev.wrongTapsThisRound;
          // Streak: increment only on first-tap correct
          const newStreak = wrongTaps === 0 ? prev.currentStreak + 1 : prev.currentStreak;
          const pts = pointsForRound(wrongTaps, newStreak);
          const newBestStreak = Math.max(prev.bestStreak, newStreak);

          const correctPoster = round.posters.find(
            (p) => p.movieId === round.correctMovieId
          );

          return {
            ...prev,
            score: prev.score + pts,
            currentStreak: wrongTaps === 0 ? newStreak : prev.currentStreak,
            bestStreak: newBestStreak,
            roundComplete: true,
            roundResults: [
              ...prev.roundResults,
              {
                tagline: round.tagline,
                correctTitle: correctPoster?.title ?? "Unknown",
                wrongTaps,
                pointsEarned: pts,
              },
            ],
          };
        }

        // Wrong tap
        const newWrongTaps = prev.wrongTapsThisRound + 1;
        const newStreak = 0; // any wrong tap resets streak

        if (newWrongTaps >= 3) {
          // All wrong — auto-reveal
          const correctPoster = round.posters.find(
            (p) => p.movieId === round.correctMovieId
          );
          return {
            ...prev,
            wrongTapsThisRound: newWrongTaps,
            currentStreak: newStreak,
            roundComplete: true,
            roundResults: [
              ...prev.roundResults,
              {
                tagline: round.tagline,
                correctTitle: correctPoster?.title ?? "Unknown",
                wrongTaps: newWrongTaps,
                pointsEarned: 0,
              },
            ],
          };
        }

        return {
          ...prev,
          wrongTapsThisRound: newWrongTaps,
          currentStreak: newStreak,
        };
      });
    },
    []
  );

  const advanceRound = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;
      return {
        ...prev,
        currentRound: prev.currentRound + 1,
        wrongTapsThisRound: 0,
        roundComplete: false,
      };
    });
  }, []);

  const isSessionComplete =
    state.session !== null &&
    state.currentRound >= state.session.rounds.length - 1 &&
    state.roundComplete;

  return {
    session: state.session,
    currentRound: state.currentRound,
    score: state.score,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    wrongTapsThisRound: state.wrongTapsThisRound,
    isRoundComplete: state.roundComplete,
    isSessionComplete,
    roundResults: state.roundResults,
    startSession,
    tapPoster,
    advanceRound,
  };
}
