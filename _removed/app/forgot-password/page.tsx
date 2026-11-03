"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "../../components/Screen";
import { GameButton, IconButton, Panel, Sprite, TextField } from "../../components/ui";
import s from "../screens.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // UI demo: no email is sent.
  const submit = (e: FormEvent) => e.preventDefault();

  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <IconButton icon="icon_btn_back" label="Back" size={12} className={s.backBtn} onClick={() => router.replace("/login")} />
      <div className={`${s.authScroll} screen-scroll`}>
        <div style={{ height: "12cqw", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0", marginBottom: "-14cqw", position: "relative", zIndex: 2 }}>
          <Sprite name="hero_shocked" width={30} />
          <Sprite name="key" width={14} style={{ marginBottom: "6cqw", transform: "rotate(18deg)" }} />
        </div>
        <Panel title="Reset Password" className="fade-in">
          <form className={s.form} onSubmit={submit} noValidate>
            <p className="body-text" style={{ margin: 0 }}>
              Enter your email and we&apos;ll send a reset link.
            </p>
            <TextField icon="icon_email" type="email" inputMode="email" placeholder="Email" value={email} onChange={setEmail} />
            <GameButton asset="btn_send_link" label="Send link" type="submit" width={52} />
            <button type="button" className="link-btn" onClick={() => router.replace("/login")}>
              Back to log in
            </button>
          </form>
        </Panel>
      </div>
    </Screen>
  );
}
