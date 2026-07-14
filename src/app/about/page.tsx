import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import FounderPlaceholder from "@/components/FounderPlaceholder";
import { getAboutContent } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | ยินผัน ฟุตบอล อคาเดมี",
  description:
    "รู้จักผู้ก่อตั้งยินผัน ฟุตบอล อคาเดมี อดีตนักเตะทีมชาติไทยและนักกายภาพบำบัดมืออาชีพ ผู้อยู่เบื้องหลังสถาบันฟุตบอลที่ดูแลนักเรียนครบวงจร",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const c = await getAboutContent();

  const founders = [
    {
      initials: c.founder1Initials,
      role: c.founder1Role,
      name: c.founder1Name,
      bio: c.founder1Bio,
      photo: c.founder1PhotoUrl,
      show: c.showFounder1,
    },
    {
      initials: c.founder2Initials,
      role: c.founder2Role,
      name: c.founder2Name,
      bio: c.founder2Bio,
      photo: c.founder2PhotoUrl,
      show: c.showFounder2,
    },
  ].filter((f) => f.show);

  const missions = [
    { title: c.mission1Title, desc: c.mission1Desc, show: c.showMission1 },
    { title: c.mission2Title, desc: c.mission2Desc, show: c.showMission2 },
    { title: c.mission3Title, desc: c.mission3Desc, show: c.showMission3 },
  ].filter((m) => m.show);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          {c.showHeroBadge && (
            <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
              {c.heroBadge}
            </span>
          )}
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {c.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {c.heroDescription}
          </p>
        </div>
      </section>

      {/* Founders */}
      {c.showFoundersSection && founders.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            {c.showFoundersSectionTitle && (
              <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
                {c.foundersSectionTitle}
              </h2>
            )}
            {c.showFoundersSectionSubtitle && <p className="mt-2 text-neutral-600">{c.foundersSectionSubtitle}</p>}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2">
            {founders.map((f) => (
              <div
                key={f.name}
                className="flex flex-col gap-5 rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:flex-row sm:p-8"
              >
                <div className="relative w-full aspect-square sm:w-40 shrink-0 overflow-hidden rounded-2xl">
                  {f.photo ? (
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fill
                      sizes="(min-width: 640px) 160px, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <FounderPlaceholder initials={f.initials} />
                  )}
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
      )}

      {/* Mission */}
      {c.showMissionSection && missions.length > 0 && (
        <section className="bg-pitch-50">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-3">
            {missions.map((m) => (
              <div key={m.title} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-pitch-800">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {c.showCtaSection && (
        <section className="bg-pitch-900">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 sm:py-20">
            {c.showCtaTitle && (
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">{c.ctaTitle}</h2>
            )}
            <Link
              href="/register"
              className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
            >
              {c.ctaButtonLabel}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
