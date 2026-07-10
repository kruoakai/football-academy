-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "headerBrandPrefix" TEXT NOT NULL DEFAULT 'ยินผัน ',
    "headerBrandHighlight" TEXT NOT NULL DEFAULT 'ฟุตบอล อคาเดมี',
    "headerCtaLabel" TEXT NOT NULL DEFAULT 'สมัครเรียน',
    "headerLoginLabel" TEXT NOT NULL DEFAULT 'เข้าสู่ระบบ',
    "navHomeLabel" TEXT NOT NULL DEFAULT 'หน้าแรก',
    "navAboutLabel" TEXT NOT NULL DEFAULT 'เกี่ยวกับเรา',
    "navCoursesLabel" TEXT NOT NULL DEFAULT 'คอร์สเรียน',
    "navClinicLabel" TEXT NOT NULL DEFAULT 'คลินิกกายภาพ',
    "navGalleryLabel" TEXT NOT NULL DEFAULT 'แกลเลอรี่',
    "navBlogLabel" TEXT NOT NULL DEFAULT 'บทความ',
    "navContactLabel" TEXT NOT NULL DEFAULT 'ติดต่อเรา',
    "footerBrandName" TEXT NOT NULL DEFAULT 'ยินผัน ฟุตบอล อคาเดมี',
    "footerDescription" TEXT NOT NULL DEFAULT 'สอนโดยทีมชาติ ฟื้นฟูโดยมืออาชีพ — สถาบันฟุตบอลที่ผสานการฝึกซ้อมและการดูแลร่างกายไว้ในที่เดียว',
    "footerAddress" TEXT NOT NULL DEFAULT 'สนามฝึกซ้อม ยินผัน ฟุตบอล อคาเดมี',
    "footerPhone" TEXT NOT NULL DEFAULT '0XX-XXX-XXXX',
    "footerLineId" TEXT NOT NULL DEFAULT '@yinphanacademy',
    "footerCoursesText" TEXT NOT NULL DEFAULT 'คอร์สเรียน (เร็วๆ นี้)',
    "footerClinicText" TEXT NOT NULL DEFAULT 'คลินิกกายภาพ (เร็วๆ นี้)',
    "footerFacebookText" TEXT NOT NULL DEFAULT 'Facebook (เร็วๆ นี้)',
    "footerInstagramText" TEXT NOT NULL DEFAULT 'Instagram (เร็วๆ นี้)',
    "footerCopyrightText" TEXT NOT NULL DEFAULT 'สงวนลิขสิทธิ์',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
