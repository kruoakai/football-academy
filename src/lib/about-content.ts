import "server-only";
import { prisma } from "@/lib/prisma";

export const ABOUT_CONTENT_ID = "about";

export const ABOUT_CONTENT_FIELDS = [
  "heroBadge",
  "heroTitle",
  "heroDescription",
  "foundersSectionTitle",
  "foundersSectionSubtitle",
  "founder1Initials",
  "founder1Role",
  "founder1Name",
  "founder1Bio",
  "founder2Initials",
  "founder2Role",
  "founder2Name",
  "founder2Bio",
  "mission1Title",
  "mission1Desc",
  "mission2Title",
  "mission2Desc",
  "mission3Title",
  "mission3Desc",
  "ctaTitle",
  "ctaButtonLabel",
] as const;

export type AboutContentField = (typeof ABOUT_CONTENT_FIELDS)[number];

// Independent show/hide toggles — one per section, one per repeated card —
// so admins can turn parts of the about page off without losing the saved
// text underneath.
export const ABOUT_VISIBILITY_FIELDS = [
  "showHeroBadge",
  "showFoundersSection",
  "showFoundersSectionTitle",
  "showFoundersSectionSubtitle",
  "showFounder1",
  "showFounder2",
  "showMissionSection",
  "showMission1",
  "showMission2",
  "showMission3",
  "showCtaSection",
  "showCtaTitle",
] as const;

export type AboutVisibilityField = (typeof ABOUT_VISIBILITY_FIELDS)[number];

export type AboutContent = Record<AboutContentField, string> &
  Record<AboutVisibilityField, boolean> & {
    founder1PhotoUrl: string | null;
    founder2PhotoUrl: string | null;
  };

// Mirrors the @default() values in prisma/schema.prisma — used as a safety net
// if the singleton row hasn't been created yet (e.g. migration ran without seeding).
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroBadge: "เกี่ยวกับเรา",
  heroTitle: "สองความเชี่ยวชาญ หนึ่งความตั้งใจ เพื่อนักเตะรุ่นใหม่",
  heroDescription:
    "ยินผัน ฟุตบอล อคาเดมี ก่อตั้งโดยคู่ครองที่เชี่ยวชาญคนละด้าน ฝั่งหนึ่งคืออดีตนักเตะทีมชาติผู้เข้าใจเกมลูกหนังอย่างลึกซึ้ง อีกฝั่งคือนักกายภาพบำบัดมืออาชีพผู้ดูแลร่างกายนักกีฬามาแล้วนับไม่ถ้วน เราเชื่อว่าการพัฒนานักฟุตบอลที่ดี ต้องดูแลทั้งฝีเท้าและร่างกายไปพร้อมกัน",
  foundersSectionTitle: "ผู้ก่อตั้งของเรา",
  foundersSectionSubtitle: "สองมืออาชีพ สองบทบาท ในสถาบันเดียว",
  founder1Initials: "ภย",
  founder1Role: "ผู้ก่อตั้ง / หัวหน้าโค้ช",
  founder1Name: "ภานุวัฒน์ ยินผัน",
  founder1Bio:
    "อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย ผันตัวมาถ่ายทอดความรู้และประสบการณ์การเล่นในระดับนานาชาติ เพื่อปั้นนักเตะเยาวชนรุ่นใหม่ให้เติบโตอย่างถูกวิธี ทั้งด้านเทคนิค ทัศนคติ และวินัยในสนาม",
  founder2Initials: "PT",
  founder2Role: "ผู้ร่วมก่อตั้ง / หัวหน้านักกายภาพบำบัด",
  founder2Name: "ผู้ร่วมก่อตั้ง — นักกายภาพบำบัด",
  founder2Bio:
    "อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม สั่งสมประสบการณ์ดูแลนักกีฬาอาชีพ ปัจจุบันดูแลคลินิกกายภาพและฟื้นฟูของสถาบันโดยตรง เพื่อลดความเสี่ยงการบาดเจ็บและช่วยให้นักเรียนกลับมาเล่นได้อย่างปลอดภัย",
  mission1Title: "พันธกิจของเรา",
  mission1Desc: "พัฒนานักฟุตบอลเยาวชนอย่างรอบด้าน ทั้งทักษะในสนามและสุขภาพร่างกาย ภายใต้การดูแลของผู้เชี่ยวชาญจริง",
  mission2Title: "แนวทางการสอน",
  mission2Desc: "ผสานประสบการณ์จริงจากสนามแข่งขันระดับนานาชาติ เข้ากับหลักวิทยาศาสตร์การกีฬาและกายภาพบำบัด",
  mission3Title: "ดูแลครบวงจร",
  mission3Desc: "ตั้งแต่การฝึกซ้อม การประเมินร่างกาย ไปจนถึงการฟื้นฟูอาการบาดเจ็บ ในสถาบันเดียว",
  ctaTitle: "มาร่วมเป็นส่วนหนึ่งของยินผัน ฟุตบอล อคาเดมี",
  ctaButtonLabel: "สมัครเรียน",
  founder1PhotoUrl: "/images/panuwat-founder.jpg",
  founder2PhotoUrl: null,
  showHeroBadge: true,
  showFoundersSection: true,
  showFoundersSectionTitle: true,
  showFoundersSectionSubtitle: true,
  showFounder1: true,
  showFounder2: true,
  showMissionSection: true,
  showMission1: true,
  showMission2: true,
  showMission3: true,
  showCtaSection: true,
  showCtaTitle: true,
};

export async function getAboutContent(): Promise<AboutContent> {
  // src/app/about/page.tsx is force-dynamic, so this never runs at build
  // time — but a transient runtime DB outage would otherwise crash the whole
  // about page. Fall back to defaults instead, same pattern as
  // getSiteSettings() in src/lib/site-settings.ts.
  let row;
  try {
    row = await prisma.aboutPageContent.findUnique({ where: { id: ABOUT_CONTENT_ID } });
  } catch (err) {
    console.warn("getAboutContent: DB query failed, falling back to defaults.", err);
    return DEFAULT_ABOUT_CONTENT;
  }
  if (!row) return DEFAULT_ABOUT_CONTENT;

  const content = {
    founder1PhotoUrl: row.founder1PhotoUrl,
    founder2PhotoUrl: row.founder2PhotoUrl,
  } as AboutContent;
  for (const field of ABOUT_CONTENT_FIELDS) {
    content[field] = row[field];
  }
  for (const field of ABOUT_VISIBILITY_FIELDS) {
    content[field] = row[field];
  }
  return content;
}
