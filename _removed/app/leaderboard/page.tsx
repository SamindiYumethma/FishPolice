"use client";

import { useRouter } from "next/navigation";
import { avatarAsset, DEMO_LEADERBOARD } from "../../lib/mock";
import type { AssetName } from "../../lib/assets";
import { Screen } from "../../components/Screen";
import { IconButton, Panel, Sprite } from "../../components/ui";
import s from "../screens.module.css";

const MEDALS: AssetName[] = ["medal_gold", "medal_silver", "medal_bronze"];

export default function LeaderboardPage() {
  const router = useRouter();
  return (
    <Screen bg="bg_gameplay_reef" bubbles>
      <div className="top-bar">
        <IconButton icon="icon_btn_back" label="Back" size={12} onClick={() => router.replace("/menu")} />
        <span />
      </div>
      <Sprite name="trophy" width={22} className="float" style={{ marginTop: "-8cqw", zIndex: 2 }} />
      <Panel title="Top Detectives" className="fade-in" style={{ flex: 1, minHeight: 0, marginTop: "-4cqw" }}>
        <div className={`${s.boardList} screen-scroll`} style={{ maxHeight: "92cqw" }}>
          {DEMO_LEADERBOARD.map((r, i) => {
            const rank = i + 1;
            return (
              <div key={r.name} className={`${s.boardRow} ${r.me ? s.me : ""}`}>
                <div className={s.rankBadge}>{rank <= 3 ? <Sprite name={MEDALS[rank - 1]} /> : rank}</div>
                <Sprite name={avatarAsset(r.avatar)} className={s.boardAvatar} />
                <div className={s.boardName}>
                  <b>{r.me ? `${r.name} (You)` : r.name}</b>
                  <span>
                    <Sprite name="coin" /> {r.highScore.toLocaleString()}
                  </span>
                </div>
                <div className={s.boardLevel}>Case {r.highestLevel}</div>
              </div>
            );
          })}
        </div>
      </Panel>
    </Screen>
  );
}
