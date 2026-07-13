import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { getHomeContent } from "@/lib/home-content";
import { formatThaiDate } from "@/lib/thai";

export const dynamic = "force-dynamic";

// Only verified facts go here — Footer's phone number is still a placeholder,
// so it (and a street address) are deliberately omitted until real values exist.
// Publishing placeholder contact info as structured data would mislead search engines.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: SITE_NAME,
  description: SITE_TAGLINE,
  url: SITE_URL,
};

export default async function Home() {
  const c = await getHomeContent();
  const latestArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const usps = [
    { tag: c.usp1Tag, title: c.usp1Title, name: c.usp1Name, desc: c.usp1Desc },
    { tag: c.usp2Tag, title: c.usp2Title, name: c.usp2Name, desc: c.usp2Desc },
  ];

  const highlights = [
    { title: c.highlight1Title, desc: c.highlight1Desc },
    { title: c.highlight2Title, desc: c.highlight2Desc },
    { title: c.highlight3Title, desc: c.highlight3Desc },
  ];

  const programs = [
    { age: c.program1Age, name: c.program1Name, desc: c.program1Desc },
    { age: c.program2Age, name: c.program2Name, desc: c.program2Desc },
    { age: c.program3Age, name: c.program3Name, desc: c.program3Desc },
  ];

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(90deg,white_0px,white_2px,transparent_2px,transparent_80px)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24 lg:flex-row lg:text-left lg:py-28">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
              {c.heroBadge}
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {c.heroTitleLine1}
              <span className="text-gold-400">{c.heroTitleHighlight1}</span>
              <br className="hidden sm:block" /> {c.heroTitleLine2}
              <span className="text-gold-400">{c.heroTitleHighlight2}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
              {c.heroDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
              >
                {c.heroCtaPrimaryLabel}
              </Link>
              <Link
                href="/about"
                className="flex min-h-[44px] items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                {c.heroCtaSecondaryLabel}
              </Link>
            </div>
          </div>

          <div className="flex-1">
            {c.heroImageUrl ? (
              <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl sm:max-w-md">
                <Image src={c.heroImageUrl} alt={c.heroChip1Title} fill unoptimized className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pitch-950/80 to-transparent p-5">
                  <p className="font-heading text-lg font-semibold text-gold-300">{c.heroChip1Title}</p>
                  <p className="mt-1 text-sm text-white/80">{c.heroChip1Desc}</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-md">
                <div className="col-span-2 rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="font-heading text-lg font-semibold text-gold-300">{c.heroChip1Title}</p>
                  <p className="mt-1 text-sm text-white/70">{c.heroChip1Desc}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="font-heading text-lg font-semibold text-gold-300">{c.heroChip2Title}</p>
                  <p className="mt-1 text-sm text-white/70">{c.heroChip2Desc}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="font-heading text-lg font-semibold text-gold-300">{c.heroChip3Title}</p>
                  <p className="mt-1 text-sm text-white/70">{c.heroChip3Desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USP twin pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">{c.uspSectionTitle}</h2>
          <p className="mt-2 text-neutral-600">{c.uspSectionSubtitle}</p>
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
            {c.highlightsSectionTitle}
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

      {/* Latest articles */}
      {latestArticles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">บทความล่าสุด</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {latestArticles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-pitch-300 hover:shadow-md"
              >
                {a.coverImage ? (
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={a.coverImage} alt={a.title} fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-pitch-700 to-pitch-950">
                    <span className="font-heading text-3xl font-bold text-gold-400">YP</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="text-xs text-neutral-400">
                    {a.publishedAt ? formatThaiDate(a.publishedAt) : formatThaiDate(a.createdAt)}
                  </p>
                  <h3 className="font-heading text-lg font-semibold text-pitch-900">{a.title}</h3>
                  {a.excerpt && <p className="line-clamp-2 text-sm text-neutral-600">{a.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/articles"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-pitch-300 px-6 py-3 text-base font-semibold text-pitch-700 transition hover:bg-pitch-50"
            >
              อ่านบทความทั้งหมด
            </Link>
          </div>
        </section>
      )}

      {/* Programs teaser */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
              {c.programsSectionTitle}
            </h2>
            <p className="mt-2 text-neutral-600">{c.programsSectionSubtitle}</p>
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
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">{c.ctaTitle}</h2>
          <p className="max-w-xl text-white/80">{c.ctaDescription}</p>
          <Link
            href="/register"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-pitch-950 shadow-lg transition hover:bg-gold-400"
          >
            {c.ctaButtonLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
