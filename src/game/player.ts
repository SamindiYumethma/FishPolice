import type { AssetName } from "../lib/assets";
import { LEVEL_COUNT } from "./levels";
import { MAX_REBIRTHS } from "./rebirth";

export const MAX_LIVES = 3;
export const NAME_MIN = 3;
export const NAME_MAX = 16;

export const AVATARS = ["orange", "blue", "pink", "green"] as const;
export type Avatar = (typeof AVATARS)[number];

export function avatarAsset(avatar: Avatar): AssetName {
  return `avatar_${avatar}` as AssetName;
}

/** Everything saved about a player. Each rule below takes a save and returns a new one. */
export interface PlayerSave {
  version: 1;
  /** Empty until the player has set up their detective. */
  name: string;
  avatar: Avatar;
  lives: number;
  highestUnlocked: number;
  /** Stars per solved case in this run. A case is solved once it has an entry here. */
  stars: Record<number, number>;
  /** Best score per solved case in this run. */
  caseScores: Record<number, number>;
  highScore: number;
  /** The case being played right now. Still set on load means the player left mid-case. */
  activeCase: number | null;
  /** Rebirth Challenges started in this run, whatever their result. */
  rebirthsUsed: number;
  /** The case that was just failed, while its one Rebirth Challenge is still on offer. */
  rebirthOffer: number | null;
}

export function newSave(): PlayerSave {
  return {
    version: 1,
    name: "",
    avatar: "orange",
    lives: MAX_LIVES,
    highestUnlocked: 1,
    stars: {},
    caseScores: {},
    highScore: 0,
    activeCase: null,
    rebirthsUsed: 0,
    rebirthOffer: null,
  };
}

/** Only each case's best score counts, so replaying an easy case can't farm points. */
export function runScore(save: PlayerSave): number {
  return Object.values(save.caseScores).reduce((sum, score) => sum + score, 0);
}

export function casesSolved(save: PlayerSave): number {
  return Object.keys(save.stars).length;
}

export function isSolved(save: PlayerSave, level: number): boolean {
  return save.stars[level] !== undefined;
}

export function hasProfile(save: PlayerSave): boolean {
  return save.name !== "";
}

export function canPlay(save: PlayerSave, level: number): boolean {
  return save.lives > 0 && level >= 1 && level <= save.highestUnlocked;
}

export function beginCase(save: PlayerSave, level: number): PlayerSave {
  return canPlay(save, level) ? { ...save, activeCase: level, rebirthOffer: null } : save;
}

export function winCase(save: PlayerSave, level: number, score: number, stars: number): PlayerSave {
  const next: PlayerSave = {
    ...save,
    activeCase: null,
    highestUnlocked: Math.max(save.highestUnlocked, Math.min(LEVEL_COUNT, level + 1)),
    stars: { ...save.stars, [level]: Math.max(save.stars[level] ?? 0, stars) },
    caseScores: { ...save.caseScores, [level]: Math.max(save.caseScores[level] ?? 0, score) },
  };
  return { ...next, highScore: Math.max(save.highScore, runScore(next)) };
}

/** Costs a life for the case in progress. With no case in progress it changes nothing, so a life can't be lost twice. */
export function failActiveCase(save: PlayerSave): PlayerSave {
  if (save.activeCase === null) return save;
  return { ...save, activeCase: null, lives: Math.max(0, save.lives - 1) };
}

/** Offers the one Rebirth Challenge for a case that was just failed, if the run has any left. */
export function offerRebirth(save: PlayerSave, level: number): PlayerSave {
  return save.rebirthsUsed < MAX_REBIRTHS ? { ...save, rebirthOffer: level } : save;
}

export function declineRebirth(save: PlayerSave): PlayerSave {
  return { ...save, rebirthOffer: null };
}

/** Uses up the chance the moment the photo arrives, so refreshing can't swap a hard photo for a new one. */
export function spendRebirth(save: PlayerSave): PlayerSave {
  if (save.rebirthOffer === null) return save;
  return { ...save, rebirthOffer: null, rebirthsUsed: save.rebirthsUsed + 1 };
}

export function winRebirth(save: PlayerSave): PlayerSave {
  return { ...save, lives: Math.min(MAX_LIVES, save.lives + 1) };
}

/** Starts again from Case 1 after a game over, keeping the detective and the best score. */
export function startNewRun(save: PlayerSave): PlayerSave {
  return { ...newSave(), name: save.name, avatar: save.avatar, highScore: save.highScore };
}

export function setProfile(save: PlayerSave, name: string, avatar: Avatar): PlayerSave {
  return { ...save, name: name.trim(), avatar };
}

/** Returns what is wrong with a detective name, or null if it is fine. */
export function nameError(raw: string): string | null {
  const name = raw.trim();
  if (name.length < NAME_MIN) return `Use at least ${NAME_MIN} characters.`;
  if (name.length > NAME_MAX) return `Use at most ${NAME_MAX} characters.`;
  if (!/^[\p{L}\p{M}\p{N} _-]+$/u.test(name)) return "Use letters, numbers, spaces, - and _ only.";
  return null;
}

/**
 * Turns stored data back into a save. Storage can hold anything (old versions, manual
 * edits), so damaged data gives null and out-of-range numbers are pulled back in range.
 */
export function parseSave(data: unknown): PlayerSave | null {
  if (typeof data !== "object" || data === null) return null;
  const raw = data as Record<string, unknown>;
  if (raw.version !== 1) return null;

  const fresh = newSave();
  return {
    version: 1,
    name: typeof raw.name === "string" && nameError(raw.name) === null ? raw.name.trim() : "",
    avatar: AVATARS.includes(raw.avatar as Avatar) ? (raw.avatar as Avatar) : fresh.avatar,
    lives: wholeNumber(raw.lives, 0, MAX_LIVES, fresh.lives),
    highestUnlocked: wholeNumber(raw.highestUnlocked, 1, LEVEL_COUNT, fresh.highestUnlocked),
    stars: levelMap(raw.stars, 1, 3),
    caseScores: levelMap(raw.caseScores, 0, Number.MAX_SAFE_INTEGER),
    highScore: wholeNumber(raw.highScore, 0, Number.MAX_SAFE_INTEGER, 0),
    activeCase: typeof raw.activeCase === "number" ? wholeNumber(raw.activeCase, 1, LEVEL_COUNT, 1) : null,
    rebirthsUsed: wholeNumber(raw.rebirthsUsed, 0, MAX_REBIRTHS, 0),
    rebirthOffer: typeof raw.rebirthOffer === "number" ? wholeNumber(raw.rebirthOffer, 1, LEVEL_COUNT, 1) : null,
  };
}

function wholeNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function levelMap(value: unknown, min: number, max: number): Record<number, number> {
  const out: Record<number, number> = {};
  if (typeof value !== "object" || value === null) return out;
  for (const [key, entry] of Object.entries(value)) {
    const level = Number(key);
    if (Number.isInteger(level) && level >= 1 && level <= LEVEL_COUNT && typeof entry === "number" && Number.isFinite(entry)) {
      out[level] = wholeNumber(entry, min, max, min);
    }
  }
  return out;
}
