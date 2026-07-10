import type { Metadata } from "next";
import Link from "next/link";
import FounderPlaceholder from "@/components/FounderPlaceholder";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | ยินผัน ฟุตบอล อคาเดมี",
  description:
    "รู้จักผู้ก่อตั้งยินผัน ฟุตบอล อคาเดมี อดีตนักเตะทีมชาติไทยและนักกายภาพบำบัดมืออาชีพ ผู้อยู่เบื้องหลังสถาบันฟุตบอลที่ดูแลนักเรียนครบวงจร",
};

const founders = [
  {
    initials: "ภย",
    role: "ผู้ก่อตั้ง / หัวหน้าโค้ช",
    name: "ภานุวัฒน์ ยินผัน",
    bio: "อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย ผันตัวมาถ่ายทอดความรู้และประสบการณ์การเล่นในระดับนานาชาติ เพื่อปั้นนักเตะเยาวชนรุ่นใหม่ให้เติบโตอย่างถูกวิธี ทั้งด้านเทคนิค ทัศนคติ และวินัยในสนาม",
  },
  {
    initials: "PT",
    role: "ผู้ร่วมก่อตั้ง / หัวหน้านักกายภาพบำบัด",
    name: "ผู้ร่วมก่อตั้ง — นักกายภาพบำบัด",
    bio: "อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม สั่งสมประสบการณ์ดูแลนักกีฬาอาชีพ ปัจจุบันดูแลคลินิกกายภาพและฟื้นฟูของสถาบันโดยตรง เพื่อลดความเสี่ยงการบาดเจ็บและช่วยให้นักเรียนกลับมาเล่นได้อย่างปลอดภัย",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
            เกี่ยวกับเรา
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            สองความเชี่ยวชาญ หนึ่งความตั้งใจ เพื่อนักเตะรุ่นใหม่
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            ยินผัน ฟุตบอล อคาเดมี ก่อตั้งโดยคู่ครองที่เชี่ยวชาญคนละด้าน
            ฝั่งหนึ่งคืออดีตนักเตะทีมชาติผู้เข้าใจเกมลูกหนังอย่างลึกซึ้ง
            อีกฝั่งคือนักกายภาพบำบัดมืออาชีพผู้ดูแลร่างกายนักกีฬามาแล้วนับไม่ถ้วน
            เราเชื่อว่าการพัฒนานักฟุตบอลที่ดี ต้องดูแลทั้งฝีเท้าและร่างกายไปพร้อมกัน
          </p>
        </div>
      </section>

      {/* Founders */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
            ผู้ก่อตั้งของเรา
          </h2>
          <p className="mt-2 text-neutral-600">สองมืออาชีพ สองบทบาท ในสถาบันเดียว</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2">
          {founders.map((f) => (
            <div
              key={f.name}
              className="flex flex-col gap-5 rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:flex-row sm:p-8"
            >
              <div className="w-full sm:w-40 shrink-0">
                <FounderPlaceholder initials={f.initials} />
              </div>
              <div>
                <span className="inline-block rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pitch-700">
                  {f.role}
                </span>
                <h3 className="mt-3 font-heading text-xl font-bold text-pitch-900">{f.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-pitch-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-pitch-800">พันธกิจของเรา</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              พัฒนานักฟุตบอลเยาวชนอย่างรอบด้าน ทั้งทักษะในสนามและสุขภาพร่างกาย
              ภายใต้การดูแลของผู้เชี่ยวชาญจริง
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-pitch-800">แนวทางการสอน</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              ผสานประสบการณ์จริงจากสนามแข่งขันระดับนานาชาติ เข้ากับหลักวิทยาศาสตร์การกีฬาและกายภาพบำบัด
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-pitch-800">ดูแลครบวงจร</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              ตั้งแต่การฝึกซ้อม การประเมินร่างกาย ไปจนถึงการฟื้นฟูอาการบาดเจ็บ ในสถาบันเดียว
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pitch-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            มาร่วมเป็นส่วนหนึ่งของยินผัน ฟุตบอล อคาเดมี
          </h2>
          <Link
            href="/register"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
          >
            สมัครเรียน
          </Link>
        </div>
      </section>
    </div>
  );
}
