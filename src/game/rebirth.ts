/** Rebirth Challenges per run. Each is one photo and one answer: no second tries. */
export const MAX_REBIRTHS = 3;

/** Seconds to answer, per attempt. */
const TIME_LIMITS = [20, 15, 10];
/**
 * The Fish API can't be asked for a busy photo, so the server fetches this many per
 * attempt and keeps the most crowded one. More samples means a busier photo on average.
 */
const PHOTO_SAMPLES = [1, 2, 4];

export const MAX_COUNT = 99;

function forAttempt(values: readonly number[], attempt: number): number {
  return values[Math.min(values.length - 1, Math.max(0, attempt))];
}

export function rebirthTimeLimit(attempt: number): number {
  return forAttempt(TIME_LIMITS, attempt);
}

export function rebirthPhotoSamples(attempt: number): number {
  return forAttempt(PHOTO_SAMPLES, attempt);
}

/* What the browser and the server send each other. The start response never contains the answers. */

export interface RebirthStartResponse {
  /** Encrypted, so the browser can carry it but can't read it. */
  token: string;
  /** The photo as a data URL. The API's image link isn't used because its filename contains the answers. */
  image: string;
  timeLimitSec: number;
}

export interface RebirthAnswerResponse {
  correct: boolean;
  timedOut: boolean;
  fish: number;
  chest: number;
}
