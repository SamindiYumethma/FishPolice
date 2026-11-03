/**
 * Static sample data so every screen has something to show.
 * Nothing here is saved or calculated — it is only for the UI demo.
 */
import type { AssetName } from "./assets";

export const MAX_LIVES = 3;
export const MAX_REBIRTHS = 3;
export const NAME_MAX = 16;
export const LEVEL_COUNT = 20;
export const BOSS_EVERY = 5;
/** Only this case is built; every other case stays locked. */
export const PLAYABLE_LEVEL = 1;
export const REBIRTH_TIME_LIMITS = [30, 22, 15];

export const AVATARS = ["orange", "blue", "pink", "green"] as const;
export type Avatar = (typeof AVATARS)[number];

export function avatarAsset(a: Avatar): AssetName {
  return `avatar_${a}` as AssetName;
}

export function caseLabel(level: number): string {
  return `Case #${String(level).padStart(2, "0")}`;
}

/** The pretend player shown across the menu, map and profile screens. */
export const DEMO_PLAYER = {
  detectiveName: "DetectiveSam",
  email: "detective@example.com",
  avatar: "orange" as Avatar,
  rank: "Officer",
  xp: 640,
  coins: 1250,
  lives: 2,
  runScore: 2350,
  highScore: 4820,
  pearls: 2,
  gems: 1,
  highestUnlocked: 1,
  /** Stars earned per cleared case. */
  stars: {} as Record<number, number>,
};

export type Kind = "crab" | "octopus" | "squid" | "shark" | "civilian" | "puffer" | "bomb" | "badge";

export const CHARACTERS: Record<Kind, { name: string; asset: AssetName; tip: string; effect: string; good: boolean }> = {
  crab: { name: "Crab Crook", asset: "crab_crook", tip: "Tap the masked crab crooks to arrest them!", effect: "+50", good: true },
  octopus: { name: "Disguised Octopus", asset: "octopus_disguised", tip: "Master of disguise! Look for the purple tentacles.", effect: "+80", good: true },
  squid: { name: "Squid Smuggler", asset: "squid", tip: "Catch it fast or it sprays ink across the reef!", effect: "+70", good: true },
  shark: { name: "Shark Boss", asset: "shark_boss", tip: "The gang leader! It takes two taps to cuff.", effect: "+150 · 2 taps", good: true },
  civilian: { name: "Innocent Fish", asset: "civilian_fish_blue", tip: "Never arrest innocent fish — it costs points.", effect: "−40", good: false },
  bomb: { name: "Sea Mine", asset: "bomb", tip: "Don't touch the sea mines!", effect: "−50 · −3s", good: false },
  puffer: { name: "Grumpy Pufferfish", asset: "pufferfish", tip: "Ouch, spiky! Costs points and 2 seconds.", effect: "−30 · −2s", good: false },
  badge: { name: "Golden Badge", asset: "golden_badge_powerup", tip: "Double points for a few seconds!", effect: "2× points", good: true },
};

const TITLES: [string, string][] = [
  ["The Crab Caper", "Arrest the gang!"],
  ["Shell Game", "The crooks are getting bolder."],
  ["Masked Intruder", "Someone's hiding behind a fish mask..."],
  ["Mine Field", "Watch out for sea mines!"],
  ["Boss of the Bay", "The Shark Boss's crew is on the move!"],
  ["Ink & Run", "Squids are smuggling the loot."],
  ["Prickly Situation", "Grumpy pufferfish in the area."],
  ["Fast Fins", "Suspects are swimming across the reef!"],
  ["Coral Conspiracy", "The gang is hiding among civilians."],
  ["Kelp Cartel", "Big boss, big haul. Stay sharp."],
  ["Deep Cover", "More disguises than ever."],
  ["Current Affairs", "Everything moves faster down here."],
  ["Sunken Ship", "The wreck is crawling with crooks."],
  ["Pearl Diver", "Protect the reef's rarest pearls."],
  ["Jaws of Justice", "The Shark Boss returns!"],
  ["Night Shift", "The crowd is getting thicker."],
  ["Riptide", "Blink and they're gone."],
  ["Lost Lagoon", "Only the best detectives get this far."],
  ["Final Clue", "One step from cracking the heist."],
  ["The Treasure Heist", "Take down the Shark Boss for good!"],
];

const INTRODUCED: Record<number, Kind[]> = {
  1: ["crab", "civilian"],
  2: ["badge"],
  3: ["octopus"],
  4: ["bomb"],
  5: ["shark"],
  6: ["squid"],
  7: ["puffer"],
};

export interface DemoCase {
  level: number;
  title: string;
  tagline: string;
  target: number;
  timeLimit: number;
  isBoss: boolean;
  newKinds: Kind[];
  featured: Kind;
}

/** Display info for the case briefing card (fixed sample numbers). */
export function demoCase(level: number): DemoCase {
  const lv = Math.min(LEVEL_COUNT, Math.max(1, Math.floor(level) || 1));
  const [title, tagline] = TITLES[lv - 1];
  const isBoss = lv % BOSS_EVERY === 0;
  const newKinds = INTRODUCED[lv] ?? [];
  const featured: Kind = isBoss ? "shark" : newKinds.includes("octopus") ? "octopus" : newKinds.includes("squid") ? "squid" : "crab";
  return {
    level: lv,
    title,
    tagline,
    target: 500 + (lv - 1) * 100,
    timeLimit: 30 - Math.floor((lv - 1) / 3),
    isBoss,
    newKinds,
    featured,
  };
}

export const DEMO_LEADERBOARD: { name: string; avatar: Avatar; highScore: number; highestLevel: number; me?: boolean }[] = [
  { name: "CaptainCoral", avatar: "blue", highScore: 18450, highestLevel: 20 },
  { name: "ReefRanger", avatar: "green", highScore: 15200, highestLevel: 17 },
  { name: "InspectorFin", avatar: "pink", highScore: 12980, highestLevel: 15 },
  { name: "BubbleCop", avatar: "orange", highScore: 9870, highestLevel: 12 },
  { name: "KelpSleuth", avatar: "green", highScore: 7650, highestLevel: 10 },
  { name: "DetectiveSam", avatar: "orange", highScore: 4820, highestLevel: 4, me: true },
  { name: "TidalTracker", avatar: "blue", highScore: 3900, highestLevel: 4 },
  { name: "PearlHunter", avatar: "pink", highScore: 2410, highestLevel: 3 },
];
