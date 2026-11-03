"use client";

import { useState } from "react";
import { assetUrl } from "../lib/assets";
import { MAX_REBIRTHS } from "../lib/mock";
import { GameButton, Pill, Ribbon, Sprite } from "../components/ui";
import s from "./play.module.css";

/**
 * Rebirth Challenge layout. In the real game the photo comes from the Fish API;
 * here a game background stands in for it and nothing is checked.
 */
export function RebirthMock({ onSubmit }: { onSubmit: () => void }) {
  const [fish, setFish] = useState("");
  const [chest, setChest] = useState("");

  return (
    <div className={s.phase} style={{ backgroundImage: `url(${assetUrl("bg_rebirth_challenge")})`, justifyContent: "flex-start" }}>
      <div className={s.phaseTop}>
        <span />
        <Pill icon="icon_stopwatch">0:30</Pill>
      </div>
      <div className={s.rebirthHeader}>
        <Sprite name="rebirth_heart" className={s.rebirthHeart} />
        <Ribbon width={80} fontSize={6.4}>
          Rebirth Challenge
        </Ribbon>
        <span className={s.attempt}>1 of {MAX_REBIRTHS} · 30 seconds</span>
      </div>

      <div className={s.photo}>
        <div className={s.photoInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetUrl("bg_gameplay_reef")} alt="Sample underwater scene" draggable={false} />
        </div>
        <span className={s.zoomHint}>Tap to zoom</span>
      </div>

      <form
        className={s.answers}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <CountRow icon="civilian_fish_blue" label="How many fish?" value={fish} onChange={setFish} />
        <CountRow icon="chest_closed" label="How many chests?" value={chest} onChange={setChest} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GameButton asset="btn_submit" label="Submit" type="submit" width={48} />
        </div>
      </form>
    </div>
  );
}

function CountRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: "civilian_fish_blue" | "chest_closed";
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const n = value === "" ? 0 : Number(value);
  return (
    <div className={s.answerRow}>
      <Sprite name={icon} />
      <label>{label}</label>
      <div className={s.stepper}>
        <button type="button" className={s.stepBtn} aria-label={`Fewer: ${label}`} disabled={!n} onClick={() => onChange(String(n - 1))}>
          −
        </button>
        <input
          className={s.numBox}
          type="text"
          inputMode="numeric"
          placeholder="?"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
        />
        <button type="button" className={s.stepBtn} aria-label={`More: ${label}`} onClick={() => onChange(String(Math.min(99, n + 1)))}>
          +
        </button>
      </div>
    </div>
  );
}
