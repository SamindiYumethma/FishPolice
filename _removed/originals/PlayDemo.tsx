"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { demoCase, LEVEL_COUNT } from "../lib/mock";
import { GameplayMock } from "./GameplayMock";
import { RebirthMock } from "./RebirthMock";
import { Briefing, CaseFailed, ChestUnlocked, LifeRecovered, PauseMenu, RebirthFailed } from "./PhaseScreens";
import s from "./play.module.css";

type Phase = "briefing" | "countdown" | "playing" | "paused" | "chest" | "failed" | "rebirth" | "rebirth-failed" | "recovered";

const COUNTDOWN = ["3", "2", "1", "GO!"];

/** Switches between the in-game screens. No game logic — every button just moves to another screen. */
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
  const toMap = () => router.replace("/cases");
  const showBoard = phase === "countdown" || phase === "playing" || phase === "paused";

  return (
    <>
      {showBoard && <GameplayMock target={cfg.target} rows={cfg.level <= 5 ? 3 : 4} onPause={() => setPhase("paused")} />}

      {phase === "briefing" && <Briefing cfg={cfg} onStart={start} onClose={toMap} />}

      {phase === "countdown" && (
        <div className={`${s.overlay} ${s.dim}`}>
          <span key={count} className={`title-text ${s.countdown} ${count === COUNTDOWN.length - 1 ? s.countdownGo : ""}`}>
            {COUNTDOWN[count]}
          </span>
        </div>
      )}

      {phase === "playing" && (
        <div style={demoBar}>
          <span style={{ opacity: 0.8 }}>Demo:</span>
          <button type="button" style={demoBtn} onClick={() => setPhase("chest")}>
            Show win
          </button>
          <button type="button" style={demoBtn} onClick={() => setPhase("failed")}>
            Show fail
          </button>
        </div>
      )}

      {phase === "paused" && <PauseMenu onResume={() => setPhase("playing")} onRestart={start} onQuit={toMap} />}

      {phase === "chest" && (
        <ChestUnlocked level={cfg.level} onContinue={() => router.replace(cfg.level < LEVEL_COUNT ? `/play/${cfg.level + 1}` : "/cases")} onMap={toMap} />
      )}

      {phase === "failed" && <CaseFailed target={cfg.target} onEarnBack={() => setPhase("rebirth")} onRetry={() => setPhase("briefing")} onMap={toMap} />}

      {phase === "rebirth" && (
        <>
          <RebirthMock onSubmit={() => setPhase("recovered")} />
          <div style={{ ...demoBar, bottom: "3cqw" }}>
            <span style={{ opacity: 0.8 }}>Demo:</span>
            <button type="button" style={demoBtn} onClick={() => setPhase("rebirth-failed")}>
              Show wrong answer
            </button>
          </div>
        </>
      )}

      {phase === "recovered" && <LifeRecovered onContinue={() => setPhase("briefing")} />}

      {phase === "rebirth-failed" && <RebirthFailed onTryAgain={() => setPhase("rebirth")} onGiveUp={() => router.replace("/game-over")} />}
    </>
  );
}

const demoBar: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "18cqw",
  transform: "translateX(-50%)",
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  gap: "2cqw",
  padding: "1.5cqw 3cqw",
  borderRadius: "999px",
  background: "rgba(6, 26, 69, 0.8)",
  color: "#fff",
  font: "800 3.2cqw var(--font-body)",
  whiteSpace: "nowrap",
};

const demoBtn: CSSProperties = {
  border: 0,
  borderRadius: "999px",
  padding: "1.2cqw 3cqw",
  background: "var(--gold)",
  color: "var(--navy-deep)",
  font: "inherit",
  cursor: "pointer",
};
