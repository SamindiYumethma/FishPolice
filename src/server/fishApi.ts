const API_URL = "https://marcconrad.com/uob/fish/api.php?out=json&base64=yes";
const TIMEOUT_MS = 8000;
const PNG_BASE64_START = "iVBORw0KGgo";

export class FishApiError extends Error {}

export interface FishPuzzle {
  imageBase64: string;
  fish: number;
  chest: number;
}

/**
 * Gets one puzzle from the Fish API. base64=yes is used because the image link the API
 * otherwise returns has the answers in its filename (…_001x009.png is 1 chest, 9 fish).
 */
export async function fetchPuzzle(): Promise<FishPuzzle> {
  let text: string;
  try {
    const response = await fetch(API_URL, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new FishApiError(`Fish API responded with ${response.status}`);
    text = await response.text();
  } catch (error) {
    throw error instanceof FishApiError ? error : new FishApiError(`Fish API could not be reached: ${String(error)}`);
  }
  return parsePuzzle(text);
}

/** Checks the response before trusting it. The API labels its JSON as text/html, so the header is no help. */
export function parsePuzzle(text: string): FishPuzzle {
  let data: { question?: unknown; fish?: unknown; chest?: unknown };
  try {
    data = JSON.parse(text);
  } catch {
    throw new FishApiError("Fish API did not return JSON");
  }
  const { question, fish, chest } = data ?? {};
  if (typeof question !== "string" || !question.startsWith(PNG_BASE64_START)) throw new FishApiError("Fish API did not return a PNG");
  if (!isCount(fish) || !isCount(chest)) throw new FishApiError("Fish API returned invalid counts");
  return { imageBase64: question, fish, chest };
}

/** Fetches several puzzles at once and keeps the busiest. Some may fail, as long as one arrives. */
export async function fetchBusiestPuzzle(samples: number): Promise<FishPuzzle> {
  const results = await Promise.allSettled(Array.from({ length: samples }, fetchPuzzle));
  const puzzles = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  if (puzzles.length === 0) throw new FishApiError("No puzzle could be fetched");
  return puzzles.reduce((busiest, puzzle) => (puzzle.fish + puzzle.chest > busiest.fish + busiest.chest ? puzzle : busiest));
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}
