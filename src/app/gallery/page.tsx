import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แกลเลอรี่ | ยินผัน ฟุตบอล อคาเดมี",
  description: "ภาพบรรยากาศการฝึกซ้อม กิจกรรม และคลินิกกายภาพของยินผัน ฟุตบอล อคาเดมี",
};

// No real academy photos or an image-upload system exist yet — these are
// placeholder tiles (by category) so the page has honest, non-misleading
// content until real photos are uploaded. Swap for next/image once photos exist.
const galleryItems = [
  { label: "บรรยากาศการฝึกซ้อม", gradient: "from-pitch-700 to-pitch-950" },
  { label: "การแข่งขันกระชับมิตร", gradient: "from-pitch-600 to-pitch-900" },
  { label: "คลินิกกายภาพบำบัด", gradient: "from-pitch-800 to-pitch-950" },
  { label: "ค่ายฟุตบอลเยาวชน", gradient: "from-pitch-700 to-pitch-900" },
  { label: "กิจกรรมนักเรียน", gradient: "from-pitch-600 to-pitch-950" },
  { label: "ประเมินสภาพร่างกาย", gradient: "from-pitch-800 to-pitch-900" },
];

export default function GalleryPage() {
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
            ภาพกิจกรรมจริงกำลังจะอัปเดตเร็วๆ นี้ — ด้านล่างคือหมวดหมู่ภาพที่จะนำมาแสดง
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div
              key={item.label}
              className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${item.gradient} p-6 text-center shadow-sm`}
              role="img"
              aria-label={`ภาพตัวอย่าง: ${item.label} (รอภาพจริง)`}
            >
              <span className="font-heading text-2xl font-bold text-gold-400">YP</span>
              <span className="text-sm font-medium text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
