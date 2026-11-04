import type { Kind } from "./characters";

export const LEVEL_COUNT = 10;
/** The first case where disguised criminals appear. */
const FIRST_DISGUISE_LEVEL = 3;

export interface LevelConfig {
  level: number;
  title: string;
  tagline: string;
  targetScore: number;
  timeLimitSec: number;
  /** Average gap between new characters appearing. */
  spawnEveryMs: number;
  /** How long a character stays up before it escapes. */
  stayMs: number;
  /** The most characters that can be up at the same time. */
  maxActive: number;
  /** Chance (0-1) that a new character is an innocent fish. */
  innocentChance: number;
  /** Chance (0-1) that a new criminal is a disguised one. */
  disguiseChance: number;
  rows: number;
  cols: number;
  /** Characters to introduce on the briefing card. */
  newKinds: readonly Kind[];
}

const STORY: readonly (readonly [title: string, tagline: string])[] = [
  ["The Crab Caper", "Arrest the gang!"],
  ["Shell Game", "The crooks are getting bolder."],
  ["Masked Intruder", "Someone's hiding behind a fish mask..."],
  ["Deep Cover", "More disguises than ever."],
  ["Fast Fins", "These suspects don't hang around."],
  ["Coral Conspiracy", "The gang is hiding among civilians."],
  ["Current Affairs", "Everything moves faster down here."],
  ["Sunken Ship", "The wreck is crawling with crooks."],
  ["Riptide", "Blink and they're gone."],
  ["The Treasure Heist", "One last chest. Crack the case!"],
];

/** Builds a case from its number. Every difficulty setting gets harder as the level rises. */
export function getLevel(level: number): LevelConfig {
  const step = Math.min(LEVEL_COUNT, Math.max(1, Math.floor(level) || 1)) - 1;
  const [title, tagline] = STORY[step];
  const number = step + 1;
  return {
    level: number,
    title,
    tagline,
    // Tuned with the simulated players in levels.test.ts.
    targetScore: 500 + step * 85,
    timeLimitSec: 40 - step * 2,
    spawnEveryMs: 850 - step * 45,
    stayMs: 1700 - step * 90,
    maxActive: 2 + Math.ceil(step / 3),
    innocentChance: 0.2 + step * 0.035,
    disguiseChance: number < FIRST_DISGUISE_LEVEL ? 0 : 0.15 + (number - FIRST_DISGUISE_LEVEL) * 0.05,
    rows: number <= 5 ? 3 : 4,
    cols: 3,
    newKinds: number === 1 ? ["crab", "civilian"] : number === FIRST_DISGUISE_LEVEL ? ["octopus"] : [],
  };
}

export function caseLabel(level: number): string {
  return `Case #${String(level).padStart(2, "0")}`;
}

/** Reads a level from a URL segment. Anything but a whole number in range gives null. */
export function parseLevel(raw: string): number | null {
  if (!/^\d{1,3}$/.test(raw)) return null;
  const level = Number(raw);
  return level >= 1 && level <= LEVEL_COUNT ? level : null;
}

/** Stars for a solved case: the more of the clock is left, the better. */
export function starsFor(timeLeftMs: number, timeLimitSec: number): number {
  const fractionLeft = timeLeftMs / (timeLimitSec * 1000);
  return fractionLeft >= 0.4 ? 3 : fractionLeft >= 0.15 ? 2 : 1;
}
