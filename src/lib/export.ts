import "server-only";
import ExcelJS from "exceljs";

export type ExportColumn = { header: string; key: string; width?: number };

export async function toXlsxBuffer(
  sheetName: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18 }));
  rows.forEach((r) => sheet.addRow(r));
  sheet.getRow(1).font = { bold: true };
  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsvString(columns: ExportColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvEscape(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => csvEscape(r[c.key])).join(",")).join("\n");
  // Leading BOM so Excel opens the file with correct UTF-8 (Thai) encoding instead of mojibake.
  return `﻿${header}\n${body}`;
}
