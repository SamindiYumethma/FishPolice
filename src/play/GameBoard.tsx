"use client";

import { CHARACTERS } from "../game/characters";
import type { Critter, EngineSnapshot } from "../game/GameEngine";
import type { LevelConfig } from "../game/levels";
import { Hearts, IconButton, Pill, Sprite } from "../components/ui";
import s from "./play.module.css";

/** Seconds left at which the timer turns red. */
const LOW_TIME_SEC = 5;

export interface ScoreFx {
  id: number;
  slot: number;
  text: string;
  good: boolean;
}

export function slotPosition(slot: number, level: LevelConfig) {
  return {
    left: `${((slot % level.cols) + 0.5) * (100 / level.cols)}%`,
    top: `${(Math.floor(slot / level.cols) + 0.5) * (100 / level.rows)}%`,
  };
}

const CRITTER_CLASS: Record<Critter["state"], string> = {
  active: s.st_active,
  leaving: s.st_leaving,
  arrested: s.st_arrested,
  mistake: `${s.st_tapped} ${s.tapped_innocent}`,
};

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Draws one moment of a case. It holds no rules: it shows a snapshot and reports taps. */
export function GameBoard({
  level,
  snapshot,
  lives,
  fx,
  shaking,
  onTap,
  onPause,
}: {
  level: LevelConfig;
  snapshot: EngineSnapshot;
  lives: number;
  fx: readonly ScoreFx[];
  shaking: boolean;
  onTap: (id: number) => void;
  onPause: () => void;
}) {
  const { score, secondsLeft, critters, status } = snapshot;
  const target = level.targetScore;
  const holeCount = level.rows * level.cols;

  return (
    <div className={`${s.play} ${shaking ? s.shake : ""} ${status === "paused" ? s.paused : ""}`}>
      <div className={s.hud}>
        <div className={s.hudRow}>
          <Hearts lives={lives} size={7.5} />
          <Pill icon="icon_stopwatch" className={status === "running" && secondsLeft <= LOW_TIME_SEC ? s.lowTime : ""}>
            {formatTime(secondsLeft)}
          </Pill>
          <Pill icon="coin">{score}</Pill>
        </div>
        <div className={s.progressWrap} aria-label={`Score ${score} of ${target}`}>
          <div className={s.progressTrack}>
            <div className={s.progressFill} style={{ width: `${Math.min(100, (score / target) * 100)}%` }} />
            <span className={s.progressText}>
              {score} / {target}
            </span>
          </div>
          <Sprite name="chest_locked" className={s.progressChest} />
        </div>
      </div>

      <div className={`board ${s.board}`}>
        {Array.from({ length: holeCount }, (_, slot) => {
          const critter = critters.find((c) => c.slot === slot);
          return (
            <div key={slot} className={s.hole} style={{ ...slotPosition(slot, level), width: `${level.rows > 3 ? 27 : 29}cqw` }}>
              <Sprite name="coral_hole" className={s.holeImg} />
              <div className={s.window}>
                {critter && (
                  <button
                    key={critter.id}
                    type="button"
                    className={`${s.critter} ${CRITTER_CLASS[critter.state]}`}
                    aria-label={CHARACTERS[critter.kind].name}
                    // Pointer-down reacts on touch, with no wait for the finger to lift. Click is
                    // for keyboards; the engine ignores it when pointer-down already counted.
                    onPointerDown={() => onTap(critter.id)}
                    onClick={() => onTap(critter.id)}
                  >
                    <Sprite name={critter.skin} className={s.critterImg} />
                    {critter.state === "arrested" && !CHARACTERS[critter.kind].arrestedSkin && <Sprite name="icon_handcuffs" className={s.cuffs} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {fx.map((f) => (
          <span key={f.id} className={`${s.fxScore} ${f.good ? s.good : s.bad}`} style={slotPosition(f.slot, level)}>
            {f.text}
          </span>
        ))}
      </div>

      <div className={s.bottomBar}>
        <IconButton icon="icon_btn_pause" label="Pause" size={13} onClick={onPause} disabled={status !== "running"} />
      </div>
    </div>
  );
}
