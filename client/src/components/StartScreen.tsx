interface StartScreenProps {
  onPlay: () => void;
  onDemo: () => void;
}

function StartScreen({ onPlay, onDemo }: StartScreenProps) {
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
      <footer className="start-screen__footer" onClick={onDemo}>
        Developed at 626 Labs
      </footer>
    </div>
  );
}

export default StartScreen;
