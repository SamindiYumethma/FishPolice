"use client";

import { useRouter } from "next/navigation";
import { Screen } from "../components/Screen";
import { GameButton, Panel, Sprite } from "../components/ui";

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <div className="center-col">
        <Panel title="Lost at sea">
          <Sprite name="hero_shocked" width={34} />
          <p className="body-text" style={{ margin: 0 }}>This part of the ocean hasn&apos;t been charted yet.</p>
          <GameButton color="green" label="Go home" width={50} onClick={() => router.replace("/menu")} />
        </Panel>
      </div>
    </Screen>
  );
}
