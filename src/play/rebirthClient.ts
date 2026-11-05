import type { RebirthAnswerResponse, RebirthStartResponse } from "../game/rebirth";

const START_TIMEOUT_MS = 20000;
const ANSWER_TIMEOUT_MS = 10000;

async function post<T>(url: string, body: unknown, timeoutMs: number, controller = new AbortController()): Promise<T> {
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export function requestChallenge(attempt: number, controller: AbortController): Promise<RebirthStartResponse> {
  return post("/api/rebirth/start", { attempt }, START_TIMEOUT_MS, controller);
}

export function submitAnswer(token: string, fish: number | null, chest: number | null): Promise<RebirthAnswerResponse> {
  return post("/api/rebirth/answer", { token, fish, chest }, ANSWER_TIMEOUT_MS);
}
