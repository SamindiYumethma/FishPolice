"use client";

import { useState } from "react";
import { CHARACTERS, caseLabel, DEMO_PLAYER, type DemoCase } from "../lib/mock";
import { assetUrl, type AssetName } from "../lib/assets";
import { GameButton, Hearts, IconButton, Panel, Sprite } from "../components/ui";
import { HowToPlay } from "../components/HowToPlay";
import s from "./play.module.css";

const bg = (name: AssetName) => ({ backgroundImage: `url(${assetUrl(name)})` });

/* ── Briefing ────────────────────────────────────────────────────────────── */

export function Briefing({ cfg, onStart, onClose }: { cfg: DemoCase; onStart: () => void; onClose: () => void }) {
  const [howTo, setHowTo] = useState(false);
  const best = DEMO_PLAYER.stars[cfg.level] ?? 0;
  return (
    <div className={s.phase} style={bg("bg_gameplay_reef")}>
      <div className={s.phaseTop}>
        <Hearts lives={DEMO_PLAYER.lives} size={7.5} />
        <IconButton icon="icon_case_file" label="How to play" size={12} onClick={() => setHowTo(true)} />
      </div>
      <Panel title={caseLabel(cfg.level)} onClose={onClose} className="pop-in">
        <div className={s.scene}>
          <Sprite name={CHARACTERS[cfg.featured].asset} width={cfg.featured === "shark" ? 28 : 36} className="float" />
          <Sprite name="chest_closed" width={22} />
        </div>
        <div className={s.caseTitle}>{cfg.title}</div>
        <p className={s.caseTag}>{cfg.isBoss ? "Boss case! " : ""}{cfg.tagline}</p>
        <div className={s.chips}>
          <span className={s.chip}>
            <Sprite name="icon_target" /> {cfg.target} pts
          </span>
          <span className={s.chip}>
            <Sprite name="icon_stopwatch" /> {cfg.timeLimit} sec
          </span>
        </div>
        {cfg.newKinds.length > 0 && (
          <div className={s.newSuspects}>
            <span className={s.newLabel}>{cfg.level === 1 ? "Know your suspects" : "New on the reef!"}</span>
            {cfg.newKinds.map((k) => (
              <div key={k} className={s.newSuspect}>
                <Sprite name={CHARACTERS[k].asset} />
                <div>
                  <b>{CHARACTERS[k].name}</b>
                  <span>{CHARACTERS[k].tip}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {best > 0 && <p className={s.smallNote}>Best: {"★".repeat(best)}{"☆".repeat(3 - best)}</p>}
        <GameButton asset="btn_start" label="Start" width={46} onClick={onStart} />
      </Panel>
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </div>
  );
}
