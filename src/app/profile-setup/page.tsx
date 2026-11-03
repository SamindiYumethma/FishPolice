"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AVATARS, avatarAsset, DEMO_PLAYER, NAME_MAX, type Avatar } from "../../lib/mock";
import { Screen } from "../../components/Screen";
import { GameButton, IconButton, Panel, Sprite, TextField } from "../../components/ui";
import s from "../screens.module.css";

function ProfileSetupInner() {
  const router = useRouter();
  // ?edit=1 is the "edit your detective" version opened from the menu.
  const editing = useSearchParams().get("edit") === "1";
  const [name, setName] = useState(editing ? DEMO_PLAYER.detectiveName : "");
  const [avatar, setAvatar] = useState<Avatar>(DEMO_PLAYER.avatar);

  // UI demo: nothing is saved, just go to the menu.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.replace("/menu");
  };

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      {editing && <IconButton icon="icon_btn_back" label="Back" size={12} className={s.backBtn} onClick={() => router.replace("/menu")} />}
      <div className={`${s.authScroll} screen-scroll`}>
        <div style={{ height: editing ? "16cqw" : "8cqw", flexShrink: 0 }} />
        <Panel title="Your Detective" className="fade-in">
          <form className={s.form} onSubmit={submit} noValidate>
            <div className={s.avatarBig}>
              <Sprite name={avatarAsset(avatar)} width={38} className="pop-in" key={avatar} />
            </div>
            <div className={s.avatarRow} role="radiogroup" aria-label="Choose your detective">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={avatar === a}
                  aria-label={`${a} detective`}
                  className={s.avatarOpt}
                  onClick={() => setAvatar(a)}
                >
                  <Sprite name={avatarAsset(a)} />
                </button>
              ))}
            </div>
            <TextField icon="icon_user" placeholder="Detective name" value={name} onChange={setName} maxLength={NAME_MAX} hint="Shown on the leaderboard." />
            {editing && (
              <div className={s.statList}>
                <div className={s.statRow}>
                  <Sprite name="level_badge" />
                  <span>{DEMO_PLAYER.rank}</span>
                  <b>{DEMO_PLAYER.xp} XP</b>
                </div>
                <div className={s.statRow}>
                  <Sprite name="trophy" />
                  <span>High score</span>
                  <b>{DEMO_PLAYER.highScore.toLocaleString()}</b>
                </div>
                <div className={s.statRow}>
                  <Sprite name="rare_item_pearl" />
                  <span>Pearls · Gems</span>
                  <b>
                    {DEMO_PLAYER.pearls} · {DEMO_PLAYER.gems}
                  </b>
                </div>
              </div>
            )}
            {editing ? (
              <GameButton color="green" label="Save" type="submit" width={48} />
            ) : (
              <GameButton asset="btn_lets_go" label="Let's go" type="submit" width={50} />
            )}
          </form>
        </Panel>
      </div>
    </Screen>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense>
      <ProfileSetupInner />
    </Suspense>
  );
}
