import { messagingApi } from "@line/bot-sdk";

const { LINE_CHANNEL_ACCESS_TOKEN } = process.env;

const client = LINE_CHANNEL_ACCESS_TOKEN
  ? new messagingApi.MessagingApiClient({ channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN })
  : null;

/**
 * Best-effort LINE push notification. No-ops (with a console warning) until a real
 * LINE Official Account channel is connected (LINE_CHANNEL_ACCESS_TOKEN) and the
 * target user has linked their LINE account (User.lineUserId) — neither is wired up
 * yet, so this is a ready-to-use stub for when that integration lands.
 */
export async function notifyLine(lineUserId: string | null | undefined, text: string): Promise<void> {
  if (!client) {
    console.warn("[line] LINE_CHANNEL_ACCESS_TOKEN not set — skipping notification:", text);
    return;
  }
  if (!lineUserId) {
    console.warn("[line] user has no linked lineUserId — skipping notification:", text);
    return;
  }

  try {
    await client.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("[line] failed to push message", error);
  }
}
