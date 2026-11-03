"use client";

import { useRouter } from "next/navigation";
import { Screen } from "../../components/Screen";
import { GameButton, Sprite } from "../../components/ui";
import s from "../screens.module.css";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <Screen bg="bg_main_menu_beach">
      <div className={s.welcome}>
        <Sprite name="logo" className="pop-in" alt="Fish Police: The Treasure Heist" style={{ width: "min(80cqw, 34cqh)" }} />
        <Sprite name="hero_idle" className="float" style={{ width: "min(54cqw, 24cqh)" }} />
        <div className={s.welcomeButtons}>
          <GameButton asset="btn_sign_up" label="Sign up" width="min(64cqw, 27cqh)" onClick={() => router.push("/signup")} />
          <GameButton asset="btn_log_in" label="Log in" width="min(58cqw, 24cqh)" onClick={() => router.push("/login")} />
          <GameButton asset="btn_play_as_guest" label="Play as guest" width={44} onClick={() => router.push("/profile-setup")} />
        </div>
      </div>
    </Screen>
  );
}
