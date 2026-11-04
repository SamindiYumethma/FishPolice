import { describe, expect, it } from "vitest";
import { CHARACTERS } from "./characters";
import { GameEngine } from "./GameEngine";
import { getLevel, LEVEL_COUNT, parseLevel } from "./levels";
import { seededRng } from "./testUtils";

const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => getLevel(i + 1));

describe("difficulty curve", () => {
  it("gets harder on every setting the brief asks for", () => {
    for (let i = 1; i < levels.length; i++) {
      const [prev, cur] = [levels[i - 1], levels[i]];
      expect(cur.targetScore).toBeGreaterThan(prev.targetScore);
      expect(cur.timeLimitSec).toBeLessThan(prev.timeLimitSec);
      expect(cur.stayMs).toBeLessThan(prev.stayMs);
      expect(cur.spawnEveryMs).toBeLessThan(prev.spawnEveryMs);
      expect(cur.innocentChance).toBeGreaterThan(prev.innocentChance);
      expect(cur.disguiseChance).toBeGreaterThanOrEqual(prev.disguiseChance);
    }
    expect(levels[0].disguiseChance).toBe(0);
    expect(levels[LEVEL_COUNT - 1].disguiseChance).toBeGreaterThan(0);
  });
});

/**
 * Plays a whole case the way a person would: a character can only be tapped once it has
 * been up for reactionMs, each tap takes tapEveryMs, and some taps hit the wrong one.
 */
function winRate(level: number, skill: { reactionMs: number; tapEveryMs: number; mistakeChance: number }, games = 60) {
  let wins = 0;
  for (let seed = 1; seed <= games; seed++) {
    const engine = new GameEngine(getLevel(level), seededRng(seed * 1000 + level));
    const hand = seededRng(seed);
    const firstSeen = new Map<number, number>();
    let now = 0;
    let readyAt = 0;
    engine.start();
    while (engine.getSnapshot().status === "running") {
      engine.update(16);
      now += 16;
      const up = engine.getSnapshot().critters.filter((c) => c.state === "active");
      for (const c of up) if (!firstSeen.has(c.id)) firstSeen.set(c.id, now);
      if (now < readyAt) continue;
      const seen = up.filter((c) => now - firstSeen.get(c.id)! >= skill.reactionMs);
      const criminal = seen.find((c) => CHARACTERS[c.kind].isCriminal);
      if (!criminal) continue;
      // The mistake is rolled once per tap, not once per frame.
      const innocent = seen.find((c) => !CHARACTERS[c.kind].isCriminal);
      engine.tap((hand() < skill.mistakeChance && innocent ? innocent : criminal).id);
      readyAt = now + skill.tapEveryMs;
    }
    if (engine.getSnapshot().status === "won") wins++;
  }
  return wins / games;
}

const SHARP = { reactionMs: 350, tapEveryMs: 400, mistakeChance: 0.05 };
const CASUAL = { reactionMs: 600, tapEveryMs: 650, mistakeChance: 0.05 };
const SLOW = { reactionMs: 800, tapEveryMs: 900, mistakeChance: 0.1 };

describe("balance (simulated players)", () => {
  it("every case can be beaten by a sharp player", () => {
    for (const { level } of levels) expect(winRate(level, SHARP), `case ${level}`).toBeGreaterThan(0.9);
  });

  it("a casual player can beat the opening cases", () => {
    for (const level of [1, 2, 3]) expect(winRate(level, CASUAL), `case ${level}`).toBeGreaterThan(0.9);
  });

  it("the final case is genuinely hard for a slow player", () => {
    expect(winRate(LEVEL_COUNT, SLOW)).toBeLessThan(0.5);
  });

  it("doing nothing always loses", () => {
    for (const { level } of levels) expect(winRate(level, { reactionMs: 1e9, tapEveryMs: 0, mistakeChance: 0 }, 3)).toBe(0);
  });
});

describe("parseLevel", () => {
  it("accepts whole numbers in range only", () => {
    expect(parseLevel("1")).toBe(1);
    expect(parseLevel(String(LEVEL_COUNT))).toBe(LEVEL_COUNT);
    for (const bad of ["0", "-1", "1.5", "abc", "", "1e1", "999", " 1", String(LEVEL_COUNT + 1)]) expect(parseLevel(bad), bad).toBeNull();
  });
});
