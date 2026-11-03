"use client";

import { CHARACTERS, MAX_LIVES, MAX_REBIRTHS, REBIRTH_TIME_LIMITS, type Kind } from "../lib/mock";
import { GameButton, Modal, Panel, Sprite } from "./ui";
import styles from "./HowToPlay.module.css";

const ORDER: Kind[] = ["crab", "octopus", "squid", "shark", "civilian", "bomb", "puffer", "badge"];

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Modal onBackdrop={onClose}>
      <Panel title="How to Play" width={90} className="pop-in" onClose={onClose}>
        <div className={`${styles.scroll} screen-scroll`}>
          <p className={styles.lead}>
            Arrest criminals before time runs out. Reach the target score to unlock the treasure chest!
          </p>
          <div className={styles.grid}>
            {ORDER.map((k) => {
              const c = CHARACTERS[k];
              return (
                <div key={k} className={styles.card}>
                  <Sprite name={c.asset} />
                  <b>{c.name}</b>
                  <span className={c.good ? styles.good : styles.bad}>{c.effect}</span>
                </div>
              );
            })}
          </div>
          <ul className={styles.tips}>
            <li>
              <Sprite name="fx_combo" />
              <span>Arrest 3 in a row for <b>2×</b>, 6 in a row for <b>3×</b> points. Mistakes or escapes reset the combo.</span>
            </li>
            <li>
              <Sprite name="xp_star" />
              <span>Swimming suspects are worth <b>1.5×</b>. Finish fast for 3 stars.</span>
            </li>
            <li>
              <Sprite name="heart_full" />
              <span>You have {MAX_LIVES} lives. Failing a case costs one.</span>
            </li>
            <li>
              <Sprite name="rebirth_heart" />
              <span>Out of luck? Take a <b>Rebirth Challenge</b>: count the fish and chests in a photo to win a life back. You get {MAX_REBIRTHS} per run, and each one gives you less time ({REBIRTH_TIME_LIMITS.join("s → ")}s) and a busier photo.</span>
            </li>
          </ul>
        </div>
        <GameButton color="green" label="Got it!" width={44} onClick={onClose} />
      </Panel>
    </Modal>
  );
}
