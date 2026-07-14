import type { Metadata } from "next";
import Link from "next/link";
import { getAboutContent } from "@/lib/about-content";
import AboutContentForm from "./AboutContentForm";

export const metadata: Metadata = { title: "เนื้อหาหน้าเกี่ยวกับเรา | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AboutContentPage() {
  const content = await getAboutContent();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">เนื้อหาหน้าเกี่ยวกับเรา</h1>
        <p className="mt-1 text-sm text-neutral-600">
          แก้ไขข้อความและรูปภาพทั้งหมดบนหน้าเกี่ยวกับเราได้จากที่นี่ บันทึกแล้วมีผลทันที —{" "}
          <Link href="/about" target="_blank" className="font-medium text-pitch-700 hover:underline">
            เปิดหน้าเกี่ยวกับเราดูตัวอย่าง ↗
          </Link>
        </p>
      </div>
      <AboutContentForm content={content} />
    </div>
  );
}
