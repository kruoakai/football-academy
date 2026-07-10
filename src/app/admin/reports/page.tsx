import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getReport, REPORT_TYPES, REPORT_LABELS, type ReportType, type ReportFilters } from "@/lib/reports";
import { tableWrapClass, tableClass, thClass, tdClass, inputClass, labelClass, buttonSecondaryClass } from "@/lib/admin-ui";

export const metadata: Metadata = { title: "รายงาน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const PREVIEW_LIMIT = 50;

function isReportType(value: string | undefined): value is ReportType {
  return !!value && (REPORT_TYPES as readonly string[]).includes(value);
}

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  return sp.toString();
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    from?: string;
    to?: string;
    courseId?: string;
    batchId?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const type: ReportType = isReportType(sp.type) ? sp.type : "registrations";

  const filters: ReportFilters = {
    from: sp.from,
    to: sp.to,
    courseId: sp.courseId,
    batchId: sp.batchId,
    status: sp.status,
  };

  const [{ columns, rows }, courses, batches] = await Promise.all([
    getReport(type, filters),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.batch.findMany({ include: { course: true }, orderBy: { startDate: "desc" } }),
  ]);

  const queryString = buildQuery({ ...filters, type });
  const previewRows = rows.slice(0, PREVIEW_LIMIT);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">รายงาน</h1>
        <p className="mt-1 text-sm text-neutral-600">ดูและส่งออกรายงานเป็น Excel / CSV / PDF</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/reports?type=${t}`}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium ${
              t === type ? "border-gold-500 bg-gold-50 text-pitch-900" : "border-neutral-200 text-neutral-600"
            }`}
          >
            {REPORT_LABELS[t]}
          </Link>
        ))}
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="type" value={type} />
        {type !== "cohort" && (
          <>
            <div>
              <label className={labelClass} htmlFor="from">
                จากวันที่
              </label>
              <input id="from" name="from" type="date" defaultValue={sp.from ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="to">
                ถึงวันที่
              </label>
              <input id="to" name="to" type="date" defaultValue={sp.to ?? ""} className={inputClass} />
            </div>
          </>
        )}
        {(type === "registrations" || type === "cohort") && (
          <div>
            <label className={labelClass} htmlFor="courseId">
              คอร์ส
            </label>
            <select id="courseId" name="courseId" defaultValue={sp.courseId ?? ""} className={inputClass}>
              <option value="">ทั้งหมด</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {(type === "registrations" || type === "cohort" || type === "attendance") && (
          <div>
            <label className={labelClass} htmlFor="batchId">
              รุ่น
            </label>
            <select id="batchId" name="batchId" defaultValue={sp.batchId ?? ""} className={inputClass}>
              <option value="">ทั้งหมด</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.course.name} · {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className={buttonSecondaryClass}>
          กรอง
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <a href={`/api/reports/${type}?format=xlsx&${queryString}`} className={buttonSecondaryClass}>
          ส่งออก Excel
        </a>
        <a href={`/api/reports/${type}?format=csv&${queryString}`} className={buttonSecondaryClass}>
          ส่งออก CSV
        </a>
        <a href={`/api/reports/${type}?format=pdf&${queryString}`} className={buttonSecondaryClass}>
          ส่งออก PDF
        </a>
      </div>

      <p className="text-sm text-neutral-500">
        พบทั้งหมด {rows.length.toLocaleString()} รายการ
        {rows.length > PREVIEW_LIMIT ? ` (แสดงตัวอย่าง ${PREVIEW_LIMIT} รายการแรก — ไฟล์ที่ส่งออกจะมีครบทุกรายการ)` : ""}
      </p>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={thClass}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} className={tdClass}>
                    {String(row[c.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
            {previewRows.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={columns.length}>
                  <span className="text-neutral-400">ไม่พบข้อมูล</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
