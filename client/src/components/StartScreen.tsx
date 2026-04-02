interface StartScreenProps {
  onPlay: () => void;
}

function StartScreen({ onPlay }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-screen__content">
        <h1 className="start-screen__title">
          Tag that <span className="gold">Line</span>
        </h1>
        <p className="start-screen__subtitle">The Movie Tagline Trivia Game</p>
        <button className="btn-play" onClick={onPlay}>
          Play
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
