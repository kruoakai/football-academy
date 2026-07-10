export const THAI_DAY_NAMES = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export function thaiDayName(date: Date): string {
  return THAI_DAY_NAMES[date.getDay()];
}

export function formatThaiDate(date: Date): string {
  return date.toLocaleDateString("th-TH", { dateStyle: "medium" });
}

export function formatThaiDateTime(date: Date): string {
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}
