const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 20;

type RateHolder = typeof globalThis & { __fishPoliceRates?: Map<string, { count: number; resetAt: number }> };

/**
 * Limits how often one address can start challenges, because each start calls the Fish
 * API, a free service we shouldn't flood. Returns false once the limit is reached.
 */
export function allowRequest(key: string, now = Date.now()): boolean {
  const rates = ((globalThis as RateHolder).__fishPoliceRates ??= new Map());
  for (const [k, entry] of rates) if (entry.resetAt <= now) rates.delete(k);
  const entry = rates.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };
  entry.count++;
  rates.set(key, entry);
  return entry.count <= MAX_PER_WINDOW;
}

export function clientAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
