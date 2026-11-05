import { MAX_COUNT } from "../../../../game/rebirth";
import { checkAnswer } from "../../../../server/rebirthService";

/** A count from 0 up, or null for a box left empty when time ran out. */
function isAnswer(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) >= 0 && (value as number) <= MAX_COUNT);
}

/** POST { token, fish, chest }: checks the player's one answer. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== "string" || !isAnswer(body.fish) || !isAnswer(body.chest)) {
    return Response.json({ error: "Invalid answer" }, { status: 400 });
  }
  const result = checkAnswer(body.token, body.fish, body.chest);
  if (!result) return Response.json({ error: "Invalid token" }, { status: 400 });
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
