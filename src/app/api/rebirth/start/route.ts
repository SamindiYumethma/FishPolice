import { MAX_REBIRTHS } from "../../../../game/rebirth";
import { allowRequest, clientAddress } from "../../../../server/rateLimit";
import { startChallenge } from "../../../../server/rebirthService";

const NO_STORE = { "Cache-Control": "no-store" };

/** POST { attempt }: starts a Rebirth Challenge and returns the photo, never the answers. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const attempt = body?.attempt;
  if (!Number.isInteger(attempt) || attempt < 0 || attempt >= MAX_REBIRTHS) {
    return Response.json({ error: "Invalid attempt" }, { status: 400 });
  }
  if (!allowRequest(clientAddress(request))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    return Response.json(await startChallenge(attempt), { headers: NO_STORE });
  } catch (error) {
    console.error("Rebirth challenge could not start:", error);
    return Response.json({ error: "The photo service is unavailable" }, { status: 503 });
  }
}
