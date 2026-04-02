import { useState } from "react";
import StartScreen from "./components/StartScreen";
import Countdown from "./components/Countdown";
import GameScreen from "./components/GameScreen";
import type { GameEndData } from "./lib/types";

type GameView = "start" | "countdown" | "playing" | "results";

function App() {
  const [view, setView] = useState<GameView>("start");
  const [gameEndData, setGameEndData] = useState<GameEndData | null>(null);

  return (
    <div className="app">
      {view === "start" && (
        <StartScreen onPlay={() => setView("countdown")} />
      )}

      {view === "countdown" && (
        <Countdown onComplete={() => setView("playing")} />
      )}

      {view === "playing" && (
        <GameScreen
          onGameEnd={(data) => {
            setGameEndData(data);
            setView("results");
          }}
        />
      )}

      {view === "results" && gameEndData && (
        <div className="placeholder-view">
          <h2>Results</h2>
          <p>
            Final Score: {gameEndData.score} / {gameEndData.maxScore}
          </p>
          <p>Best Streak: {gameEndData.bestStreak}</p>
          <p>
            Time: {Math.floor(gameEndData.elapsedSeconds / 60)}:
            {String(gameEndData.elapsedSeconds % 60).padStart(2, "0")}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
