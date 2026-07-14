import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "แกลเลอรี่ | ยินผัน ฟุตบอล อคาเดมี",
  description: "ภาพบรรยากาศการฝึกซ้อม กิจกรรม และคลินิกกายภาพของยินผัน ฟุตบอล อคาเดมี",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await prisma.galleryPhoto.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
            แกลเลอรี่
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
            ภาพบรรยากาศของสถาบัน
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80">
            ภาพการฝึกซ้อม การแข่งขัน และคลินิกกายภาพบำบัดของยินผัน ฟุตบอล อคาเดมี
          </p>
        </div>
      </section>

      {/* w-full is required here (not just mx-auto): this section's flex-column
          parent gives block content shrink-to-fit width by default, which is
          normally invisible for text content but collapses CSS Grid `fr`
          tracks to 0 when the grid's children (aspect-ratio + Image fill)
          have no intrinsic size of their own to break the circularity. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {photos.length > 0 ? (
          <GalleryGrid photos={photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl, caption: p.caption }))} />
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-14 text-center text-neutral-500">
            ภาพกิจกรรมจริงกำลังจะอัปเดตเร็วๆ นี้
          </div>
        )}
      </section>
    </div>
  );
}
