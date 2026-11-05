"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { declineRebirth, spendRebirth, winRebirth } from "../game/player";
import { MAX_REBIRTHS, rebirthTimeLimit, type RebirthAnswerResponse, type RebirthStartResponse } from "../game/rebirth";
import { assetUrl } from "../lib/assets";
import { GameButton, Panel, Sprite } from "../components/ui";
import { usePlayer } from "../state/PlayerProvider";
import { LifeRecovered, RebirthFailed } from "./PhaseScreens";
import { RebirthChallenge, type PlayerAnswer } from "./RebirthChallenge";
import { requestChallenge } from "./rebirthClient";
import s from "./play.module.css";

type Phase =
  | { name: "intro"; loading: boolean; failed: boolean }
  | { name: "challenge"; challenge: RebirthStartResponse; attempt: number }
  | { name: "result"; result: RebirthAnswerResponse; answer: PlayerAnswer };

/** The Rebirth Challenge from start to finish: intro → one photo and answer → result. */
export function RebirthFlow() {
  const router = useRouter();
  const { save, apply } = usePlayer();
  const [phase, setPhase] = useState<Phase>({ name: "intro", loading: false, failed: false });
  // Remembered from arrival, because starting the challenge clears the offer from the save.
  const [level] = useState(save.rebirthOffer);
  const pending = useRef<AbortController | null>(null);

  // Nothing on offer (a typed-in URL, or a refresh after the chance was spent): nothing to do here.
  useEffect(() => {
    if (level === null) router.replace(save.lives > 0 ? "/cases" : "/game-over");
    return () => pending.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    const attempt = save.rebirthsUsed;
    const controller = new AbortController();
    pending.current = controller;
    setPhase({ name: "intro", loading: true, failed: false });
    try {
      const challenge = await requestChallenge(attempt, controller);
      // Only spent once a photo has arrived, so an API outage doesn't cost the player their chance.
      apply(spendRebirth);
      setPhase({ name: "challenge", challenge, attempt });
    } catch {
      setPhase({ name: "intro", loading: false, failed: true });
    }
  };

  const onResult = useCallback(
    (result: RebirthAnswerResponse, answer: PlayerAnswer) => {
      if (result.correct) apply(winRebirth);
      setPhase({ name: "result", result, answer });
    },
    [apply],
  );

  if (level === null) return null;

  const backToCase = () => router.replace(`/play/${level}`);

  if (phase.name === "challenge") {
    return <RebirthChallenge challenge={phase.challenge} attempt={phase.attempt} onResult={onResult} />;
  }

  if (phase.name === "result") {
    if (phase.result.correct) return <LifeRecovered lives={save.lives} rebirthsLeft={MAX_REBIRTHS - save.rebirthsUsed} onContinue={backToCase} />;
    return (
      <RebirthFailed
        result={phase.result}
        answer={phase.answer}
        rebirthsLeft={MAX_REBIRTHS - save.rebirthsUsed}
        nextTimeLimit={rebirthTimeLimit(save.rebirthsUsed)}
        onContinue={save.lives > 0 ? backToCase : () => router.replace("/game-over")}
      />
    );
  }

  return (
    <div className={s.phase} style={{ backgroundImage: `url(${assetUrl("bg_rebirth_challenge")})` }}>
      <Panel title="Rebirth Challenge" className="pop-in">
        <Sprite name="rebirth_heart" width={34} className="float" />
        <p className="body-text" style={{ margin: 0 }}>
          Count the fish and treasure chests in the photo to win your life back.
        </p>
        <div className={s.chips}>
          <span className={s.chip}>
            <Sprite name="icon_stopwatch" /> {rebirthTimeLimit(save.rebirthsUsed)} sec
          </span>
          <span className={s.chip}>
            <Sprite name="rebirth_heart" /> {save.rebirthsUsed + 1} of {MAX_REBIRTHS}
          </span>
        </div>
        <p className={s.smallNote}>One photo, one answer, and the clock won&apos;t stop. Each rebirth gives you less time and a busier photo.</p>
        {phase.failed && (
          <p className={s.smallNote} role="alert" style={{ color: "var(--red-dark)" }}>
            The photo didn&apos;t arrive. You haven&apos;t lost your chance, so try again.
          </p>
        )}
        <GameButton asset="btn_earn_it_back" label={phase.failed ? "Try again" : "Earn it back"} width={56} onClick={() => void start()} loading={phase.loading} />
        <GameButton
          asset="btn_give_up"
          label="Give up"
          width={40}
          disabled={phase.loading}
          onClick={() => {
            apply(declineRebirth);
            router.replace(save.lives > 0 ? "/cases" : "/game-over");
          }}
        />
      </Panel>
    </div>
  );
}
