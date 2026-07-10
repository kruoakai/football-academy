import type { Metadata } from "next";
import Link from "next/link";
import { getHomeContent } from "@/lib/home-content";
import HomeContentForm from "./HomeContentForm";

export const metadata: Metadata = { title: "เนื้อหาหน้าแรก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const content = await getHomeContent();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">เนื้อหาหน้าแรก</h1>
        <p className="mt-1 text-sm text-neutral-600">
          แก้ไขข้อความทั้งหมดบนหน้าแรกของเว็บไซต์ (landing page) ได้จากที่นี่ บันทึกแล้วมีผลทันที —{" "}
          <Link href="/" target="_blank" className="font-medium text-pitch-700 hover:underline">
            เปิดหน้าแรกดูตัวอย่าง ↗
          </Link>
        </p>
      </div>
      <HomeContentForm content={content} />
    </div>
  );
}
