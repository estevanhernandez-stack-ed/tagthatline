import { calculateFinalScore, getRatingTier } from "../lib/scoring";
import type { GameEndData } from "../lib/types";

interface EndScreenProps {
  gameEndData: GameEndData;
  onPlayAgain: () => void;
}

function EndScreen({ gameEndData, onPlayAgain }: EndScreenProps) {
  const { rawScore, bestStreak, elapsedSeconds } = gameEndData;
  const { timeModifier, timeBonus, finalScore } = calculateFinalScore(
    rawScore,
    bestStreak,
    elapsedSeconds
  );
  const rating = getRatingTier(finalScore);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="end-screen">
      <div className="end-screen__content">
        {/* Rating title — the hero */}
        <div className="end-screen__rating" data-tier={rating.tier}>
          <span className="end-screen__rating-label">Your Rating</span>
          <h1 className="end-screen__rating-title">{rating.title}</h1>
        </div>

        {/* Final score — the big number */}
        <div className="end-screen__final-score">
          <span className="end-screen__final-score-number">{finalScore}</span>
          <span className="end-screen__final-score-label">Final Score</span>
        </div>

        {/* Score breakdown receipt */}
        <div className="end-screen__receipt">
          <div className="end-screen__receipt-row">
            <span>Raw Score</span>
            <span>{rawScore} pts</span>
          </div>
          <div className="end-screen__receipt-row">
            <span>Best Streak</span>
            <span>{bestStreak} rounds</span>
          </div>
          <div className="end-screen__receipt-row">
            <span>Time</span>
            <span>{timeDisplay}</span>
          </div>
          <div className="end-screen__receipt-divider" />
          <div className="end-screen__receipt-row">
            <span>Time Modifier</span>
            <span>&times;{timeModifier.toFixed(1)}</span>
          </div>
          <div className="end-screen__receipt-row">
            <span>90-Second Bonus</span>
            <span>{timeBonus > 0 ? `+${timeBonus}` : "\u2014"}</span>
          </div>
          <div className="end-screen__receipt-divider" />
          <div className="end-screen__receipt-row end-screen__receipt-row--total">
            <span>Total</span>
            <span>{finalScore} pts</span>
          </div>
        </div>

        {/* Play Again */}
        <button className="btn-play end-screen__play-again" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export default EndScreen;
