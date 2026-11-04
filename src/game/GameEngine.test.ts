import { describe, expect, it, vi } from "vitest";
import { CHARACTERS } from "./characters";
import { GameEngine, type CaseResult } from "./GameEngine";
import { getLevel, LEVEL_COUNT, type LevelConfig } from "./levels";
import { seededRng } from "./testUtils";

const FRAME = 16;

function makeEngine(overrides: Partial<LevelConfig> = {}, seed = 1) {
  const engine = new GameEngine({ ...getLevel(1), ...overrides }, seededRng(seed));
  const finished = vi.fn<(result: CaseResult) => void>();
  engine.on("finished", finished);
  return { engine, finished };
}

/** Runs frames until a character of the wanted type is up, and returns it. */
function waitFor(engine: GameEngine, wantCriminal: boolean) {
  for (let i = 0; i < 20000; i++) {
    const critter = engine.getSnapshot().critters.find((c) => c.state === "active" && CHARACTERS[c.kind].isCriminal === wantCriminal);
    if (critter) return critter;
    engine.update(FRAME);
  }
  throw new Error("character never appeared");
}

describe("timing", () => {
  it("does not run before start, while paused or after finishing", () => {
    const { engine } = makeEngine();
    engine.update(5000);
    expect(engine.getSnapshot().secondsLeft).toBe(40);
    expect(engine.getSnapshot().critters).toHaveLength(0);

    engine.start();
    engine.pause();
    engine.update(5000);
    expect(engine.getSnapshot().secondsLeft).toBe(40);

    engine.resume();
    engine.update(1000);
    expect(engine.getSnapshot().secondsLeft).toBe(39);
  });

  it("loses exactly once when the clock runs out", () => {
    const { engine, finished } = makeEngine({ timeLimitSec: 1 });
    engine.start();
    engine.update(1000);
    engine.update(1000);
    expect(engine.getSnapshot().status).toBe("lost");
    expect(finished).toHaveBeenCalledTimes(1);
    expect(finished.mock.calls[0][0].stars).toBe(0);
  });

  it("ignores negative or empty time steps", () => {
    const { engine } = makeEngine();
    engine.start();
    engine.update(-5000);
    engine.update(0);
    expect(engine.getSnapshot().secondsLeft).toBe(40);
  });
});

describe("tapping", () => {
  it("adds points for criminals and removes them for innocents, never below zero", () => {
    const { engine } = makeEngine({ innocentChance: 0.5, targetScore: 100000 });
    engine.start();

    engine.tap(waitFor(engine, false).id);
    expect(engine.getSnapshot().score).toBe(0);

    const criminal = waitFor(engine, true);
    engine.tap(criminal.id);
    expect(engine.getSnapshot().score).toBe(CHARACTERS[criminal.kind].points);
  });

  it("counts a double tap once", () => {
    const { engine } = makeEngine({ innocentChance: 0, targetScore: 100000 });
    engine.start();
    const critter = waitFor(engine, true);
    engine.tap(critter.id);
    engine.tap(critter.id);
    expect(engine.getSnapshot().score).toBe(CHARACTERS[critter.kind].points);
  });

  it("ignores taps on unknown ids, while paused and after finishing", () => {
    const { engine, finished } = makeEngine({ innocentChance: 0, targetScore: 50 });
    engine.start();
    engine.tap(99999);
    expect(engine.getSnapshot().score).toBe(0);

    const first = waitFor(engine, true);
    engine.pause();
    engine.tap(first.id);
    expect(engine.getSnapshot().score).toBe(0);

    engine.resume();
    engine.tap(first.id);
    expect(engine.getSnapshot().status).toBe("won");

    const scoreAtWin = engine.getSnapshot().score;
    for (const c of engine.getSnapshot().critters) engine.tap(c.id);
    engine.update(100000);
    expect(engine.getSnapshot().score).toBe(scoreAtWin);
    expect(engine.getSnapshot().status).toBe("won");
    expect(finished).toHaveBeenCalledTimes(1);
  });

  it("cannot tap a character that has already escaped", () => {
    const { engine } = makeEngine({ innocentChance: 0, targetScore: 100000, stayMs: 100 });
    engine.start();
    const critter = waitFor(engine, true);
    engine.update(150);
    expect(engine.getSnapshot().critters.find((c) => c.id === critter.id)?.state).toBe("leaving");
    engine.tap(critter.id);
    expect(engine.getSnapshot().score).toBe(0);
  });

  it("wins as soon as the target is reached", () => {
    const { engine, finished } = makeEngine({ innocentChance: 0, disguiseChance: 0, targetScore: 50 });
    engine.start();
    engine.tap(waitFor(engine, true).id);
    expect(finished).toHaveBeenCalledTimes(1);
    expect(finished.mock.calls[0][0]).toMatchObject({ outcome: "won", score: 50 });
    expect(finished.mock.calls[0][0].stars).toBe(3);
  });
});

describe("spawning", () => {
  it("never overlaps two characters in a hole or goes over the limit, on any level", () => {
    for (let level = 1; level <= LEVEL_COUNT; level++) {
      const config = getLevel(level);
      const engine = new GameEngine(config, seededRng(level));
      engine.start();
      while (engine.getSnapshot().status === "running") {
        engine.update(FRAME);
        const { critters } = engine.getSnapshot();
        const slots = critters.map((c) => c.slot);
        expect(new Set(slots).size).toBe(slots.length);
        expect(critters.filter((c) => c.state === "active").length).toBeLessThanOrEqual(config.maxActive);
        for (const slot of slots) expect(slot).toBeLessThan(config.rows * config.cols);
      }
    }
  });

  it("never sends more than three innocent fish in a row", () => {
    const engine = new GameEngine({ ...getLevel(1), innocentChance: 1, timeLimitSec: 60, maxActive: 12, targetScore: 1e9 }, seededRng(3));
    engine.start();
    const seen = new Map<number, string>();
    while (engine.getSnapshot().status === "running") {
      engine.update(FRAME);
      for (const c of engine.getSnapshot().critters) seen.set(c.id, c.kind);
    }
    let streak = 0;
    for (const id of [...seen.keys()].sort((a, b) => a - b)) {
      streak = seen.get(id) === "civilian" ? streak + 1 : 0;
      expect(streak).toBeLessThanOrEqual(3);
    }
    expect(seen.size).toBeGreaterThan(20);
  });

  it("plays out identically for the same seed", () => {
    const play = () => {
      const engine = new GameEngine(getLevel(5), seededRng(42));
      engine.start();
      for (let i = 0; i < 500; i++) engine.update(FRAME);
      return engine.getSnapshot();
    };
    expect(play()).toEqual(play());
  });
});

describe("snapshots", () => {
  it("keeps the same object until something changes, so React doesn't re-render every frame", () => {
    const { engine } = makeEngine({ spawnEveryMs: 100000 });
    engine.start();
    engine.update(FRAME); // first spawn
    const before = engine.getSnapshot();
    engine.update(FRAME);
    expect(engine.getSnapshot()).toBe(before);
  });
});
