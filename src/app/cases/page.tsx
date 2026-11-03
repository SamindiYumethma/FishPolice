"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { BOSS_EVERY, caseLabel, DEMO_PLAYER, LEVEL_COUNT } from "../../lib/mock";
import { Screen } from "../../components/Screen";
import { Hearts, IconButton, Pill, Ribbon, Sprite } from "../../components/ui";
import s from "./cases.module.css";

const STEP = 23; // cqw between nodes
const BOTTOM_PAD = 22;
const TOP_PAD = 30;

function nodeX(i: number) {
  return 50 + 26 * Math.sin(i * 1.05 + 0.3);
}

export default function CasesPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const current = DEMO_PLAYER.highestUnlocked;
  const mapHeight = BOTTOM_PAD + TOP_PAD + (LEVEL_COUNT - 1) * STEP;

  const nodes = useMemo(
    () => Array.from({ length: LEVEL_COUNT }, (_, i) => ({ level: i + 1, x: nodeX(i), y: mapHeight - BOTTOM_PAD - i * STEP })),
    [mapHeight],
  );

  // Scroll so the current case sits a little below the middle of the screen.
  useEffect(() => {
    const el = scrollRef.current;
    const node = el?.querySelector<HTMLElement>(`[data-level="${current}"]`);
    if (el && node) el.scrollTop = node.offsetTop - el.clientHeight * 0.6;
  }, [current]);

  const pathD = nodes.map((n, i) => `${i ? "L" : "M"}${n.x} ${n.y}`).join(" ");

  return (
    <Screen bg="bg_level_map" className={s.screen}>
      <div className={`top-bar ${s.header}`}>
        <IconButton icon="icon_btn_back" label="Back to menu" size={12} onClick={() => router.replace("/menu")} />
        <Ribbon width={50}>Cases</Ribbon>
        <Hearts lives={DEMO_PLAYER.lives} size={7} />
      </div>
      <div className={s.runInfo}>
        <Pill icon="xp_star" className="cream">Run score {DEMO_PLAYER.runScore.toLocaleString()}</Pill>
      </div>

      <div ref={scrollRef} className={`${s.scroll} screen-scroll`}>
        <div className={s.map} style={{ height: `${mapHeight}cqw` }}>
          <svg className={s.trail} viewBox={`0 0 100 ${mapHeight}`} preserveAspectRatio="none" aria-hidden>
            <path d={pathD} className={s.trailBase} />
            <path d={pathD} className={s.trailDash} />
          </svg>
          {nodes.map(({ level, x, y }) => {
            const stars = DEMO_PLAYER.stars[level] ?? 0;
            const state = level < current ? "done" : level === current ? "current" : "locked";
            const boss = level % BOSS_EVERY === 0;
            return (
              <button
                key={level}
                type="button"
                data-level={level}
                className={`${s.node} ${s[state]}`}
                style={{ left: `${x}cqw`, top: `${y}cqw` }}
                aria-label={`${caseLabel(level)}${state === "locked" ? " (locked)" : stars ? `, ${stars} stars` : ""}`}
                // Locked cases do nothing in the UI demo.
                onClick={() => state !== "locked" && router.push(`/play/${level}`)}
              >
                <Sprite name={state === "done" ? "node_done" : state === "current" ? "node_current" : "node_locked"} className={s.nodeImg} />
                {state === "current" && <span className={s.nodeNum}>{level}</span>}
                {state !== "current" && <span className={s.nodeTag}>{level}</span>}
                {state === "done" && (
                  <span className={s.stars}>
                    {[1, 2, 3].map((n) => (
                      <Sprite key={n} name="xp_star" className={n <= stars ? "" : s.starOff} />
                    ))}
                  </span>
                )}
                {boss && <Sprite name="shark_boss" className={s.boss} />}
              </button>
            );
          })}
          <div className={s.chestEnd} style={{ top: `${TOP_PAD * 0.25}cqw` }}>
            <Sprite name="chest_locked" width={18} />
          </div>
        </div>
      </div>
    </Screen>
  );
}
