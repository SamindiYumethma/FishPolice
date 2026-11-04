"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AVATARS, avatarAsset, casesSolved, NAME_MAX, NAME_MIN, nameError, setProfile, type Avatar } from "../../game/player";
import { Screen } from "../../components/Screen";
import { GameButton, IconButton, Panel, Sprite, TextField } from "../../components/ui";
import { usePlayer } from "../../state/PlayerProvider";
import s from "../screens.module.css";

function ProfileSetupInner() {
  const router = useRouter();
  const { save, apply } = usePlayer();
  // ?edit=1 is the "edit your detective" version opened from the menu.
  const editing = useSearchParams().get("edit") === "1";
  const [name, setName] = useState(save.name);
  const [avatar, setAvatar] = useState<Avatar>(save.avatar);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problem = nameError(name);
    setError(problem);
    if (problem) return;
    apply((current) => setProfile(current, name, avatar));
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
            <TextField
              icon="icon_user"
              placeholder="Detective name"
              value={name}
              onChange={(value) => {
                setName(value);
                setError(null);
              }}
              maxLength={NAME_MAX}
              error={error}
              hint={`${NAME_MIN}–${NAME_MAX} characters.`}
            />
            {editing && (
              <div className={s.statList}>
                <div className={s.statRow}>
                  <Sprite name="icon_case_file" />
                  <span>Cases solved</span>
                  <b>{casesSolved(save)}</b>
                </div>
                <div className={s.statRow}>
                  <Sprite name="trophy" />
                  <span>High score</span>
                  <b>{save.highScore.toLocaleString()}</b>
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
