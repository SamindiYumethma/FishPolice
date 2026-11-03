"use client";

import { useRouter } from "next/navigation";
import { DEMO_PLAYER } from "../../lib/mock";
import { Screen } from "../../components/Screen";
import { GameButton, Hearts, IconButton, Sprite } from "../../components/ui";
import s from "../screens.module.css";

export default function GameOverPage() {
  const router = useRouter();
  return (
    <Screen bg="bg_game_over">
      <div className={s.gameOver}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2cqw" }}>
          <span className="title-text title-red pop-in" style={{ fontSize: "15cqw" }}>
            Game Over
          </span>
          <span className="pill" style={{ fontSize: "4cqw", height: "8cqw", padding: "0 4cqw" }}>
            No rebirths left
          </span>
        </div>
        <Sprite name="hero_sad" width={40} className="float" />
        <div className={`${s.gameOverCard} pop-in`}>
          <span className={s.badgeNew}>New high score!</span>
          <div className={s.statRow}>
            <Sprite name="coin" />
            <span>Final score</span>
            <b>{DEMO_PLAYER.highScore.toLocaleString()}</b>
          </div>
          <div className={s.statRow}>
            <Sprite name="icon_case_file" />
            <span>Cases solved</span>
            <b>{DEMO_PLAYER.highestUnlocked - 1}</b>
          </div>
          <div className={s.statRow}>
            <Sprite name="trophy" />
            <span>Best ever</span>
            <b>{DEMO_PLAYER.highScore.toLocaleString()}</b>
          </div>
        </div>
        <Hearts lives={0} size={10} />
        <div className={s.rowButtons}>
          <GameButton asset="btn_retry" label="Retry" width={46} onClick={() => router.replace("/cases")} />
          <IconButton icon="icon_btn_home" label="Home" size={15} onClick={() => router.replace("/menu")} />
          <IconButton icon="icon_btn_leaderboard" label="Leaderboard" size={15} onClick={() => router.push("/leaderboard")} />
        </div>
      </div>
    </Screen>
  );
}
