import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buttonPrimaryClass } from "@/lib/admin-ui";
import {
  deleteClinicActivityAction,
  toggleClinicActivityPublishedAction,
  moveClinicActivityAction,
} from "./actions";

export const metadata: Metadata = { title: "กิจกรรมคลินิก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  ASSESSMENT: "ตรวจประเมิน",
  TREATMENT: "รักษาในคลินิก",
  FIELD: "ดูแลข้างสนาม",
};

const CATEGORY_ORDER = ["ASSESSMENT", "TREATMENT", "FIELD"] as const;

export default async function AdminClinicActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category && CATEGORY_ORDER.includes(category as (typeof CATEGORY_ORDER)[number])
    ? category
    : undefined;

  const activities = await prisma.clinicActivity.findMany({
    where: activeCategory ? { category: activeCategory as never } : undefined,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">กิจกรรมคลินิก</h1>
          <p className="mt-1 text-sm text-neutral-600">
            จัดการรูปและข้อความส่วน &quot;กิจกรรมคลินิกกายภาพและการบำบัดภาคสนาม&quot; ในหน้า{" "}
            <Link href="/clinic" target="_blank" className="font-medium text-pitch-700 hover:underline">
              /clinic ↗
            </Link>
          </p>
        </div>
        <Link href="/admin/clinic-activities/new" className={buttonPrimaryClass}>
          + เพิ่มกิจกรรม
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/clinic-activities"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            !activeCategory ? "bg-pitch-700 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          ทั้งหมด
        </Link>
        {CATEGORY_ORDER.map((cat) => (
          <Link
            key={cat}
            href={`/admin/clinic-activities?category=${cat}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === cat
                ? "bg-pitch-700 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {activities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            ยังไม่มีกิจกรรมในหมวดนี้
          </div>
        )}
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-pitch-50">
              {activity.imageUrl && (
                <Image src={activity.imageUrl} alt="" fill unoptimized className="object-cover" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pitch-50 px-2.5 py-0.5 text-xs font-semibold text-pitch-700">
                  {CATEGORY_LABELS[activity.category]}
                </span>
                {!activity.published && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-500">
                    ไม่แสดงผล
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium text-pitch-900">{activity.title}</p>
              <p className="line-clamp-1 text-sm text-neutral-500">{activity.caption}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={moveClinicActivityAction.bind(null, activity.id, "up")}>
                <button
                  type="submit"
                  aria-label="เลื่อนขึ้น"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  ↑
                </button>
              </form>
              <form action={moveClinicActivityAction.bind(null, activity.id, "down")}>
                <button
                  type="submit"
                  aria-label="เลื่อนลง"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  ↓
                </button>
              </form>
              <form action={toggleClinicActivityPublishedAction.bind(null, activity.id)}>
                <button
                  type="submit"
                  className="flex min-h-[36px] items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  {activity.published ? "ซ่อน" : "แสดง"}
                </button>
              </form>
              <Link
                href={`/admin/clinic-activities/${activity.id}`}
                className="flex min-h-[36px] items-center justify-center rounded-lg border border-pitch-300 px-3 text-sm font-medium text-pitch-700 hover:bg-pitch-50"
              >
                แก้ไข
              </Link>
              <form action={deleteClinicActivityAction.bind(null, activity.id)}>
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
