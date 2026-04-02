import { useState } from "react";
import StartScreen from "./components/StartScreen";
import Countdown from "./components/Countdown";
import GameScreen from "./components/GameScreen";
import EndScreen from "./components/EndScreen";
import type { GameEndData } from "./lib/types";

type GameView = "start" | "countdown" | "playing" | "results";

function App() {
  const [view, setView] = useState<GameView>("start");
  const [gameEndData, setGameEndData] = useState<GameEndData | null>(null);

  const handlePlayAgain = () => {
    setGameEndData(null);
    setView("start");
  };

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
        <EndScreen gameEndData={gameEndData} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}

export default App;
