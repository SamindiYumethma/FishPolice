"use client";

import { useState } from "react";
import { CHARACTERS, caseLabel, DEMO_PLAYER, LEVEL_COUNT, type DemoCase } from "../lib/mock";
import { assetUrl, type AssetName } from "../lib/assets";
import { GameButton, Hearts, IconButton, Modal, Panel, Ribbon, Sprite } from "../components/ui";
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

/* ── Pause ───────────────────────────────────────────────────────────────── */

export function PauseMenu({ onResume, onRestart, onQuit }: { onResume: () => void; onRestart: () => void; onQuit: () => void }) {
  const [confirm, setConfirm] = useState<null | "restart" | "quit">(null);
  const [howTo, setHowTo] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  return (
    <Modal onBackdrop={confirm ? undefined : onResume}>
      {!confirm ? (
        <Panel title="Paused" width={80} className="pop-in">
          <GameButton asset="btn_resume" label="Resume" width={52} onClick={onResume} />
          <GameButton asset="btn_restart" label="Restart" width={52} onClick={() => setConfirm("restart")} />
          <GameButton asset="btn_quit" label="Quit" width={52} onClick={() => setConfirm("quit")} />
          <div style={{ display: "flex", gap: "4cqw" }}>
            <IconButton icon={soundOn ? "icon_btn_sound_on" : "icon_btn_sound_off"} label={soundOn ? "Mute" : "Unmute"} size={13} onClick={() => setSoundOn((v) => !v)} />
            <IconButton icon="icon_case_file" label="How to play" size={13} onClick={() => setHowTo(true)} />
          </div>
        </Panel>
      ) : (
        <Panel title={confirm === "restart" ? "Restart?" : "Quit case?"} width={82} className="pop-in">
          <Sprite name="hero_shocked" width={24} />
          <p className="body-text" style={{ margin: 0 }}>
            Leaving a case early counts as failing it: you&apos;ll lose a life.
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

export function ChestUnlocked({ level, onContinue, onMap }: { level: number; onContinue: () => void; onMap: () => void }) {
  const last = level >= LEVEL_COUNT;
  const stars = 3;
  return (
    <div className={s.phase} style={bg("bg_victory")}>
      <Ribbon width={88} className="pop-in">
        <span className="title-gold">Chest Unlocked!</span>
      </Ribbon>
      <div className={s.starsRow} aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Sprite key={n} name="xp_star" className={n <= stars ? s.starOn : s.starOff} style={{ animationDelay: `${0.2 + n * 0.2}s` }} />
        ))}
      </div>
      <div className={s.scene}>
        <Sprite name="chest_open" width={34} className="pop-in" />
        <Sprite name="hero_happy" width={28} className="float" />
      </div>
      <Panel width={84}>
        <div className={s.rewardList}>
          <div className={s.reward} style={{ animationDelay: "0.3s" }}>
            <Sprite name="coin" /> +250
            <small>+100 first clear</small>
          </div>
          <div className={s.reward} style={{ animationDelay: "0.45s" }}>
            <Sprite name="xp_star" /> +120 XP
          </div>
          <div className={s.reward} style={{ animationDelay: "0.6s" }}>
            <Sprite name="rare_item_pearl" /> Rare pearl!
            <small>3-star clear</small>
          </div>
        </div>
        <p className={s.resultLine}>Case score 820 · Run 3,170</p>
        <GameButton asset={last ? undefined : "btn_continue"} color="green" label={last ? "Back to map" : "Continue"} width={52} onClick={last ? onMap : onContinue} />
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

export function CaseFailed({ target, onEarnBack, onRetry, onMap }: { target: number; onEarnBack: () => void; onRetry: () => void; onMap: () => void }) {
  const lives = DEMO_PLAYER.lives - 1;
  return (
    <div className={s.phase} style={bg("bg_gameplay_reef")}>
      <Panel title="Case Failed" titleClass="title-red" className="pop-in">
        <div className={s.scene}>
          <Sprite name="hero_sad" width={30} />
          <Sprite name="crab_crook" width={26} style={{ marginBottom: "6cqw" }} className="float" />
        </div>
        <div className={s.caseTitle}>The treasure escaped!</div>
        <p className={s.resultLine}>
          You scored {Math.round(target * 0.6)} / {target}
        </p>
        <Hearts lives={lives} animateFrom={DEMO_PLAYER.lives} size={11} />
        <div className={s.lifeLost}>−1 life</div>
        <GameButton asset="btn_retry" label="Retry" width={50} onClick={onRetry} />
        <GameButton asset="btn_earn_it_back" label="Earn it back" width={56} onClick={onEarnBack} />
        <p className={s.smallNote}>Rebirth challenge: 30s to answer · 3 left this run</p>
        <button type="button" className="link-btn" onClick={onMap}>
          Back to map
        </button>
      </Panel>
    </div>
  );
}

/* ── Life recovered ──────────────────────────────────────────────────────── */

export function LifeRecovered({ onContinue }: { onContinue: () => void }) {
  return (
    <div className={s.phase} style={bg("bg_victory")}>
      <Ribbon width={88} className="pop-in">
        Life Recovered!
      </Ribbon>
      <Sprite name="rebirth_heart" width={52} className="pop-in" />
      <Sprite name="hero_happy" width={40} className="float" />
      <Hearts lives={DEMO_PLAYER.lives} animateFrom={DEMO_PLAYER.lives - 1} size={14} />
      <Panel width={70}>
        <p className={s.resultLine} style={{ margin: 0 }}>
          Rebirths left: 2
        </p>
        <GameButton asset="btn_continue" label="Continue" width={48} onClick={onContinue} />
      </Panel>
    </div>
  );
}

/* ── Rebirth failed ──────────────────────────────────────────────────────── */

export function RebirthFailed({ onTryAgain, onGiveUp }: { onTryAgain: () => void; onGiveUp: () => void }) {
  return (
    <div className={s.phase} style={bg("bg_rebirth_challenge")}>
      <Panel title="Not quite!" titleClass="title-red" className="pop-in">
        <Sprite name="hero_sad" width={30} />
        <p className={s.resultLine} style={{ margin: 0 }}>The photo had:</p>
        <div className={s.answerReveal}>
          <div>
            <Sprite name="civilian_fish_blue" /> 7<span className={s.wrong}>you said 6</span>
          </div>
          <div>
            <Sprite name="chest_closed" /> 2
          </div>
        </div>
        <p className={s.smallNote}>2 rebirths left. The next one is harder: only 22s!</p>
        <GameButton color="green" label="Try another" width={54} onClick={onTryAgain} />
        <GameButton asset="btn_give_up" label="Give up" width={40} onClick={onGiveUp} />
      </Panel>
    </div>
  );
}
