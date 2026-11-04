"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { caseLabel, LEVEL_COUNT } from "../../game/levels";
import { avatarAsset, casesSolved, runScore } from "../../game/player";
import { Screen } from "../../components/Screen";
import { GameButton, Hearts, IconButton, Pill, Sprite } from "../../components/ui";
import { HowToPlay } from "../../components/HowToPlay";
import { usePlayer, useRequireProfile } from "../../state/PlayerProvider";
import s from "../screens.module.css";

export default function MenuPage() {
  const router = useRouter();
  const { save } = usePlayer();
  const hasDetective = useRequireProfile();
  const [howTo, setHowTo] = useState(false);

  if (!hasDetective) return null;

  return (
    <Screen bg="bg_main_menu_beach">
      <div className={s.menuTop}>
        <Hearts lives={save.lives} />
        <div className={s.menuTopRight}>
          <button type="button" className={s.avatarBtn} aria-label="Edit your detective" onClick={() => router.push("/profile-setup?edit=1")}>
            <Sprite name={avatarAsset(save.avatar)} />
          </button>
        </div>
      </div>

      <div className={s.menuCenter}>
        <Sprite name="logo" className="pop-in" alt="Fish Police: The Treasure Heist" style={{ width: "min(64cqw, 26cqh)" }} />
        <Sprite name="hero_idle" className="float" style={{ width: "min(42cqw, 17cqh)" }} />
        <div className={s.greeting}>
          {save.name}
          <small>{casesSolved(save) >= LEVEL_COUNT ? "All cases solved!" : `Next: ${caseLabel(save.highestUnlocked)}`}</small>
        </div>
        <div className={s.runStrip}>
          <Pill icon="xp_star" className="cream">
            Run {runScore(save).toLocaleString()}
          </Pill>
        </div>
        <GameButton asset="btn_play" label="Play" width="min(62cqw, 26cqh)" onClick={() => router.push("/cases")} />
      </div>

      <div className={s.menuBottom}>
        <IconButton icon="icon_case_file" label="How to play" size={15} onClick={() => setHowTo(true)} />
      </div>
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </Screen>
  );
}
