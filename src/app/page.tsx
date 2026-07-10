import Link from "next/link";

const usps = [
  {
    tag: "โค้ชหลัก",
    title: "สอนโดยอดีตนักเตะทีมชาติ",
    name: "ภานุวัฒน์ ยินผัน",
    desc: "อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย ถ่ายทอดเทคนิคและประสบการณ์ระดับนานาชาติสู่นักเรียนทุกรุ่น",
  },
  {
    tag: "หัวหน้าคลินิก",
    title: "ฟื้นฟูโดยมืออาชีพ",
    name: "ผู้ร่วมก่อตั้ง / นักกายภาพบำบัด",
    desc: "อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม ดูแลคลินิกกายภาพและฟื้นฟูของสถาบันโดยตรง ลดความเสี่ยงบาดเจ็บและเสริมสมรรถภาพนักกีฬา",
  },
];

const highlights = [
  {
    title: "หลักสูตรตามช่วงวัย",
    desc: "ออกแบบการฝึกให้เหมาะกับพัฒนาการของนักเรียนแต่ละรุ่น ตั้งแต่ระดับเริ่มต้นถึงระดับแข่งขัน",
  },
  {
    title: "ดูแลครบวงจร",
    desc: "ฝึกซ้อมฟุตบอลควบคู่การประเมินร่างกายและฟื้นฟูอาการบาดเจ็บ โดยทีมงานเฉพาะทาง",
  },
  {
    title: "แจ้งเตือนผ่าน LINE",
    desc: "ตารางฝึกซ้อม การนัดหมาย และผลการเข้าเรียน แจ้งเตือนถึงผู้ปกครองแบบเรียลไทม์",
  },
];

const programs = [
  { age: "6–9 ปี", name: "เยาวชนเริ่มต้น", desc: "ปูพื้นฐานทักษะบอลและความสนุกในการเล่น" },
  { age: "10–13 ปี", name: "เยาวชนพัฒนา", desc: "พัฒนาเทคนิคเฉพาะตำแหน่งและการอ่านเกม" },
  { age: "14–18 ปี", name: "เยาวชนสู่ทีมชาติ", desc: "ยกระดับสู่การแข่งขันและเตรียมความพร้อมสู่ทีมระดับสูง" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(90deg,white_0px,white_2px,transparent_2px,transparent_80px)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24 lg:flex-row lg:text-left lg:py-28">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
              ยินผัน ฟุตบอล อคาเดมี
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              สอนโดย<span className="text-gold-400">ทีมชาติ</span>
              <br className="hidden sm:block" /> ฟื้นฟูโดย<span className="text-gold-400">มืออาชีพ</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
              สถาบันฟุตบอลที่ดำเนินงานโดยคู่ครองผู้เชี่ยวชาญคนละด้าน
              ผสานการฝึกซ้อมจากอดีตนักเตะทีมชาติ เข้ากับการดูแลฟื้นฟูร่างกายจากนักกายภาพบำบัดมืออาชีพ
              ในสถาบันเดียว
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/about"
                className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
              >
                สมัครเรียนวันนี้
              </Link>
              <Link
                href="/about"
                className="flex min-h-[44px] items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                รู้จักเรามากขึ้น
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-md">
              <div className="col-span-2 rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="font-heading text-lg font-semibold text-gold-300">
                  โค้ช + นักกายภาพ
                </p>
                <p className="mt-1 text-sm text-white/70">ทีมงานมืออาชีพในที่เดียว</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="font-heading text-lg font-semibold text-gold-300">ฝึกซ้อม</p>
                <p className="mt-1 text-sm text-white/70">ทุกช่วงวัย</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="font-heading text-lg font-semibold text-gold-300">ฟื้นฟู</p>
                <p className="mt-1 text-sm text-white/70">คลินิกกายภาพ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP twin pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
            สองมืออาชีพ หนึ่งเป้าหมาย
          </h2>
          <p className="mt-2 text-neutral-600">
            ความเชี่ยวชาญที่แตกต่างกัน ผสานกันเพื่อพัฒนานักเรียนอย่างรอบด้าน
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {usps.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
            >
              <span className="inline-block rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pitch-700">
                {u.tag}
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold text-pitch-900">{u.title}</h3>
              <p className="mt-1 text-sm font-medium text-gold-600">{u.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-pitch-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-center font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
            ทำไมต้องยินผัน ฟุตบอล อคาเดมี
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-pitch-800">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs teaser */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
              คอร์สเรียนตามช่วงวัย
            </h2>
            <p className="mt-2 text-neutral-600">ตัวอย่างการจัดกลุ่มรุ่น — รายละเอียดคอร์สฉบับเต็มเร็วๆ นี้</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-neutral-200 p-6 transition hover:border-gold-400 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-gold-600">{p.age}</span>
              <h3 className="mt-1 font-heading text-lg font-bold text-pitch-900">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pitch-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            พร้อมให้ลูกของคุณก้าวสู่สนามหญ้าแล้วหรือยัง?
          </h2>
          <p className="max-w-xl text-white/80">
            สมัครเรียนวันนี้ พร้อมรับการดูแลจากทีมโค้ชและนักกายภาพบำบัดมืออาชีพ
          </p>
          <Link
            href="/about"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
          >
            เริ่มต้นเลย
          </Link>
        </div>
      </section>
    </div>
  );
}
