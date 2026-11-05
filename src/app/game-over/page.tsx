"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { casesSolved, runScore, startNewRun } from "../../game/player";
import { Screen } from "../../components/Screen";
import { GameButton, Hearts, IconButton, Sprite } from "../../components/ui";
import { usePlayer, useRequireProfile } from "../../state/PlayerProvider";
import s from "../screens.module.css";

export default function GameOverPage() {
  const router = useRouter();
  const { save, apply } = usePlayer();
  const hasDetective = useRequireProfile();

  // Only checked on arrival: starting a new run below also restores the lives.
  const arrivedWithLives = save.lives > 0;
  // A refresh on the failed screen mustn't cost the player their Rebirth Challenge.
  const rebirthOnOffer = save.lives === 0 && save.rebirthOffer !== null;
  useEffect(() => {
    if (arrivedWithLives) router.replace("/menu");
    else if (rebirthOnOffer) router.replace("/rebirth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasDetective || rebirthOnOffer) return null;

  const finalScore = runScore(save);
  const newRecord = finalScore > 0 && finalScore === save.highScore;

  return (
    <Screen bg="bg_game_over">
      <div className={s.gameOver}>
        <span className="title-text title-red pop-in" style={{ fontSize: "15cqw" }}>
          Game Over
        </span>
        <Sprite name="hero_sad" width={40} className="float" />
        <div className={`${s.gameOverCard} pop-in`}>
          {newRecord && <span className={s.badgeNew}>New high score!</span>}
          <div className={s.statRow}>
            <Sprite name="coin" />
            <span>Final score</span>
            <b>{finalScore.toLocaleString()}</b>
          </div>
          <div className={s.statRow}>
            <Sprite name="icon_case_file" />
            <span>Cases solved</span>
            <b>{casesSolved(save)}</b>
          </div>
          <div className={s.statRow}>
            <Sprite name="trophy" />
            <span>Best ever</span>
            <b>{save.highScore.toLocaleString()}</b>
          </div>
        </div>
        <Hearts lives={0} size={10} />
        <div className={s.rowButtons}>
          <GameButton
            asset="btn_retry"
            label="Retry"
            width={46}
            onClick={() => {
              apply(startNewRun);
              router.replace("/cases");
            }}
          />
          <IconButton icon="icon_btn_home" label="Home" size={15} onClick={() => router.replace("/menu")} />
        </div>
      </div>
    </Screen>
  );
}
