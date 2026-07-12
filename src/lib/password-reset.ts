import "server-only";
import { randomBytes, createHash } from "node:crypto";

export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// The raw token only ever lives in the reset-link URL/email — the DB stores
// hashTokenForStorage(token) instead, so a DB leak alone can't be replayed
// to reset accounts.
export function generatePasswordResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashTokenForStorage(token) };
}

export function hashTokenForStorage(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
