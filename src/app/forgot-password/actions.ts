"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { notifyLine } from "@/lib/line";
import { SITE_URL } from "@/lib/site";
import { generatePasswordResetToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/password-reset";

const schema = z.object({
  identifier: z.string().min(1, { error: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์" }),
});

export type ForgotPasswordState = { error?: string; success?: string } | undefined;

// Always returns the same generic success message regardless of whether the
// identifier matched a real account — prevents using this form to enumerate
// which emails/phone numbers are registered.
const GENERIC_SUCCESS = "หากมีบัญชีที่ตรงกับข้อมูลนี้ ระบบได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว";

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const { identifier } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }], active: true },
  });

  if (user) {
    // Drop any previously issued, still-unused tokens so only the newest
    // link works — keeps the table tidy and avoids multiple live links.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const { token, tokenHash } = generatePasswordResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
    const message = `ตั้งรหัสผ่านใหม่สำหรับบัญชียินผัน ฟุตบอล อคาเดมี ของคุณได้ที่ลิงก์นี้ (หมดอายุใน 1 ชั่วโมง): ${resetUrl}\n\nหากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่อข้อความนี้`;

    // Neither Resend nor LINE is connected yet (see src/lib/email.ts,
    // src/lib/line.ts) — without this, the reset flow has no way to reach
    // the admin/tester at all in this environment. Only fires when email
    // delivery isn't actually configured, so it's silent once it is.
    if (!process.env.RESEND_API_KEY) {
      console.log(`[forgot-password] RESEND_API_KEY not set — reset link for ${user.email ?? user.phone}: ${resetUrl}`);
    }

    if (user.email) {
      await sendEmail(
        user.email,
        "ตั้งรหัสผ่านใหม่ - ยินผัน ฟุตบอล อคาเดมี",
        `<p>ตั้งรหัสผ่านใหม่สำหรับบัญชียินผัน ฟุตบอล อคาเดมี ของคุณได้ที่ลิงก์นี้ (หมดอายุใน 1 ชั่วโมง):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</p>`
      );
    }
    if (user.lineUserId) {
      await notifyLine(user.lineUserId, message);
    }
  }

  return { success: GENERIC_SUCCESS };
}
