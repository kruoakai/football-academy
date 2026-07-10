import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/dal";
import { getReport, REPORT_TYPES, REPORT_LABELS, type ReportType } from "@/lib/reports";
import { toXlsxBuffer, toCsvString } from "@/lib/export";
import { renderReportPdf } from "@/lib/export-pdf";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  await requireRole(["ADMIN"]);
  const { type } = await params;

  if (!(REPORT_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "ไม่พบประเภทรายงานนี้" }, { status: 404 });
  }
  const reportType = type as ReportType;

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "xlsx";
  const filters = {
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    courseId: sp.get("courseId") || undefined,
    batchId: sp.get("batchId") || undefined,
    status: sp.get("status") || undefined,
  };

  const { columns, rows } = await getReport(reportType, filters);
  const title = REPORT_LABELS[reportType];
  const filenameBase = `${reportType}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    const csv = toCsvString(columns, rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const buf = await renderReportPdf(title, columns, rows);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
      },
    });
  }

  const buf = await toXlsxBuffer(title, columns, rows);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
    },
  });
}
