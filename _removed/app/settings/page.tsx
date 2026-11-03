"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_PLAYER } from "../../lib/mock";
import { Screen } from "../../components/Screen";
import { ConfirmDialog, GameButton, Panel, Sprite, TextField, Toggle } from "../../components/ui";
import { HowToPlay } from "../../components/HowToPlay";
import s from "../screens.module.css";

export default function SettingsPage() {
  const router = useRouter();
  // Toggles only change how they look; nothing is stored in the UI demo.
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [dialog, setDialog] = useState<null | "logout" | "delete">(null);
  const [password, setPassword] = useState("");
  const [howTo, setHowTo] = useState(false);

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <div className="screen-scroll" style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ height: "14cqw", flexShrink: 0 }} />
        <Panel title="Settings" onClose={() => router.replace("/menu")} className="fade-in">
          <div className={s.settingRow}>
            <Sprite name="icon_music" />
            <span>Music</span>
            <Toggle on={music} onChange={setMusic} label="Music" />
          </div>
          <div className={s.settingRow}>
            <Sprite name="icon_btn_sound_on" />
            <span>Sound</span>
            <Toggle on={sound} onChange={setSound} label="Sound effects" />
          </div>
          <div className={s.settingRow}>
            <Sprite name="icon_vibration" />
            <span>Vibration</span>
            <Toggle on={vibration} onChange={setVibration} label="Vibration" />
          </div>

          <GameButton color="blue" label="How to play" width={50} onClick={() => setHowTo(true)} />

          <div className={s.accountBox}>
            Signed in as <b>{DEMO_PLAYER.email}</b>
          </div>
          <GameButton asset="btn_account" label="Account" width={52} onClick={() => router.push("/profile-setup?edit=1")} />
          <GameButton asset="btn_log_out" label="Log out" width={52} onClick={() => setDialog("logout")} />
          <button type="button" className="link-btn" style={{ color: "var(--red-dark)" }} onClick={() => setDialog("delete")}>
            Delete account
          </button>
          <p className="muted" style={{ margin: "0 0 4cqw", fontSize: "2.8cqw", textAlign: "center", padding: "0 6cqw" }}>
            Fish Police: The Treasure Heist v1.0 · UI demo
          </p>
        </Panel>
        <div style={{ height: "6cqw", flexShrink: 0 }} />
      </div>

      {dialog === "logout" && (
        <ConfirmDialog
          title="Log out?"
          message="You can log back in any time. Your progress is saved."
          confirmLabel="Log out"
          onConfirm={() => router.replace("/welcome")}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog === "delete" && (
        <ConfirmDialog
          title="Delete account?"
          message="This permanently deletes your detective, progress and leaderboard entry. It can't be undone."
          confirmLabel="Delete forever"
          danger
          onConfirm={() => router.replace("/welcome")}
          onCancel={() => setDialog(null)}
        >
          <TextField icon="icon_password" type="password" placeholder="Your password" value={password} onChange={setPassword} />
        </ConfirmDialog>
      )}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
    </Screen>
  );
}
