import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buttonPrimaryClass } from "@/lib/admin-ui";
import { deleteGalleryPhotoAction, toggleGalleryPhotoPublishedAction, moveGalleryPhotoAction } from "./actions";

export const metadata: Metadata = { title: "แกลเลอรี่ | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const photos = await prisma.galleryPhoto.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">แกลเลอรี่</h1>
          <p className="mt-1 text-sm text-neutral-600">
            จัดการรูปภาพในหน้า{" "}
            <Link href="/gallery" target="_blank" className="font-medium text-pitch-700 hover:underline">
              /gallery ↗
            </Link>
          </p>
        </div>
        <Link href="/admin/gallery/new" className={buttonPrimaryClass}>
          + เพิ่มรูปภาพ
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {photos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            ยังไม่มีรูปภาพในแกลเลอรี่
          </div>
        )}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-pitch-50">
              <Image src={photo.imageUrl} alt="" fill unoptimized className="object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!photo.published && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-500">
                    ไม่แสดงผล
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-neutral-600">{photo.caption || "(ไม่มีคำบรรยาย)"}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={moveGalleryPhotoAction.bind(null, photo.id, "up")}>
                <button
                  type="submit"
                  aria-label="เลื่อนขึ้น"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  ↑
                </button>
              </form>
              <form action={moveGalleryPhotoAction.bind(null, photo.id, "down")}>
                <button
                  type="submit"
                  aria-label="เลื่อนลง"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  ↓
                </button>
              </form>
              <form action={toggleGalleryPhotoPublishedAction.bind(null, photo.id)}>
                <button
                  type="submit"
                  className="flex min-h-[36px] items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  {photo.published ? "ซ่อน" : "แสดง"}
                </button>
              </form>
              <Link
                href={`/admin/gallery/${photo.id}`}
                className="flex min-h-[36px] items-center justify-center rounded-lg border border-pitch-300 px-3 text-sm font-medium text-pitch-700 hover:bg-pitch-50"
              >
                แก้ไข
              </Link>
              <form action={deleteGalleryPhotoAction.bind(null, photo.id)}>
                <button
                  type="submit"
                  className="flex min-h-[36px] items-center justify-center rounded-lg border border-red-300 px-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  ลบ
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
