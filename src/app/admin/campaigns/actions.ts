"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { sendEmail } from "@/lib/email";
import { notifyLine } from "@/lib/line";

type Recipient = { userId: string; email: string | null; lineUserId: string | null };

async function resolveAudience(audience: string): Promise<{ recipients: Recipient[]; label: string }> {
  if (audience === "all") {
    const guardians = await prisma.guardian.findMany({ include: { user: true } });
    return {
      recipients: guardians.map((g) => ({ userId: g.user.id, email: g.user.email, lineUserId: g.user.lineUserId })),
      label: "ทุกคน",
    };
  }

  if (audience === "pending_payment") {
    const bookings = await prisma.booking.findMany({
      where: { status: "PENDING_PAYMENT" },
      include: { student: { include: { guardian: { include: { user: true } } } } },
    });
    const seen = new Map<string, Recipient>();
    for (const b of bookings) {
      const u = b.student.guardian.user;
      seen.set(u.id, { userId: u.id, email: u.email, lineUserId: u.lineUserId });
    }
    return { recipients: [...seen.values()], label: "มีการจองค้างชำระ" };
  }

  if (audience.startsWith("batch:")) {
    const batchId = audience.slice("batch:".length);
    const batch = await prisma.batch.findUnique({ where: { id: batchId }, include: { course: true } });
    const students = await prisma.student.findMany({
      where: { batchId },
      include: { guardian: { include: { user: true } } },
    });
    const seen = new Map<string, Recipient>();
    for (const s of students) {
      const u = s.guardian.user;
      seen.set(u.id, { userId: u.id, email: u.email, lineUserId: u.lineUserId });
    }
    return {
      recipients: [...seen.values()],
      label: batch ? `รุ่น: ${batch.course.name} · ${batch.name}` : "รุ่นที่เลือก",
    };
  }

  return { recipients: [], label: audience };
}

const campaignSchema = z.object({
  subject: z.string().optional(),
  message: z.string().min(1, { error: "กรุณากรอกข้อความ" }),
  channelEmail: z.string().optional(),
  channelLine: z.string().optional(),
  audience: z.string().min(1, { error: "กรุณาเลือกกลุ่มเป้าหมาย" }),
  confirm: z.string().optional(),
});

export type CampaignFormState =
  | { error?: string; preview?: { count: number; audienceLabel: string }; success?: string }
  | undefined;

export async function sendCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = campaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const channelEmail = parsed.data.channelEmail === "on";
  const channelLine = parsed.data.channelLine === "on";
  if (!channelEmail && !channelLine) return { error: "กรุณาเลือกอย่างน้อย 1 ช่องทาง (อีเมลหรือ LINE)" };

  const { recipients, label } = await resolveAudience(parsed.data.audience);

  const confirmed = parsed.data.confirm === "true";
  if (!confirmed) {
    return { preview: { count: recipients.length, audienceLabel: label } };
  }

  const { subject, message } = parsed.data;

  for (const r of recipients) {
    if (channelEmail && r.email) {
      await sendEmail(r.email, subject || "ข่าวสารจากยินผัน ฟุตบอล อคาเดมี", `<p>${message.replace(/\n/g, "<br/>")}</p>`);
    }
    if (channelLine) {
      await notifyLine(r.lineUserId, message);
    }
  }

  await prisma.campaign.create({
    data: {
      subject: subject || null,
      message,
      channel: channelEmail && channelLine ? "BOTH" : channelEmail ? "EMAIL" : "LINE",
      audience: label,
      recipientCount: recipients.length,
      sentBy: session.user.name ?? session.user.id,
    },
  });

  revalidatePath("/admin/campaigns");
  return { success: `ส่งแคมเปญให้ ${recipients.length} คนเรียบร้อยแล้ว` };
}
