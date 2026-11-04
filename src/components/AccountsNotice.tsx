"use client";

import { useRouter } from "next/navigation";
import { GameButton, Modal, Panel, Sprite } from "./ui";

/** Shown when a login or sign-up form is submitted, until accounts are connected to Firebase. */
export function AccountsNotice({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal onBackdrop={onClose}>
      <Panel title="Coming Soon" width={84} className="pop-in" onClose={onClose}>
        <Sprite name="hero_shocked" width={24} />
        <p className="body-text" style={{ margin: 0 }}>
          Accounts aren&apos;t connected yet, so nothing was sent or saved. You can play as a guest for now.
        </p>
        <GameButton asset="btn_play_as_guest" label="Play as guest" width={50} onClick={() => router.push("/profile-setup")} />
      </Panel>
    </Modal>
  );
}
