"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avatarAsset, caseLabel, DEMO_PLAYER } from "../../lib/mock";
import { Screen } from "../../components/Screen";
import { GameButton, Hearts, IconButton, Pill, Sprite } from "../../components/ui";
import { HowToPlay } from "../../components/HowToPlay";
import s from "../screens.module.css";

export default function MenuPage() {
  const router = useRouter();
  const [howTo, setHowTo] = useState(false);
  // Only flips the icon; there is no audio in the UI demo.
  const [soundOn, setSoundOn] = useState(true);
  const p = DEMO_PLAYER;

  return (
    <Screen bg="bg_main_menu_beach">
      <div className={s.menuTop}>
        <Hearts lives={p.lives} />
        <div className={s.menuTopRight}>
          <Pill icon="coin">{p.coins.toLocaleString()}</Pill>
          <button type="button" className={s.avatarBtn} aria-label="Edit your detective" onClick={() => router.push("/profile-setup?edit=1")}>
            <Sprite name={avatarAsset(p.avatar)} />
          </button>
        </div>
      </div>

      <div className={s.menuCenter}>
        <Sprite name="logo" className="pop-in" alt="Fish Police: The Treasure Heist" style={{ width: "min(64cqw, 26cqh)" }} />
        <Sprite name="hero_idle" className="float" style={{ width: "min(42cqw, 17cqh)" }} />
        <div className={s.greeting}>
          {p.detectiveName}
          <small>
            {p.rank} · Next: {caseLabel(p.highestUnlocked)}
          </small>
        </div>
        <div className={s.runStrip}>
          <Pill icon="xp_star" className="cream">Run {p.runScore.toLocaleString()}</Pill>
        </div>
        <GameButton asset="btn_play" label="Play" width="min(62cqw, 26cqh)" onClick={() => router.push("/cases")} />
      </div>

      <div className={s.menuBottom}>
        <IconButton icon="icon_btn_leaderboard" label="Leaderboard" size={15} onClick={() => router.push("/leaderboard")} />
        <IconButton
          icon={soundOn ? "icon_btn_sound_on" : "icon_btn_sound_off"}
          label={soundOn ? "Mute" : "Unmute"}
          size={15}
          onClick={() => setSoundOn((v) => !v)}
        />
        <IconButton icon="icon_case_file" label="How to play" size={15} onClick={() => setHowTo(true)} />
        <IconButton icon="icon_btn_settings" label="Settings" size={15} onClick={() => router.push("/settings")} />
      </div>
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </Screen>
  );
}
