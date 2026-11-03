"use client";

import { CHARACTERS, DEMO_PLAYER, type Kind } from "../lib/mock";
import { Hearts, IconButton, Pill, Sprite } from "../components/ui";
import s from "./play.module.css";

/** A frozen snapshot of the board: which hole shows which character. */
const SNAPSHOT: Partial<Record<number, Kind>> = { 1: "crab", 3: "civilian", 5: "octopus", 7: "bomb", 9: "crab" };

/** Static gameplay screen: the HUD and board layout with no game engine behind it. */
export function GameplayMock({ target, rows, onPause }: { target: number; rows: number; onPause: () => void }) {
  const cols = 3;
  const score = Math.round(target * 0.55);
  return (
    <div className={s.play}>
      <div className={s.hud}>
        <div className={s.hudRow}>
          <Hearts lives={DEMO_PLAYER.lives} size={7.5} />
          <Pill icon="icon_stopwatch">0:18</Pill>
          <Pill icon="coin">{score}</Pill>
        </div>
        <div className={s.progressWrap} aria-label={`Score ${score} of ${target}`}>
          <div className={s.progressTrack}>
            <div className={s.progressFill} style={{ width: `${(score / target) * 100}%` }} />
            <span className={s.progressText}>
              {score} / {target}
            </span>
          </div>
          <Sprite name="chest_locked" className={s.progressChest} />
        </div>
      </div>

      <div className={`board ${s.board}`}>
        {Array.from({ length: rows * cols }, (_, slot) => {
          const r = Math.floor(slot / cols);
          const c = slot % cols;
          const kind = SNAPSHOT[slot];
          return (
            <div
              key={slot}
              className={s.hole}
              style={{ left: `${((c + 0.5) / cols) * 100}%`, top: `${((r + 0.5) / rows) * 100}%`, width: `${rows > 3 ? 27 : 29}cqw` }}
            >
              <Sprite name="coral_hole" className={s.holeImg} />
              <div className={s.window}>
                {kind && (
                  <button type="button" className={`${s.critter} ${s.st_active}`} aria-label={CHARACTERS[kind].name}>
                    <Sprite name={CHARACTERS[kind].asset} className={s.critterImg} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={s.bottomBar}>
        <IconButton icon="icon_btn_pause" label="Pause" size={13} onClick={onPause} />
        <div className={s.bottomRight}>
          <div className={s.combo}>
            <Sprite name="fx_combo" />
            <span>×2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
