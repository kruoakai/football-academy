import "server-only";
import { prisma } from "@/lib/prisma";

export const HOMEPAGE_CONTENT_ID = "homepage";

export const HOME_CONTENT_FIELDS = [
  "heroBadge",
  "heroTitleLine1",
  "heroTitleHighlight1",
  "heroTitleLine2",
  "heroTitleHighlight2",
  "heroDescription",
  "heroCtaPrimaryLabel",
  "heroCtaSecondaryLabel",
  "heroChip1Title",
  "heroChip1Desc",
  "heroChip2Title",
  "heroChip2Desc",
  "heroChip3Title",
  "heroChip3Desc",
  "uspSectionTitle",
  "uspSectionSubtitle",
  "usp1Tag",
  "usp1Title",
  "usp1Name",
  "usp1Desc",
  "usp2Tag",
  "usp2Title",
  "usp2Name",
  "usp2Desc",
  "highlightsSectionTitle",
  "highlight1Title",
  "highlight1Desc",
  "highlight2Title",
  "highlight2Desc",
  "highlight3Title",
  "highlight3Desc",
  "programsSectionTitle",
  "programsSectionSubtitle",
  "program1Age",
  "program1Name",
  "program1Desc",
  "program2Age",
  "program2Name",
  "program2Desc",
  "program3Age",
  "program3Name",
  "program3Desc",
  "ctaTitle",
  "ctaDescription",
  "ctaButtonLabel",
  "heroTile1Label",
  "heroTile2Label",
  "heroTile3Label",
  "heroTile4Label",
] as const;

export type HomeContentField = (typeof HOME_CONTENT_FIELDS)[number];
// The video/tile *URLs* are separate from HOME_CONTENT_FIELDS/the form's
// required-text schema below: each is optional (null = show a placeholder),
// unlike every other field (including the tile labels) which is always a
// non-empty string.
export type HomeContent = Record<HomeContentField, string> & {
  heroVideoUrl: string | null;
  heroVideoEmbedUrl: string | null;
  heroTile1Url: string | null;
  heroTile2Url: string | null;
  heroTile3Url: string | null;
  heroTile4Url: string | null;
};

// Mirrors the @default() values in prisma/schema.prisma — used as a safety net
// if the singleton row hasn't been created yet (e.g. migration ran without seeding).
export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroBadge: "ยินผัน ฟุตบอล อคาเดมี",
  heroTitleLine1: "สอนโดย",
  heroTitleHighlight1: "ทีมชาติ",
  heroTitleLine2: "ฟื้นฟูโดย",
  heroTitleHighlight2: "มืออาชีพ",
  heroDescription:
    "สถาบันฟุตบอลที่ดำเนินงานโดยคู่ครองผู้เชี่ยวชาญคนละด้าน ผสานการฝึกซ้อมจากอดีตนักเตะทีมชาติ เข้ากับการดูแลฟื้นฟูร่างกายจากนักกายภาพบำบัดมืออาชีพ ในสถาบันเดียว",
  heroCtaPrimaryLabel: "สมัครเรียนวันนี้",
  heroCtaSecondaryLabel: "รู้จักเรามากขึ้น",
  heroChip1Title: "โค้ช + นักกายภาพ",
  heroChip1Desc: "ทีมงานมืออาชีพในที่เดียว",
  heroChip2Title: "ฝึกซ้อม",
  heroChip2Desc: "ทุกช่วงวัย",
  heroChip3Title: "ฟื้นฟู",
  heroChip3Desc: "คลินิกกายภาพ",
  uspSectionTitle: "สองมืออาชีพ หนึ่งเป้าหมาย",
  uspSectionSubtitle: "ความเชี่ยวชาญที่แตกต่างกัน ผสานกันเพื่อพัฒนานักเรียนอย่างรอบด้าน",
  usp1Tag: "โค้ชหลัก",
  usp1Title: "สอนโดยอดีตนักเตะทีมชาติ",
  usp1Name: "ภานุวัฒน์ ยินผัน",
  usp1Desc:
    "อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย ถ่ายทอดเทคนิคและประสบการณ์ระดับนานาชาติสู่นักเรียนทุกรุ่น",
  usp2Tag: "หัวหน้าคลินิก",
  usp2Title: "ฟื้นฟูโดยมืออาชีพ",
  usp2Name: "ผู้ร่วมก่อตั้ง / นักกายภาพบำบัด",
  usp2Desc:
    "อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม ดูแลคลินิกกายภาพและฟื้นฟูของสถาบันโดยตรง ลดความเสี่ยงบาดเจ็บและเสริมสมรรถภาพนักกีฬา",
  highlightsSectionTitle: "ทำไมต้องยินผัน ฟุตบอล อคาเดมี",
  highlight1Title: "หลักสูตรตามช่วงวัย",
  highlight1Desc: "ออกแบบการฝึกให้เหมาะกับพัฒนาการของนักเรียนแต่ละรุ่น ตั้งแต่ระดับเริ่มต้นถึงระดับแข่งขัน",
  highlight2Title: "ดูแลครบวงจร",
  highlight2Desc: "ฝึกซ้อมฟุตบอลควบคู่การประเมินร่างกายและฟื้นฟูอาการบาดเจ็บ โดยทีมงานเฉพาะทาง",
  highlight3Title: "แจ้งเตือนผ่าน LINE",
  highlight3Desc: "ตารางฝึกซ้อม การนัดหมาย และผลการเข้าเรียน แจ้งเตือนถึงผู้ปกครองแบบเรียลไทม์",
  programsSectionTitle: "คอร์สเรียนตามช่วงวัย",
  programsSectionSubtitle: "ตัวอย่างการจัดกลุ่มรุ่น — รายละเอียดคอร์สฉบับเต็มเร็วๆ นี้",
  program1Age: "6–9 ปี",
  program1Name: "เยาวชนเริ่มต้น",
  program1Desc: "ปูพื้นฐานทักษะบอลและความสนุกในการเล่น",
  program2Age: "10–13 ปี",
  program2Name: "เยาวชนพัฒนา",
  program2Desc: "พัฒนาเทคนิคเฉพาะตำแหน่งและการอ่านเกม",
  program3Age: "14–18 ปี",
  program3Name: "เยาวชนสู่ทีมชาติ",
  program3Desc: "ยกระดับสู่การแข่งขันและเตรียมความพร้อมสู่ทีมระดับสูง",
  ctaTitle: "พร้อมให้ลูกของคุณก้าวสู่สนามหญ้าแล้วหรือยัง?",
  ctaDescription: "สมัครเรียนวันนี้ พร้อมรับการดูแลจากทีมโค้ชและนักกายภาพบำบัดมืออาชีพ",
  ctaButtonLabel: "เริ่มต้นเลย",
  heroTile1Label: "เด็กเล็กฝึกทักษะ",
  heroTile2Label: "แข่งขันรุ่นเยาวชน",
  heroTile3Label: "คลินิกกายภาพ",
  heroTile4Label: "โค้ชสอนเทคนิค",
  heroVideoUrl: null,
  heroVideoEmbedUrl: null,
  heroTile1Url: null,
  heroTile2Url: null,
  heroTile3Url: null,
  heroTile4Url: null,
};

export async function getHomeContent(): Promise<HomeContent> {
  const row = await prisma.homePageContent.findUnique({ where: { id: HOMEPAGE_CONTENT_ID } });
  if (!row) return DEFAULT_HOME_CONTENT;

  const content = {
    heroVideoUrl: row.heroVideoUrl,
    heroVideoEmbedUrl: row.heroVideoEmbedUrl,
    heroTile1Url: row.heroTile1Url,
    heroTile2Url: row.heroTile2Url,
    heroTile3Url: row.heroTile3Url,
    heroTile4Url: row.heroTile4Url,
  } as HomeContent;
  for (const field of HOME_CONTENT_FIELDS) {
    content[field] = row[field];
  }
  return content;
}
