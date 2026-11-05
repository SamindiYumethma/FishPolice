import { randomUUID } from "node:crypto";
import { rebirthPhotoSamples, rebirthTimeLimit, type RebirthAnswerResponse, type RebirthStartResponse } from "../game/rebirth";
import { openChallenge, sealChallenge } from "./challengeToken";
import { fetchBusiestPuzzle } from "./fishApi";

/** Extra time on the server's clock, because the browser's timer starts after the photo has downloaded. */
const NETWORK_GRACE_MS = 3000;
/** How long an answered challenge is remembered. It only has to outlast the token. */
const REMEMBER_MS = 10 * 60 * 1000;

interface Answered {
  response: RebirthAnswerResponse;
  forgetAt: number;
}

type AnsweredHolder = typeof globalThis & { __fishPoliceAnswered?: Map<string, Answered> };

/* On globalThis because Next.js bundles each route separately. Being in memory, this is per server process. */
function answeredChallenges(): Map<string, Answered> {
  return ((globalThis as AnsweredHolder).__fishPoliceAnswered ??= new Map());
}

export async function startChallenge(attempt: number, now = Date.now()): Promise<RebirthStartResponse> {
  const puzzle = await fetchBusiestPuzzle(rebirthPhotoSamples(attempt));
  const timeLimitSec = rebirthTimeLimit(attempt);
  return {
    token: sealChallenge({
      id: randomUUID(),
      fish: puzzle.fish,
      chest: puzzle.chest,
      expiresAt: now + timeLimitSec * 1000 + NETWORK_GRACE_MS,
    }),
    image: `data:image/png;base64,${puzzle.imageBase64}`,
    timeLimitSec,
  };
}

/**
 * Checks an answer, or returns null for an invalid token. Only the first answer to a
 * challenge counts, otherwise a player could try numbers until one worked. Sending it again
 * gets the same result, so a retry after a lost connection is safe.
 */
export function checkAnswer(token: string, fish: number | null, chest: number | null, now = Date.now()): RebirthAnswerResponse | null {
  const challenge = openChallenge(token);
  if (!challenge) return null;

  const answered = answeredChallenges();
  for (const [id, entry] of answered) if (entry.forgetAt <= now) answered.delete(id);
  const earlier = answered.get(challenge.id);
  if (earlier) return earlier.response;

  const timedOut = now > challenge.expiresAt;
  const response: RebirthAnswerResponse = {
    correct: !timedOut && fish === challenge.fish && chest === challenge.chest,
    timedOut,
    fish: challenge.fish,
    chest: challenge.chest,
  };
  answered.set(challenge.id, { response, forgetAt: now + REMEMBER_MS });
  return response;
}
