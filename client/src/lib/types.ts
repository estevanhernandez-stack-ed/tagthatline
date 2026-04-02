export interface Poster {
  movieId: string;
  title: string;
  posterUrl: string;
}

export interface Round {
  tagline: string;
  correctMovieId: string;
  posters: Poster[];
}

export interface SessionResponse {
  rounds: Round[];
}

export interface GameEndData {
  score: number;
  maxScore: number;
  rawScore: number;
  bestStreak: number;
  elapsedSeconds: number;
  rounds: RoundResult[];
}

export interface RoundResult {
  tagline: string;
  correctTitle: string;
  wrongTaps: number;
  pointsEarned: number;
}
