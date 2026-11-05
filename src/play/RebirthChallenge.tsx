"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_COUNT, MAX_REBIRTHS, type RebirthAnswerResponse, type RebirthStartResponse } from "../game/rebirth";
import { assetUrl, type AssetName } from "../lib/assets";
import { GameButton, IconButton, Pill, Ribbon, Sprite } from "../components/ui";
import { submitAnswer } from "./rebirthClient";
import s from "./play.module.css";

const LOW_TIME_SEC = 5;

export interface PlayerAnswer {
  fish: number | null;
  chest: number | null;
  /** The timer sent this, not the player. The server may still accept it, thanks to its network grace. */
  ranOut: boolean;
}

function toCount(value: string): number | null {
  return value === "" ? null : Number(value);
}

/**
 * The one photo and one answer of a Rebirth Challenge. The clock doesn't pause, because the
 * server's clock doesn't either. When it reaches zero, whatever is in the boxes is sent.
 */
export function RebirthChallenge({
  challenge,
  attempt,
  onResult,
}: {
  challenge: RebirthStartResponse;
  attempt: number;
  onResult: (result: RebirthAnswerResponse, answer: PlayerAnswer) => void;
}) {
  const [fish, setFish] = useState("");
  const [chest, setChest] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(challenge.timeLimitSec);
  const [zoomed, setZoomed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const locked = useRef<PlayerAnswer | null>(null);
  // Always the latest values, for when the timer sends them.
  const current = useRef({ fish: null as number | null, chest: null as number | null });
  current.current = { fish: toCount(fish), chest: toCount(chest) };

  const send = useCallback(async (ranOut = false) => {
    // The first answer is final, so a retry sends exactly the same numbers.
    const answer = (locked.current ??= { ...current.current, ranOut });
    setSending(true);
    setSendFailed(false);
    setZoomed(false);
    try {
      onResult(await submitAnswer(challenge.token, answer.fish, answer.chest), answer);
    } catch {
      setSending(false);
      setSendFailed(true);
    }
  }, [challenge.token, onResult]);

  useEffect(() => {
    const deadline = Date.now() + challenge.timeLimitSec * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(id);
        if (!locked.current) void send(true);
      }
    }, 200);
    return () => clearInterval(id);
  }, [challenge.timeLimitSec, send]);

  const timer = (
    <Pill icon="icon_stopwatch" className={secondsLeft <= LOW_TIME_SEC ? s.lowTime : ""}>
      0:{String(secondsLeft).padStart(2, "0")}
    </Pill>
  );
  const inputsLocked = sending || sendFailed;

  return (
    <div className={s.phase} style={{ backgroundImage: `url(${assetUrl("bg_rebirth_challenge")})`, justifyContent: "flex-start" }}>
      <div className={s.phaseTop}>
        <span />
        {timer}
      </div>
      <div className={s.rebirthHeader}>
        <Sprite name="rebirth_heart" className={s.rebirthHeart} />
        <Ribbon width={80} fontSize={6.4}>
          Rebirth Challenge
        </Ribbon>
        <span className={s.attempt}>
          {attempt + 1} of {MAX_REBIRTHS} · One chance
        </span>
      </div>

      <button type="button" className={s.photo} aria-label="Zoom in on the photo" onClick={() => setZoomed(true)}>
        <div className={s.photoInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={challenge.image} alt="Underwater scene with fish and treasure chests to count" draggable={false} />
        </div>
        <span className={s.zoomHint}>Tap to zoom</span>
      </button>

      <form
        className={s.answers}
        onSubmit={(e) => {
          e.preventDefault();
          if (!inputsLocked && fish !== "" && chest !== "") void send();
        }}
      >
        <CountRow icon="civilian_fish_blue" label="How many fish?" value={fish} onChange={setFish} disabled={inputsLocked} />
        <CountRow icon="chest_closed" label="How many chests?" value={chest} onChange={setChest} disabled={inputsLocked} />
        {sendFailed && (
          <p className={s.smallNote} role="alert" style={{ color: "#fff" }}>
            Connection lost. Your answer is safe, so send it again.
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {sendFailed ? (
            <GameButton color="green" label="Send again" width={48} onClick={() => void send()} />
          ) : (
            <GameButton asset="btn_submit" label="Submit" type="submit" width={48} loading={sending} disabled={fish === "" || chest === ""} />
          )}
        </div>
      </form>

      {zoomed && (
        <div className={s.zoomed} onClick={() => setZoomed(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={challenge.image} alt="Zoomed underwater scene" draggable={false} />
          <div className={s.zoomTimer}>{timer}</div>
          <IconButton icon="icon_btn_close" label="Close zoom" size={12} className={s.zoomClose} onClick={() => setZoomed(false)} />
        </div>
      )}
    </div>
  );
}

function CountRow({
  icon,
  label,
  value,
  onChange,
  disabled,
}: {
  icon: AssetName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const n = value === "" ? 0 : Number(value);
  return (
    <div className={s.answerRow}>
      <Sprite name={icon} />
      <label>{label}</label>
      <div className={s.stepper}>
        {/* From an empty box this steps to 0, since a photo can have no fish or no chests. */}
        <button type="button" className={s.stepBtn} aria-label={`Fewer: ${label}`} disabled={disabled || value === "0"} onClick={() => onChange(String(Math.max(0, n - 1)))}>
          −
        </button>
        <input
          className={s.numBox}
          type="text"
          inputMode="numeric"
          placeholder="?"
          aria-label={label}
          value={value}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
        />
        <button type="button" className={s.stepBtn} aria-label={`More: ${label}`} disabled={disabled} onClick={() => onChange(String(Math.min(MAX_COUNT, n + 1)))}>
          +
        </button>
      </div>
    </div>
  );
}
