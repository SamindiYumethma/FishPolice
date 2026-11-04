import type { AssetName } from "../lib/assets";
import { CHARACTERS, type Kind } from "./characters";
import { TypedEmitter } from "./events";
import { starsFor, type LevelConfig } from "./levels";

export type EngineStatus = "idle" | "running" | "paused" | "won" | "lost";
export type CritterState = "active" | "leaving" | "arrested" | "mistake";

export interface Critter {
  id: number;
  kind: Kind;
  skin: AssetName;
  slot: number;
  state: CritterState;
}

export interface EngineSnapshot {
  status: EngineStatus;
  score: number;
  secondsLeft: number;
  critters: readonly Critter[];
}

export interface CaseResult {
  outcome: "won" | "lost";
  score: number;
  targetScore: number;
  timeLeftMs: number;
  /** 0 when the case was lost. */
  stars: number;
}

export type GameEvents = {
  /** Something on screen changed: read getSnapshot() again. */
  change: undefined;
  /** A character was tapped. */
  scored: { critter: Critter; points: number; score: number };
  /** The case ended. Fires exactly once. */
  finished: CaseResult;
};

/** How long a character stays in its hole while each exit animation plays. Matches play.module.css. */
const EXIT_MS = { leaving: 220, arrested: 520, mistake: 520 } as const;
/** How soon to try again when the board has no room for a new character. */
const SPAWN_RETRY_MS = 100;
/** After this many innocent fish in a row the next one must be a criminal, so bad luck can't sink a case. */
const MAX_INNOCENT_STREAK = 3;

/**
 * The rules of a single case, with no React or browser code. Time only moves when
 * update(dt) is called and randomness is passed in, so tests can play whole cases
 * instantly and repeatably.
 */
export class GameEngine extends TypedEmitter<GameEvents> {
  private status: EngineStatus = "idle";
  private score = 0;
  private timeLeftMs: number;
  private secondsLeft: number;
  private spawnTimerMs = 0;
  private live: (Critter & { msLeft: number })[] = [];
  private nextId = 1;
  private lastSlot = -1;
  private innocentStreak = 0;
  private snapshot!: EngineSnapshot;

  constructor(
    readonly level: LevelConfig,
    private readonly rng: () => number = Math.random,
  ) {
    super();
    this.timeLeftMs = level.timeLimitSec * 1000;
    this.secondsLeft = level.timeLimitSec;
    this.buildSnapshot();
  }

  /* Arrow functions so React's useSyncExternalStore can be handed them directly. */
  subscribe = (listener: () => void): (() => void) => this.on("change", listener);
  getSnapshot = (): EngineSnapshot => this.snapshot;

  start(): void {
    if (this.status !== "idle") return;
    this.status = "running";
    this.notify();
  }

  pause(): void {
    if (this.status !== "running") return;
    this.status = "paused";
    this.notify();
  }

  resume(): void {
    if (this.status !== "paused") return;
    this.status = "running";
    this.notify();
  }

  /** Moves the case forward by dtMs. Does nothing unless it is running. */
  update(dtMs: number): void {
    if (this.status !== "running" || dtMs <= 0) return;
    let changed = false;

    this.timeLeftMs = Math.max(0, this.timeLeftMs - dtMs);
    const seconds = Math.ceil(this.timeLeftMs / 1000);
    if (seconds !== this.secondsLeft) {
      this.secondsLeft = seconds;
      changed = true;
    }

    for (const critter of this.live) {
      critter.msLeft -= dtMs;
      if (critter.msLeft <= 0 && critter.state === "active") {
        critter.state = "leaving";
        critter.msLeft = EXIT_MS.leaving;
        changed = true;
      }
    }
    const before = this.live.length;
    this.live = this.live.filter((critter) => critter.msLeft > 0);
    if (this.live.length !== before) changed = true;

    this.spawnTimerMs -= dtMs;
    if (this.spawnTimerMs <= 0) {
      if (this.spawn()) {
        // ±25% so the rhythm can't be memorised.
        this.spawnTimerMs = this.level.spawnEveryMs * (0.75 + this.rng() * 0.5);
        changed = true;
      } else {
        this.spawnTimerMs = SPAWN_RETRY_MS;
      }
    }

    if (this.timeLeftMs === 0) this.finish("lost");
    else if (changed) this.notify();
  }

  /** Handles a tap. Taps on anything that isn't up and active, or outside play, are ignored. */
  tap(id: number): void {
    if (this.status !== "running") return;
    const critter = this.live.find((c) => c.id === id);
    if (!critter || critter.state !== "active") return;

    const { points, isCriminal, arrestedSkin } = CHARACTERS[critter.kind];
    this.score = Math.max(0, this.score + points);
    critter.state = isCriminal ? "arrested" : "mistake";
    critter.msLeft = EXIT_MS[critter.state];
    if (isCriminal && arrestedSkin) critter.skin = arrestedSkin;

    this.emit("scored", { critter: toPublic(critter), points, score: this.score });

    if (this.score >= this.level.targetScore) this.finish("won");
    else this.notify();
  }

  private spawn(): boolean {
    const active = this.live.filter((c) => c.state === "active").length;
    if (active >= this.level.maxActive) return false;

    const taken = new Set(this.live.map((c) => c.slot));
    const free: number[] = [];
    for (let slot = 0; slot < this.level.rows * this.level.cols; slot++) if (!taken.has(slot)) free.push(slot);
    if (free.length === 0) return false;

    // Avoid the hole that was just used whenever there is another choice.
    const choices = free.length > 1 ? free.filter((slot) => slot !== this.lastSlot) : free;
    const slot = this.pick(choices);
    const kind = this.pickKind();
    this.lastSlot = slot;
    this.live.push({
      id: this.nextId++,
      kind,
      skin: this.pick(CHARACTERS[kind].skins),
      slot,
      state: "active",
      msLeft: this.level.stayMs,
    });
    return true;
  }

  private pickKind(): Kind {
    const innocent = this.innocentStreak < MAX_INNOCENT_STREAK && this.rng() < this.level.innocentChance;
    if (innocent) {
      this.innocentStreak++;
      return "civilian";
    }
    this.innocentStreak = 0;
    return this.rng() < this.level.disguiseChance ? "octopus" : "crab";
  }

  private pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.rng() * items.length)];
  }

  private finish(outcome: "won" | "lost"): void {
    this.status = outcome;
    this.notify();
    this.emit("finished", {
      outcome,
      score: this.score,
      targetScore: this.level.targetScore,
      timeLeftMs: this.timeLeftMs,
      stars: outcome === "won" ? starsFor(this.timeLeftMs, this.level.timeLimitSec) : 0,
    });
  }

  private notify(): void {
    this.buildSnapshot();
    this.emit("change", undefined);
  }

  /* React compares snapshots by identity, so a new object is only made when something changed. */
  private buildSnapshot(): void {
    this.snapshot = {
      status: this.status,
      score: this.score,
      secondsLeft: this.secondsLeft,
      critters: this.live.map(toPublic),
    };
  }
}

function toPublic({ id, kind, skin, slot, state }: Critter): Critter {
  return { id, kind, skin, slot, state };
}
