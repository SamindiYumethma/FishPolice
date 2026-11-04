"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameEngine, type CaseResult } from "../game/GameEngine";
import { getLevel, LEVEL_COUNT } from "../game/levels";
import { beginCase, canPlay, failActiveCase, winCase } from "../game/player";
import { usePlayer } from "../state/PlayerProvider";
import { CaseRun } from "./CaseRun";
import { Briefing, CaseFailed, ChestUnlocked } from "./PhaseScreens";

type Phase = { name: "briefing" } | { name: "run"; engine: GameEngine } | { name: "result"; result: CaseResult; livesBefore: number };

/** One case from start to finish: briefing → run → result. Writes the outcome to the player's save. */
export function PlayGame({ level }: { level: number }) {
  const router = useRouter();
  const { save, apply, abandonActiveCase } = usePlayer();
  const config = getLevel(level);
  const [phase, setPhase] = useState<Phase>({ name: "briefing" });
  const livesBefore = useRef(save.lives);

  // A typed-in URL for a locked case, or no lives left, can't start a case.
  const allowed = canPlay(save, level);
  const atBriefing = phase.name === "briefing";
  useEffect(() => {
    if (atBriefing && !allowed) router.replace(save.lives > 0 ? "/cases" : "/game-over");
  }, [atBriefing, allowed, save.lives, router]);

  // Leaving mid-case (the browser's back button, for example) costs the same life as quitting.
  useEffect(() => abandonActiveCase, [abandonActiveCase]);

  const start = () => {
    livesBefore.current = save.lives;
    apply((current) => beginCase(current, level));
    setPhase({ name: "run", engine: new GameEngine(config) });
  };

  const onFinished = useCallback(
    (result: CaseResult) => {
      apply((current) => (result.outcome === "won" ? winCase(current, level, result.score, result.stars) : failActiveCase(current)));
      setPhase({ name: "result", result, livesBefore: livesBefore.current });
    },
    [apply, level],
  );

  const toMap = () => router.replace("/cases");

  if (phase.name === "briefing") {
    return allowed ? <Briefing level={config} lives={save.lives} bestStars={save.stars[level] ?? 0} onStart={start} onClose={toMap} /> : null;
  }

  if (phase.name === "run") {
    return (
      <CaseRun
        engine={phase.engine}
        lives={save.lives}
        onFinished={onFinished}
        onRestart={() => {
          apply(failActiveCase);
          setPhase({ name: "briefing" });
        }}
        onQuit={() => {
          apply(failActiveCase);
          toMap();
        }}
      />
    );
  }

  const { result } = phase;
  if (result.outcome === "won") {
    const last = level >= LEVEL_COUNT;
    return <ChestUnlocked level={config} result={result} save={save} onContinue={last ? toMap : () => router.replace(`/play/${level + 1}`)} onMap={toMap} last={last} />;
  }
  return (
    <CaseFailed
      result={result}
      lives={save.lives}
      livesBefore={phase.livesBefore}
      onRetry={() => setPhase({ name: "briefing" })}
      onMap={toMap}
      onGameOver={() => router.replace("/game-over")}
    />
  );
}
