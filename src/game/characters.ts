import type { AssetName } from "../lib/assets";

export type Kind = "crab" | "octopus" | "civilian";

export interface Character {
  name: string;
  /** One is picked at random each time the character appears. */
  skins: readonly AssetName[];
  /** Shown while being arrested, when the art has its own arrested pose. */
  arrestedSkin?: AssetName;
  tip: string;
  /** Positive for an arrest, negative for a penalty. */
  points: number;
  isCriminal: boolean;
}

export const CHARACTERS: Record<Kind, Character> = {
  crab: {
    name: "Crab Crook",
    skins: ["crab_crook"],
    arrestedSkin: "crab_crook_arrested",
    tip: "Tap the masked crab crooks to arrest them!",
    points: 50,
    isCriminal: true,
  },
  octopus: {
    name: "Disguised Octopus",
    skins: ["octopus_disguised"],
    tip: "Master of disguise! Look for the purple tentacles.",
    points: 80,
    isCriminal: true,
  },
  civilian: {
    name: "Innocent Fish",
    skins: ["civilian_fish_blue", "civilian_fish_green", "civilian_fish_pink", "civilian_fish_yellow"],
    tip: "Never arrest innocent fish. It costs points!",
    points: -40,
    isCriminal: false,
  },
};

export function pointsLabel(points: number): string {
  return points > 0 ? `+${points}` : `−${Math.abs(points)}`;
}
