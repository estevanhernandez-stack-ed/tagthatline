import { useState } from "react";
import type { Poster } from "../lib/types";

type CardState = "default" | "incorrect" | "correct";

interface PosterCardProps {
  poster: Poster;
  state: CardState;
  onTap: (movieId: string) => void;
  disabled: boolean;
}

function PosterCard({ poster, state, onTap, disabled }: PosterCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const handleClick = () => {
    if (disabled || state !== "default") return;
    onTap(poster.movieId);
  };

  return (
    <button
      className={`poster-card poster-card--${state}`}
      onClick={handleClick}
      disabled={disabled || state !== "default"}
      aria-label={`Select ${poster.title}`}
    >
      <div className="poster-card__inner">
        {!imgFailed ? (
          <img
            className="poster-card__img"
            src={poster.posterUrl}
            alt={poster.title}
            onError={() => setImgFailed(true)}
            draggable={false}
          />
        ) : (
          <div className="poster-card__fallback">
            <span>{poster.title}</span>
          </div>
        )}

        {state === "incorrect" && (
          <div className="poster-card__overlay poster-card__overlay--incorrect">
            <span className="poster-card__x">&#x2715;</span>
          </div>
        )}

        {state === "correct" && (
          <div className="poster-card__overlay poster-card__overlay--correct" />
        )}
      </div>
    </button>
  );
}

export default PosterCard;
