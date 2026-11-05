import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export interface ChallengeData {
  id: string;
  fish: number;
  chest: number;
  expiresAt: number;
}

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

type SecretHolder = typeof globalThis & { __fishPoliceSecret?: string };

/**
 * The key comes from REBIRTH_TOKEN_SECRET. Without it, a random one lasts until the server
 * restarts. It sits on globalThis because Next.js bundles each route separately, and both
 * routes must share one key.
 */
function encryptionKey(): Buffer {
  const holder = globalThis as SecretHolder;
  const secret = process.env.REBIRTH_TOKEN_SECRET || (holder.__fishPoliceSecret ??= randomBytes(32).toString("hex"));
  return createHash("sha256").update(secret).digest();
}

/**
 * Locks the answers into a token the browser carries between the two requests. It is
 * encrypted because a token that was only signed could still be read by the player. GCM
 * also detects any change to it, so a token can't be edited either.
 */
export function sealChallenge(data: ChallengeData): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

/** Returns the challenge, or null if the token is damaged, edited or made with another key. */
export function openChallenge(token: string): ChallengeData | null {
  const [iv, tag, encrypted, ...extra] = token.split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !encrypted || extra.length > 0) return null;
  try {
    const decipher = createDecipheriv(ALGORITHM, encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
  } catch {
    return null;
  }
}
