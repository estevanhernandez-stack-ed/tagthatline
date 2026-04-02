import { useEffect, useState } from "react";

interface CountdownProps {
  onComplete: () => void;
}

type CountdownStage = 3 | 2 | 1 | "clap" | "done";

function Countdown({ onComplete }: CountdownProps) {
  const [stage, setStage] = useState<CountdownStage>(3);

  useEffect(() => {
    const schedule: { delay: number; next: CountdownStage }[] = [
      { delay: 900, next: 2 },
      { delay: 900, next: 1 },
      { delay: 900, next: "clap" },
      { delay: 600, next: "done" },
    ];

    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (i >= schedule.length) return;
      timer = setTimeout(() => {
        const { next } = schedule[i];
        if (next === "done") {
          onComplete();
        } else {
          setStage(next);
        }
        i++;
        tick();
      }, schedule[i].delay);
    };

    tick();

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="countdown">
      {stage !== "clap" ? (
        <span key={stage} className="countdown__number">
          {stage}
        </span>
      ) : (
        <span key="clap" className="countdown__clap">
          🎬
        </span>
      )}
    </div>
  );
}

export default Countdown;
