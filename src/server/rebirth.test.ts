import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as answerRoute } from "../app/api/rebirth/answer/route";
import { POST as startRoute } from "../app/api/rebirth/start/route";
import { rebirthPhotoSamples, rebirthTimeLimit } from "../game/rebirth";
import { openChallenge, sealChallenge } from "./challengeToken";
import { fetchBusiestPuzzle, FishApiError, parsePuzzle } from "./fishApi";
import { allowRequest } from "./rateLimit";
import { checkAnswer, startChallenge } from "./rebirthService";

const PNG = "iVBORw0KGgoAAAANS";
const apiBody = (fish: number, chest: number) => JSON.stringify({ question: PNG, fish, chest });
const challenge = (over = {}) => ({ id: crypto.randomUUID(), fish: 4, chest: 7, expiresAt: Date.now() + 60000, ...over });
const jsonRequest = (body: unknown, ip = crypto.randomUUID()) =>
  new Request("http://test/api", { method: "POST", headers: { "x-forwarded-for": ip }, body: typeof body === "string" ? body : JSON.stringify(body) });

/** Replaces the real Fish API with a list of responses. */
function stubApi(...bodies: (string | Error)[]) {
  const mock = vi.fn(async () => {
    const next = bodies.shift() ?? new Error("no more responses");
    if (next instanceof Error) throw next;
    return new Response(next, { headers: { "Content-Type": "text/html" } });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("difficulty", () => {
  it("gives less time and a busier photo on each attempt", () => {
    expect([0, 1, 2].map(rebirthTimeLimit)).toEqual([20, 15, 10]);
    expect([0, 1, 2].map(rebirthPhotoSamples)).toEqual([1, 2, 4]);
  });
});

describe("Fish API response", () => {
  it("accepts a real-looking response, including counts of zero", () => {
    expect(parsePuzzle(apiBody(0, 8))).toEqual({ imageBase64: PNG, fish: 0, chest: 8 });
  });

  it("rejects anything else", () => {
    const bad = ["<html>error</html>", "", "null", "[]", '{"fish":1,"chest":1}', JSON.stringify({ question: "https://x/a.png", fish: 1, chest: 1 }), JSON.stringify({ question: PNG, fish: -1, chest: 1 }), JSON.stringify({ question: PNG, fish: 1.5, chest: 1 }), JSON.stringify({ question: PNG, fish: "1", chest: 1 })];
    for (const text of bad) expect(() => parsePuzzle(text), text).toThrow(FishApiError);
  });

  it("keeps the busiest photo and survives some requests failing", async () => {
    stubApi(apiBody(1, 1), new Error("down"), apiBody(9, 4), "<html>");
    expect(await fetchBusiestPuzzle(4)).toMatchObject({ fish: 9, chest: 4 });
  });

  it("fails only when no photo arrives", async () => {
    stubApi(new Error("down"), new Error("down"));
    await expect(fetchBusiestPuzzle(2)).rejects.toThrow(FishApiError);
  });
});

describe("challenge token", () => {
  it("opens with the same data it was sealed with", () => {
    const data = challenge();
    expect(openChallenge(sealChallenge(data))).toEqual(data);
  });

  it("does not show the answers to whoever holds it", () => {
    const token = sealChallenge(challenge({ fish: 4242, chest: 9797 }));
    const decoded = token.split(".").map((part) => Buffer.from(part, "base64url").toString("latin1")).join("");
    expect(token).not.toMatch(/4242|9797|fish|chest/);
    expect(decoded).not.toMatch(/4242|9797|fish|chest/);
  });

  it("rejects damaged or edited tokens", () => {
    const token = sealChallenge(challenge());
    const [iv, tag, data] = token.split(".");
    const flipped = (data[0] === "A" ? "B" : "A") + data.slice(1);
    for (const bad of ["", "nope", "a.b", "a.b.c", `${iv}.${tag}.${flipped}`, `${iv}.${tag}`, `${token}.extra`]) expect(openChallenge(bad), bad).toBeNull();
  });
});

describe("checking an answer", () => {
  it("is correct only when both numbers match", () => {
    expect(checkAnswer(sealChallenge(challenge()), 4, 7)).toEqual({ correct: true, timedOut: false, fish: 4, chest: 7 });
    expect(checkAnswer(sealChallenge(challenge()), 4, 6)?.correct).toBe(false);
    expect(checkAnswer(sealChallenge(challenge()), 3, 7)?.correct).toBe(false);
    expect(checkAnswer(sealChallenge(challenge()), null, null)?.correct).toBe(false);
  });

  it("accepts zero as a right answer", () => {
    expect(checkAnswer(sealChallenge(challenge({ fish: 0, chest: 5 })), 0, 5)?.correct).toBe(true);
  });

  it("only the first answer counts, so numbers can't be guessed one by one", () => {
    const token = sealChallenge(challenge());
    expect(checkAnswer(token, 1, 1)?.correct).toBe(false);
    expect(checkAnswer(token, 4, 7)?.correct).toBe(false);
  });

  it("gives the same result if a correct answer is sent again after a lost connection", () => {
    const token = sealChallenge(challenge());
    expect(checkAnswer(token, 4, 7)?.correct).toBe(true);
    expect(checkAnswer(token, 4, 7)?.correct).toBe(true);
  });

  it("rejects a right answer that arrives after the deadline", () => {
    const now = Date.now();
    expect(checkAnswer(sealChallenge(challenge({ expiresAt: now - 1 })), 4, 7, now)).toMatchObject({ correct: false, timedOut: true });
  });

  it("returns null for an invalid token", () => {
    expect(checkAnswer("nope", 1, 1)).toBeNull();
  });

  it("sets the deadline from the attempt, with a little grace for the network", async () => {
    stubApi(apiBody(2, 3));
    const now = 1000000;
    const started = await startChallenge(2, now);
    expect(started.timeLimitSec).toBe(10);
    expect(openChallenge(started.token)?.expiresAt).toBe(now + 13000);
  });
});

describe("start route", () => {
  it("returns the photo and never the answers", async () => {
    stubApi(apiBody(11, 13));
    const response = await startRoute(jsonRequest({ attempt: 0 }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(["image", "timeLimitSec", "token"]);
    expect(body.image).toBe(`data:image/png;base64,${PNG}`);
  });

  it("calls the API once on the first attempt and four times on the last", async () => {
    const first = stubApi(apiBody(1, 1));
    await startRoute(jsonRequest({ attempt: 0 }));
    expect(first).toHaveBeenCalledTimes(1);
    const last = stubApi(apiBody(1, 1), apiBody(1, 1), apiBody(1, 1), apiBody(1, 1));
    await startRoute(jsonRequest({ attempt: 2 }));
    expect(last).toHaveBeenCalledTimes(4);
  });

  it("rejects a bad request without calling the API", async () => {
    const api = stubApi(apiBody(1, 1));
    for (const body of [{}, { attempt: -1 }, { attempt: 3 }, { attempt: 1.5 }, { attempt: "0" }, "not json"]) {
      expect((await startRoute(jsonRequest(body))).status).toBe(400);
    }
    expect(api).not.toHaveBeenCalled();
  });

  it("reports 503 when the Fish API is down", async () => {
    stubApi(new Error("down"));
    expect((await startRoute(jsonRequest({ attempt: 0 }))).status).toBe(503);
  });

  it("slows down one address that calls too often, without blocking others", () => {
    const now = 5000000;
    for (let i = 0; i < 20; i++) expect(allowRequest("busy", now)).toBe(true);
    expect(allowRequest("busy", now)).toBe(false);
    expect(allowRequest("other", now)).toBe(true);
    expect(allowRequest("busy", now + 61000)).toBe(true);
  });
});

describe("answer route", () => {
  it("checks a valid answer", async () => {
    const response = await answerRoute(jsonRequest({ token: sealChallenge(challenge()), fish: 4, chest: 7 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ correct: true, timedOut: false, fish: 4, chest: 7 });
  });

  it("accepts empty boxes from a timer running out", async () => {
    const response = await answerRoute(jsonRequest({ token: sealChallenge(challenge()), fish: null, chest: null }));
    expect((await response.json()).correct).toBe(false);
  });

  it("rejects bad requests", async () => {
    const token = sealChallenge(challenge());
    const bad = [{}, { token, fish: 1 }, { token, fish: -1, chest: 1 }, { token, fish: 1.5, chest: 1 }, { token, fish: "1", chest: 1 }, { token, fish: 100, chest: 1 }, { token: 5, fish: 1, chest: 1 }, { token: "nope", fish: 1, chest: 1 }, "not json"];
    for (const body of bad) expect((await answerRoute(jsonRequest(body))).status, JSON.stringify(body)).toBe(400);
  });
});
