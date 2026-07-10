import "server-only";
import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_ID = "site";

export const SITE_SETTINGS_FIELDS = [
  "headerBrandPrefix",
  "headerBrandHighlight",
  "headerCtaLabel",
  "headerLoginLabel",
  "navHomeLabel",
  "navAboutLabel",
  "navCoursesLabel",
  "navClinicLabel",
  "navGalleryLabel",
  "navBlogLabel",
  "navContactLabel",
  "footerBrandName",
  "footerDescription",
  "footerAddress",
  "footerPhone",
  "footerLineId",
  "footerCoursesText",
  "footerClinicText",
  "footerFacebookText",
  "footerInstagramText",
  "footerCopyrightText",
  "contactHours",
] as const;

export type SiteSettingsField = (typeof SITE_SETTINGS_FIELDS)[number];
export type SiteSettings = Record<SiteSettingsField, string>;

// Mirrors the @default() values in prisma/schema.prisma — used as a safety net
// if the singleton row hasn't been created yet (e.g. migration ran without seeding).
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  headerBrandPrefix: "ยินผัน ",
  headerBrandHighlight: "ฟุตบอล อคาเดมี",
  headerCtaLabel: "สมัครเรียน",
  headerLoginLabel: "เข้าสู่ระบบ",
  navHomeLabel: "หน้าแรก",
  navAboutLabel: "เกี่ยวกับเรา",
  navCoursesLabel: "คอร์สเรียน",
  navClinicLabel: "คลินิกกายภาพ",
  navGalleryLabel: "แกลเลอรี่",
  navBlogLabel: "บทความ",
  navContactLabel: "ติดต่อเรา",
  footerBrandName: "ยินผัน ฟุตบอล อคาเดมี",
  footerDescription:
    "สอนโดยทีมชาติ ฟื้นฟูโดยมืออาชีพ — สถาบันฟุตบอลที่ผสานการฝึกซ้อมและการดูแลร่างกายไว้ในที่เดียว",
  footerAddress: "สนามฝึกซ้อม ยินผัน ฟุตบอล อคาเดมี",
  footerPhone: "0XX-XXX-XXXX",
  footerLineId: "@yinphanacademy",
  footerCoursesText: "คอร์สเรียน",
  footerClinicText: "คลินิกกายภาพ",
  footerFacebookText: "Facebook (เร็วๆ นี้)",
  footerInstagramText: "Instagram (เร็วๆ นี้)",
  footerCopyrightText: "สงวนลิขสิทธิ์",
  contactHours: "จันทร์–อาทิตย์ 09:00–18:00 น.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
  if (!row) return DEFAULT_SITE_SETTINGS;

  const settings = {} as SiteSettings;
  for (const field of SITE_SETTINGS_FIELDS) {
    settings[field] = row[field];
  }
  return settings;
}
