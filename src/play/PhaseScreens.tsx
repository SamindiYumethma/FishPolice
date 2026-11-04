"use client";

import { useState } from "react";
import { CHARACTERS } from "../game/characters";
import type { CaseResult } from "../game/GameEngine";
import { caseLabel, type LevelConfig } from "../game/levels";
import { runScore, type PlayerSave } from "../game/player";
import { assetUrl, type AssetName } from "../lib/assets";
import { GameButton, Hearts, IconButton, Modal, Panel, Ribbon, Sprite } from "../components/ui";
import { HowToPlay } from "../components/HowToPlay";
import s from "./play.module.css";

const bg = (name: AssetName) => ({ backgroundImage: `url(${assetUrl(name)})` });

/* ── Briefing ────────────────────────────────────────────────────────────── */

export function Briefing({
  level,
  lives,
  bestStars,
  onStart,
  onClose,
}: {
  level: LevelConfig;
  lives: number;
  bestStars: number;
  onStart: () => void;
  onClose: () => void;
}) {
  const [howTo, setHowTo] = useState(false);
  return (
    <div className={s.phase} style={bg("bg_gameplay_reef")}>
      <div className={s.phaseTop}>
        <Hearts lives={lives} size={7.5} />
        <IconButton icon="icon_case_file" label="How to play" size={12} onClick={() => setHowTo(true)} />
      </div>
      <Panel title={caseLabel(level.level)} onClose={onClose} className="pop-in">
        <div className={s.scene}>
          <Sprite name={level.disguiseChance > 0 ? "octopus_disguised" : "crab_crook"} width={36} className="float" />
          <Sprite name="chest_closed" width={22} />
        </div>
        <div className={s.caseTitle}>{level.title}</div>
        <p className={s.caseTag}>{level.tagline}</p>
        <div className={s.chips}>
          <span className={s.chip}>
            <Sprite name="icon_target" /> {level.targetScore} pts
          </span>
          <span className={s.chip}>
            <Sprite name="icon_stopwatch" /> {level.timeLimitSec} sec
          </span>
        </div>
        {level.newKinds.length > 0 && (
          <div className={s.newSuspects}>
            <span className={s.newLabel}>{level.level === 1 ? "Know your suspects" : "New on the reef!"}</span>
            {level.newKinds.map((kind) => (
              <div key={kind} className={s.newSuspect}>
                <Sprite name={CHARACTERS[kind].skins[0]} />
                <div>
                  <b>{CHARACTERS[kind].name}</b>
                  <span>{CHARACTERS[kind].tip}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {bestStars > 0 && (
          <p className={s.smallNote}>
            Best: {"★".repeat(bestStars)}
            {"☆".repeat(3 - bestStars)}
          </p>
        )}
        <GameButton asset="btn_start" label="Start" width={46} onClick={onStart} />
      </Panel>
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </div>
  );
}

/* ── Pause ───────────────────────────────────────────────────────────────── */

export function PauseMenu({ lives, onResume, onRestart, onQuit }: { lives: number; onResume: () => void; onRestart: () => void; onQuit: () => void }) {
  const [confirm, setConfirm] = useState<null | "restart" | "quit">(null);
  const [howTo, setHowTo] = useState(false);
  const lastLife = lives <= 1;

  return (
    <Modal onBackdrop={confirm ? undefined : onResume}>
      {!confirm ? (
        <Panel title="Paused" width={80} className="pop-in">
          <GameButton asset="btn_resume" label="Resume" width={52} onClick={onResume} />
          <GameButton asset="btn_restart" label="Restart" width={52} onClick={() => setConfirm("restart")} />
          <GameButton asset="btn_quit" label="Quit" width={52} onClick={() => setConfirm("quit")} />
          <IconButton icon="icon_case_file" label="How to play" size={13} onClick={() => setHowTo(true)} />
        </Panel>
      ) : (
        <Panel title={confirm === "restart" ? "Restart?" : "Quit case?"} width={82} className="pop-in">
          <Sprite name="hero_shocked" width={24} />
          <p className="body-text" style={{ margin: 0 }}>
            Leaving a case early counts as failing it: you&apos;ll lose a life.
            {lastLife && " This is your last one!"}
          </p>
          <GameButton color="red" label={confirm === "restart" ? "Restart (−1 life)" : "Quit (−1 life)"} width={60} onClick={confirm === "restart" ? onRestart : onQuit} />
          <GameButton color="cream" label="Keep playing" width={50} onClick={() => setConfirm(null)} />
        </Panel>
      )}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </Modal>
  );
}

/* ── Chest unlocked ──────────────────────────────────────────────────────── */

export function ChestUnlocked({
  level,
  result,
  save,
  last,
  onContinue,
  onMap,
}: {
  level: LevelConfig;
  result: CaseResult;
  save: PlayerSave;
  last: boolean;
  onContinue: () => void;
  onMap: () => void;
}) {
  return (
    <div className={s.phase} style={bg("bg_victory")}>
      <Ribbon width={88} className="pop-in">
        <span className="title-gold">{last ? "Heist Solved!" : "Chest Unlocked!"}</span>
      </Ribbon>
      <div className={s.starsRow} aria-label={`${result.stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Sprite key={n} name="xp_star" className={n <= result.stars ? s.starOn : s.starOff} style={{ animationDelay: `${0.2 + n * 0.2}s` }} />
        ))}
      </div>
      <div className={s.scene}>
        <Sprite name="chest_open" width={34} className="pop-in" />
        <Sprite name="hero_happy" width={28} className="float" />
      </div>
      <Panel width={84}>
        <div className={s.caseTitle}>{level.title}</div>
        <p className={s.resultLine}>
          Case score {result.score.toLocaleString()} · Run {runScore(save).toLocaleString()}
        </p>
        {last && <p className={s.smallNote}>You recovered every stolen chest. The reef is safe!</p>}
        <GameButton asset={last ? undefined : "btn_continue"} color="green" label={last ? "Back to map" : "Continue"} width={52} onClick={onContinue} />
        {!last && (
          <button type="button" className="link-btn" onClick={onMap}>
            Back to map
          </button>
        )}
      </Panel>
    </div>
  );
}

/* ── Case failed ─────────────────────────────────────────────────────────── */

export function CaseFailed({
  result,
  lives,
  livesBefore,
  onRetry,
  onMap,
  onGameOver,
}: {
  result: CaseResult;
  lives: number;
  livesBefore: number;
  onRetry: () => void;
  onMap: () => void;
  onGameOver: () => void;
}) {
  return (
    <div className={s.phase} style={bg("bg_gameplay_reef")}>
      <Panel title="Case Failed" titleClass="title-red" className="pop-in">
        <div className={s.scene}>
          <Sprite name="hero_sad" width={30} />
          <Sprite name="crab_crook" width={26} style={{ marginBottom: "6cqw" }} className="float" />
        </div>
        <div className={s.caseTitle}>The treasure escaped!</div>
        <p className={s.resultLine}>
          You scored {result.score} / {result.targetScore}
        </p>
        <Hearts lives={lives} animateFrom={livesBefore} size={11} />
        <div className={s.lifeLost}>−1 life</div>
        {lives > 0 ? (
          <>
            <GameButton asset="btn_retry" label="Retry" width={50} onClick={onRetry} />
            <button type="button" className="link-btn" onClick={onMap}>
              Back to map
            </button>
          </>
        ) : (
          <GameButton asset="btn_continue" label="Continue" width={50} onClick={onGameOver} />
        )}
      </Panel>
    </div>
  );
}
