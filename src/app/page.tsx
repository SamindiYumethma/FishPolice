"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "../components/Screen";
import { BubbleBar, Sprite } from "../components/ui";
import { hasProfile } from "../game/player";
import { usePlayer } from "../state/PlayerProvider";
import s from "./screens.module.css";

/** Loading screen: fills the bubble bar, then returning players go to the menu and new ones to the welcome screen. */
export default function LoadingPage() {
  const router = useRouter();
  const { save } = usePlayer();
  const [progress, setProgress] = useState(0);
  const destination = hasProfile(save) ? "/menu" : "/welcome";

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(1, p + 0.1)), 150);
    const go = setTimeout(() => router.replace(destination), 1900);
    return () => {
      clearInterval(id);
      clearTimeout(go);
    };
  }, [router, destination]);

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <div className={s.loadingWrap}>
        <Sprite name="logo" className="pop-in" alt="Fish Police: The Treasure Heist" style={{ width: "min(78cqw, 34cqh)" }} />
        <Sprite name="hero_idle" className="float" style={{ width: "min(52cqw, 28cqh)" }} />
        <div className={s.loadingBottom}>
          <span className="title-text" style={{ fontSize: "7cqw" }}>
            Loading…
          </span>
          <BubbleBar progress={progress} />
        </div>
      </div>
    </Screen>
  );
}
