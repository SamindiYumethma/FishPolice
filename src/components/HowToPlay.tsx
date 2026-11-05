"use client";

import { CHARACTERS, pointsLabel, type Kind } from "../game/characters";
import { MAX_LIVES } from "../game/player";
import { MAX_REBIRTHS } from "../game/rebirth";
import { GameButton, Modal, Panel, Sprite } from "./ui";
import styles from "./HowToPlay.module.css";

const ORDER: Kind[] = ["crab", "octopus", "civilian"];

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
                  <Sprite name={c.skins[0]} />
                  <b>{c.name}</b>
                  <span className={c.isCriminal ? styles.good : styles.bad}>{pointsLabel(c.points)}</span>
                </div>
              );
            })}
          </div>
          <ul className={styles.tips}>
            <li>
              <Sprite name="xp_star" />
              <span>Finish with plenty of time left for 3 stars.</span>
            </li>
            <li>
              <Sprite name="heart_full" />
              <span>You have {MAX_LIVES} lives. Failing or leaving a case costs one. Lose them all and the run is over.</span>
            </li>
            <li>
              <Sprite name="rebirth_heart" />
              <span>Failed a case? Take the <b>Rebirth Challenge</b>: count the fish and chests in a photo to win the life back. You get <b>one chance</b> each time and {MAX_REBIRTHS} per run, with less time and busier photos every time.</span>
            </li>
          </ul>
        </div>
        <GameButton color="green" label="Got it!" width={44} onClick={onClose} />
      </Panel>
    </Modal>
  );
}
