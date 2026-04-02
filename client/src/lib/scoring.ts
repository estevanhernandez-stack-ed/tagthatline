export function pointsForRound(
  wrongTaps: number,
  currentStreak: number
): number {
  if (wrongTaps === 0) {
    // First-tap correct: base 5, multiplied by streak count
    return 5 * Math.max(currentStreak, 1);
  }
  if (wrongTaps === 1) return 3;
  if (wrongTaps === 2) return 2;
  return 0;
}

function getTimeModifier(seconds: number): number {
  if (seconds < 60) return 1.5;
  if (seconds < 90) return 1.3;
  if (seconds < 120) return 1.1;
  if (seconds < 180) return 1.0;
  return 0.9;
}

export interface FinalScoreResult {
  rawScore: number;
  timeModifier: number;
  timeBonus: number;
  finalScore: number;
}

export function calculateFinalScore(
  rawScore: number,
  _bestStreak: number,
  elapsedSeconds: number
): FinalScoreResult {
  const timeModifier = getTimeModifier(elapsedSeconds);
  const timeBonus = elapsedSeconds < 90 ? 25 : 0;
  const finalScore = Math.round(rawScore * timeModifier + timeBonus);

  return { rawScore, timeModifier, timeBonus, finalScore };
}

export interface RatingTier {
  title: string;
  tier: number;
}

export function getRatingTier(finalScore: number): RatingTier {
  if (finalScore >= 201) return { title: "Award Season Legend", tier: 7 };
  if (finalScore >= 151) return { title: "Blockbuster Hit", tier: 6 };
  if (finalScore >= 101) return { title: "Critical Darling", tier: 5 };
  if (finalScore >= 76) return { title: "Crowd Pleaser", tier: 4 };
  if (finalScore >= 51) return { title: "Cult Classic", tier: 3 };
  if (finalScore >= 26) return { title: "Box Office Bomb", tier: 2 };
  return { title: "Straight to DVD", tier: 1 };
}
