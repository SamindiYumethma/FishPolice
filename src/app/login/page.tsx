"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "../../components/Screen";
import { GameButton, IconButton, Panel, Sprite, TextField } from "../../components/ui";
import s from "../screens.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI demo: no account check, just go to the main menu.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/menu");
  };

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <IconButton icon="icon_btn_back" label="Back" size={12} className={s.backBtn} onClick={() => router.replace("/welcome")} />
      <div className={`${s.authScroll} screen-scroll`}>
        <div style={{ height: "10cqw", flexShrink: 0 }} />
        <Sprite name="hero_happy" width={36} className={s.authHero} />
        <Panel title="Log In" className="fade-in">
          <form className={s.form} onSubmit={submit} noValidate>
            <TextField icon="icon_email" type="email" inputMode="email" placeholder="Email" value={email} onChange={setEmail} autoComplete="email" />
            <TextField icon="icon_password" type="password" placeholder="Password" value={password} onChange={setPassword} autoComplete="current-password" />
            <GameButton asset="btn_log_in" label="Log in" type="submit" width={50} />
            <p className={s.formFooter}>
              New here?{" "}
              <button type="button" onClick={() => router.replace("/signup")}>
                Sign up
              </button>
            </p>
          </form>
        </Panel>
      </div>
    </Screen>
  );
}
