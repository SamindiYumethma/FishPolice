"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NAME_MAX, NAME_MIN } from "../../game/player";
import { AccountsNotice } from "../../components/AccountsNotice";
import { Screen } from "../../components/Screen";
import { Checkbox, GameButton, IconButton, Modal, Panel, Sprite, TextField } from "../../components/ui";
import s from "../screens.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [notice, setNotice] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNotice(true);
  };

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <IconButton icon="icon_btn_back" label="Back" size={12} className={s.backBtn} onClick={() => router.replace("/welcome")} />
      <div className={`${s.authScroll} screen-scroll`}>
        <div style={{ height: "10cqw", flexShrink: 0 }} />
        <Sprite name="hero_happy" width={34} className={s.authHero} />
        <Panel title="Sign Up" className="fade-in">
          <form className={s.form} onSubmit={submit} noValidate>
            <TextField
              icon="icon_user"
              placeholder="Detective name"
              value={name}
              onChange={setName}
              maxLength={NAME_MAX}
              hint={`${NAME_MIN}–${NAME_MAX} characters. Shown on the leaderboard.`}
            />
            <TextField icon="icon_email" type="email" inputMode="email" placeholder="Email" value={email} onChange={setEmail} />
            <TextField
              icon="icon_password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              hint="At least 8 characters with a letter and a number."
            />
            <TextField icon="icon_password" type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} />
            <div style={{ width: "100%" }}>
              <Checkbox checked={terms} onChange={setTerms}>
                I agree to the{" "}
                <span
                  role="link"
                  tabIndex={0}
                  className="link-btn"
                  style={{ padding: 0, fontSize: "inherit" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTerms(true);
                  }}
                >
                  terms
                </span>
              </Checkbox>
            </div>
            <GameButton asset="btn_create_account" label="Create account" type="submit" width={58} />
            <p className={s.formFooter}>
              Have an account?{" "}
              <button type="button" onClick={() => router.replace("/login")}>
                Log in
              </button>
            </p>
          </form>
        </Panel>
      </div>
      {notice && <AccountsNotice onClose={() => setNotice(false)} />}
      {showTerms && (
        <Modal onBackdrop={() => setShowTerms(false)}>
          <Panel title="Terms" width={84} className="pop-in" onClose={() => setShowTerms(false)}>
            <div className="body-text" style={{ fontSize: "3.6cqw", textAlign: "left", display: "grid", gap: "2cqw" }}>
              <span>• Fish Police is a student project made for learning purposes.</span>
              <span>• We store your email, detective name, avatar and game progress to run the game and the leaderboard.</span>
              <span>• Your detective name and high score are visible to other players.</span>
              <span>• Be kind: offensive names may be removed.</span>
              <span>• You can delete your account and data at any time from Settings.</span>
            </div>
            <GameButton color="green" label="Got it" width={44} onClick={() => { setTerms(true); setShowTerms(false); }} />
          </Panel>
        </Modal>
      )}
    </Screen>
  );
}
