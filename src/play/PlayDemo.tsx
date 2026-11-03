"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { demoCase } from "../lib/mock";
import { GameplayMock } from "./GameplayMock";
import { Briefing } from "./PhaseScreens";
import s from "./play.module.css";

type Phase = "briefing" | "countdown" | "playing";

const COUNTDOWN = ["3", "2", "1", "GO!"];

/** Briefing, then the 3-2-1-GO countdown, then the board. The demo stops at the board. */
export function PlayDemo({ level }: { level: number }) {
  const router = useRouter();
  const cfg = demoCase(level);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [count, setCount] = useState(0);

  // Plays the 3-2-1-GO animation, then shows the board.
  useEffect(() => {
    if (phase !== "countdown") return;
    const timers = COUNTDOWN.map((_, i) => setTimeout(() => (i < COUNTDOWN.length - 1 ? setCount(i + 1) : setPhase("playing")), (i + 1) * 700));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const start = () => {
    setCount(0);
    setPhase("countdown");
  };

  return (
    <>
      {phase !== "briefing" && <GameplayMock target={cfg.target} />}

      {phase === "briefing" && <Briefing cfg={cfg} onStart={start} onClose={() => router.replace("/cases")} />}

      {phase === "countdown" && (
        <div className={`${s.overlay} ${s.dim}`}>
          <span key={count} className={`title-text ${s.countdown} ${count === COUNTDOWN.length - 1 ? s.countdownGo : ""}`}>
            {COUNTDOWN[count]}
          </span>
        </div>
      )}
    </>
  );
}
