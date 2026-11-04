"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pointsLabel } from "../game/characters";
import type { CaseResult, GameEngine } from "../game/GameEngine";
import { GameBoard, type ScoreFx } from "./GameBoard";
import { PauseMenu } from "./PhaseScreens";
import s from "./play.module.css";

const COUNTDOWN = ["3", "2", "1", "GO!"];
const COUNTDOWN_STEP_MS = 700;
/** The longest step the clock can take, so a stutter or a sleeping phone can't eat the player's time. */
const MAX_FRAME_MS = 100;
const SCORE_FX_MS = 900;
const SHAKE_MS = 420;

/** Connects one engine to the browser: the countdown, the frame loop, auto-pause and tap effects. */
export function CaseRun({
  engine,
  lives,
  onFinished,
  onRestart,
  onQuit,
}: {
  engine: GameEngine;
  lives: number;
  onFinished: (result: CaseResult) => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  const [count, setCount] = useState(0);
  const [fx, setFx] = useState<ScoreFx[]>([]);
  const [shaking, setShaking] = useState(false);
  const fxId = useRef(0);

  // 3-2-1-GO, then the engine starts (already paused if the phone went to sleep during it).
  useEffect(() => {
    const timers = COUNTDOWN.map((_, i) =>
      setTimeout(
        () => {
          if (i < COUNTDOWN.length - 1) return setCount(i + 1);
          engine.start();
          if (document.hidden) engine.pause();
        },
        (i + 1) * COUNTDOWN_STEP_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [engine]);

  // The frame loop: tells the engine how much time has passed.
  useEffect(() => {
    let last = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      engine.update(Math.min(now - last, MAX_FRAME_MS));
      last = now;
      raf = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  // A phone call, a locked screen or switching app pauses the case.
  useEffect(() => {
    const pause = () => engine.pause();
    const onVisibility = () => document.hidden && pause();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", pause);
    };
  }, [engine]);

  useEffect(() => engine.on("finished", onFinished), [engine, onFinished]);

  // Floating score text and the screen shake, driven by the engine's events.
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        fn();
      }, ms);
      timers.add(timer);
    };
    const unsubscribe = engine.on("scored", ({ critter, points }) => {
      const id = ++fxId.current;
      setFx((all) => [...all, { id, slot: critter.slot, text: pointsLabel(points), good: points > 0 }]);
      later(() => setFx((all) => all.filter((f) => f.id !== id)), SCORE_FX_MS);
      if (points < 0) {
        setShaking(true);
        later(() => setShaking(false), SHAKE_MS);
      }
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [engine]);

  return (
    <>
      <GameBoard
        level={engine.level}
        snapshot={snapshot}
        lives={lives}
        fx={fx}
        shaking={shaking}
        onTap={(id) => engine.tap(id)}
        onPause={() => engine.pause()}
      />

      {snapshot.status === "idle" && (
        <div className={`${s.overlay} ${s.dim}`}>
          <span key={count} className={`title-text ${s.countdown} ${count === COUNTDOWN.length - 1 ? s.countdownGo : ""}`}>
            {COUNTDOWN[count]}
          </span>
        </div>
      )}

      {snapshot.status === "paused" && <PauseMenu lives={lives} onResume={() => engine.resume()} onRestart={onRestart} onQuit={onQuit} />}
    </>
  );
}
