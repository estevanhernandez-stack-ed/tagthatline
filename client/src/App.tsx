import { useState } from "react";
import StartScreen from "./components/StartScreen";
import Countdown from "./components/Countdown";

type GameView = "start" | "countdown" | "playing" | "results";

function App() {
  const [view, setView] = useState<GameView>("start");

  return (
    <div className="app">
      {view === "start" && (
        <StartScreen onPlay={() => setView("countdown")} />
      )}

      {view === "countdown" && (
        <Countdown onComplete={() => setView("playing")} />
      )}

      {view === "playing" && (
        <div className="placeholder-view">
          <h2>Now Playing</h2>
          <p>Game view coming soon</p>
        </div>
      )}

      {view === "results" && (
        <div className="placeholder-view">
          <h2>Results</h2>
          <p>Results view coming soon</p>
        </div>
      )}
    </div>
  );
}

export default App;
