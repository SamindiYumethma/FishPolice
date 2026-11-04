import { describe, expect, it } from "vitest";
import { LEVEL_COUNT } from "./levels";
import { beginCase, canPlay, failActiveCase, MAX_LIVES, nameError, newSave, parseSave, runScore, startNewRun, winCase } from "./player";

describe("lives", () => {
  it("costs one life per failed case and can't be charged twice", () => {
    const playing = beginCase(newSave(), 1);
    const failed = failActiveCase(playing);
    expect(failed.lives).toBe(MAX_LIVES - 1);
    expect(failActiveCase(failed)).toEqual(failed);
  });

  it("does not go below zero and blocks play at zero", () => {
    let save = newSave();
    for (let i = 0; i < MAX_LIVES + 2; i++) save = failActiveCase(beginCase(save, 1));
    expect(save.lives).toBe(0);
    expect(canPlay(save, 1)).toBe(false);
    expect(beginCase(save, 1).activeCase).toBeNull();
  });
});

describe("progress", () => {
  it("blocks locked cases", () => {
    expect(canPlay(newSave(), 2)).toBe(false);
    expect(beginCase(newSave(), 2).activeCase).toBeNull();
  });

  it("unlocks the next case on a win, without going past the last one", () => {
    const won = winCase(beginCase(newSave(), 1), 1, 500, 2);
    expect(won.highestUnlocked).toBe(2);
    expect(won.activeCase).toBeNull();
    expect(winCase({ ...newSave(), highestUnlocked: LEVEL_COUNT }, LEVEL_COUNT, 900, 1).highestUnlocked).toBe(LEVEL_COUNT);
  });

  it("replaying a case can't farm points or lower a record", () => {
    let save = winCase(newSave(), 1, 500, 3);
    save = winCase(save, 2, 600, 1);
    save = winCase(save, 1, 450, 1);
    expect(runScore(save)).toBe(1100);
    expect(save.stars[1]).toBe(3);
    save = winCase(save, 1, 700, 1);
    expect(runScore(save)).toBe(1300);
    expect(save.highScore).toBe(1300);
    expect(save.highestUnlocked).toBe(3);
  });

  it("a new run resets progress but keeps the detective and high score", () => {
    const old = { ...winCase(newSave(), 1, 500, 3), name: "Sam", avatar: "pink" as const, lives: 0 };
    const run = startNewRun(old);
    expect(run).toMatchObject({ name: "Sam", avatar: "pink", lives: MAX_LIVES, highestUnlocked: 1, highScore: 500, stars: {}, caseScores: {} });
  });
});

describe("nameError", () => {
  it("accepts sensible names and rejects the rest", () => {
    for (const ok of ["Sam", "Detective_99", "  Sam  ", "Inspector Fin", "සමින්දි"]) expect(nameError(ok), ok).toBeNull();
    for (const bad of ["", "  ", "ab", "x".repeat(17), "<script>", "a/b"]) expect(nameError(bad), bad).not.toBeNull();
  });
});

describe("parseSave", () => {
  it("round-trips a real save through JSON", () => {
    const save = { ...winCase(newSave(), 1, 500, 3), name: "Sam" };
    expect(parseSave(JSON.parse(JSON.stringify(save)))).toEqual(save);
  });

  it("rejects things that aren't a save", () => {
    for (const bad of [null, undefined, 5, "x", [], {}, { version: 2 }]) expect(parseSave(bad)).toBeNull();
  });

  it("pulls damaged or hand-edited values back in range", () => {
    const parsed = parseSave({
      version: 1,
      name: "<b>",
      avatar: "rainbow",
      lives: 999,
      highestUnlocked: 999,
      stars: { 1: 99, 999: 3, nope: 3, 2: "x" },
      caseScores: { 1: -5 },
      highScore: "lots",
      activeCase: 999,
    })!;
    expect(parsed).toMatchObject({ name: "", avatar: "orange", lives: MAX_LIVES, highestUnlocked: LEVEL_COUNT, stars: { 1: 3 }, caseScores: { 1: 0 }, highScore: 0 });
    expect(parsed.activeCase).toBe(LEVEL_COUNT);
  });
});
