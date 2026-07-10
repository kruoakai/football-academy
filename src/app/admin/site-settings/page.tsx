import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import SiteSettingsForm from "./SiteSettingsForm";

export const metadata: Metadata = { title: "ส่วนหัว/ท้ายเว็บไซต์ | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">ส่วนหัว/ท้ายเว็บไซต์</h1>
        <p className="mt-1 text-sm text-neutral-600">
          แก้ไขข้อความในแถบเมนูด้านบน (Header) และส่วนท้ายเว็บไซต์ (Footer) ที่แสดงในทุกหน้า บันทึกแล้วมีผลภายในไม่กี่วินาที
        </p>
      </div>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
