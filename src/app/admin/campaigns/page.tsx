import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass, tableWrapClass, tableClass, thClass, tdClass } from "@/lib/admin-ui";
import { formatThaiDateTime } from "@/lib/thai";
import CampaignForm from "./CampaignForm";

export const metadata: Metadata = { title: "แคมเปญ | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const channelLabel: Record<string, string> = { EMAIL: "อีเมล", LINE: "LINE", BOTH: "อีเมล + LINE" };

export default async function AdminCampaignsPage() {
  const [batches, campaigns] = await Promise.all([
    prisma.batch.findMany({ include: { course: true }, orderBy: { startDate: "desc" } }),
    prisma.campaign.findMany({ orderBy: { sentAt: "desc" }, take: 20 }),
  ]);

  const batchOptions = batches.map((b) => ({ id: b.id, label: `รุ่น: ${b.course.name} · ${b.name}` }));

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">แคมเปญ</h1>
        <p className="mt-1 text-sm text-neutral-600">
          ส่งข่าวสารหรือแจ้งเตือนถึงผู้ปกครองผ่านอีเมลหรือ LINE (กดส่งเองจากหน้านี้)
        </p>
      </div>

      <div className={cardClass}>
        <CampaignForm batches={batchOptions} />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">ประวัติการส่ง</h2>
        <div className={`${tableWrapClass} mt-3`}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>วันที่ส่ง</th>
                <th className={thClass}>หัวข้อ/ข้อความ</th>
                <th className={thClass}>ช่องทาง</th>
                <th className={thClass}>กลุ่มเป้าหมาย</th>
                <th className={thClass}>จำนวนผู้รับ</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className={tdClass}>{formatThaiDateTime(c.sentAt)}</td>
                  <td className={tdClass}>{c.subject || c.message.slice(0, 40)}</td>
                  <td className={tdClass}>{channelLabel[c.channel] ?? c.channel}</td>
                  <td className={tdClass}>{c.audience}</td>
                  <td className={tdClass}>{c.recipientCount}</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={5}>
                    <span className="text-neutral-400">ยังไม่มีประวัติการส่ง</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
