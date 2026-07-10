import "server-only";
import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;

const client = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Best-effort email send. No-ops (with a console warning) until a verified
 * Resend domain + RESEND_API_KEY are configured — neither is set up yet, so
 * this is a ready-to-use stub for when that integration lands.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping email:", subject, "->", to);
    return;
  }

  try {
    const { error } = await client.emails.send({
      from: "ยินผัน ฟุตบอล อคาเดมี <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("[email] failed to send", error);
    }
  } catch (error) {
    console.error("[email] failed to send", error);
  }
}
