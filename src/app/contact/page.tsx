import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "ติดต่อเรา | ยินผัน ฟุตบอล อคาเดมี",
  description: "ช่องทางติดต่อยินผัน ฟุตบอล อคาเดมี ที่อยู่ เบอร์โทร LINE Official และเวลาทำการ",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const infoCards = [
    { label: "ที่อยู่ / สนามฝึกซ้อม", value: settings.footerAddress },
    { label: "เบอร์โทร", value: settings.footerPhone },
    { label: "LINE Official", value: settings.footerLineId },
    { label: "เวลาทำการ", value: settings.contactHours },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
            ติดต่อเรา
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
            พร้อมตอบทุกคำถามเกี่ยวกับคอร์สเรียนและคลินิก
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80">
            ทักหาเราได้ทาง LINE Official หรือแวะมาที่สนามฝึกซ้อมได้ตามเวลาทำการ
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{card.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl bg-pitch-50 p-6 text-center sm:aspect-auto">
            <span className="font-heading text-2xl font-bold text-pitch-300">แผนที่</span>
            <span className="text-sm text-neutral-500">แผนที่สนามฝึกซ้อมจะอัปเดตเร็วๆ นี้</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-pitch-900 p-8 text-center text-white sm:p-10">
          <h2 className="font-heading text-xl font-bold">สนใจสมัครเรียนหรือจองคลินิก?</h2>
          <p className="max-w-xl text-sm text-white/80">
            สมัครสมาชิกออนไลน์เพื่อดูรุ่นที่เปิดรับสมัครและจองคิวคลินิกกายภาพได้ทันที
          </p>
          <Link
            href="/register"
            className="mt-2 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-sm font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
          >
            สมัครเรียน
          </Link>
        </div>
      </section>
    </div>
  );
}
