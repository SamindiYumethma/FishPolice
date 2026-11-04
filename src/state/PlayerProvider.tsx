"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GameButton, Loader, Modal, Panel, Sprite } from "../components/ui";
import { LocalPlayerRepository } from "../data/LocalPlayerRepository";
import type { PlayerRepository } from "../data/PlayerRepository";
import { caseLabel } from "../game/levels";
import { failActiveCase, hasProfile, newSave, type PlayerSave } from "../game/player";

interface PlayerContextValue {
  save: PlayerSave;
  /** Applies a rule from game/player.ts to the save and stores the result. */
  apply: (rule: (save: PlayerSave) => PlayerSave) => void;
  /** Charges a life for a case the player walked away from, and tells them why. */
  abandonActiveCase: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

/**
 * Loads the save once and shares it with every screen. Nothing below this renders until
 * the save has loaded, so screens never have to handle "not loaded yet".
 */
export function PlayerProvider({ children, repository }: { children: ReactNode; repository?: PlayerRepository }) {
  const [repo] = useState<PlayerRepository>(() => repository ?? new LocalPlayerRepository());
  const [save, setSave] = useState<PlayerSave | null>(null);
  const [abandoned, setAbandoned] = useState<number | null>(null);
  // Always the latest save, so rules applied one after another build on each other.
  const latest = useRef<PlayerSave | null>(null);

  const apply = useCallback(
    (rule: (save: PlayerSave) => PlayerSave) => {
      if (!latest.current) return;
      const next = rule(latest.current);
      if (next === latest.current) return;
      latest.current = next;
      setSave(next);
      void repo.save(next);
    },
    [repo],
  );

  const abandonActiveCase = useCallback(() => {
    const level = latest.current?.activeCase;
    if (level == null) return;
    apply(failActiveCase);
    setAbandoned(level);
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    void repo.load().then((stored) => {
      if (cancelled) return;
      latest.current = stored ?? newSave();
      setSave(latest.current);
      // Still marked as playing on load: the page was reloaded or closed mid-case.
      // Without this, refreshing would be a free way out of a case that is going badly.
      abandonActiveCase();
    });
    const unsubscribe = repo.subscribe((stored) => {
      latest.current = stored;
      setSave(stored);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repo, abandonActiveCase]);

  const value = useMemo(() => (save ? { save, apply, abandonActiveCase } : null), [save, apply, abandonActiveCase]);

  if (!value) {
    return (
      <div className="center-col">
        <Loader />
      </div>
    );
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {abandoned !== null && (
        <Modal>
          <Panel title="Case Abandoned" titleClass="title-red" width={84} className="pop-in">
            <Sprite name="hero_sad" width={26} />
            <p className="body-text" style={{ margin: 0 }}>
              You left {caseLabel(abandoned)} in the middle of the chase, so it cost a life.
            </p>
            <GameButton color="green" label="OK" width={40} onClick={() => setAbandoned(null)} />
          </Panel>
        </Modal>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}

/** For screens that need a detective: sends anyone without one to the welcome screen. Returns whether to render. */
export function useRequireProfile(): boolean {
  const { save } = usePlayer();
  const router = useRouter();
  const ok = hasProfile(save);
  useEffect(() => {
    if (!ok) router.replace("/welcome");
  }, [ok, router]);
  return ok;
}
