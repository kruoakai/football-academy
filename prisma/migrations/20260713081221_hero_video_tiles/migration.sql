-- AlterTable: replace hero single-photo (heroImageUrl) with a training video
-- + 4 labeled photo tiles for the home page hero section
ALTER TABLE "home_page_content" DROP COLUMN "heroImageUrl";
ALTER TABLE "home_page_content" ADD COLUMN     "heroVideoUrl" TEXT,
ADD COLUMN     "heroTile1Url" TEXT,
ADD COLUMN     "heroTile1Label" TEXT NOT NULL DEFAULT 'เด็กเล็กฝึกทักษะ',
ADD COLUMN     "heroTile2Url" TEXT,
ADD COLUMN     "heroTile2Label" TEXT NOT NULL DEFAULT 'แข่งขันรุ่นเยาวชน',
ADD COLUMN     "heroTile3Url" TEXT,
ADD COLUMN     "heroTile3Label" TEXT NOT NULL DEFAULT 'คลินิกกายภาพ',
ADD COLUMN     "heroTile4Url" TEXT,
ADD COLUMN     "heroTile4Label" TEXT NOT NULL DEFAULT 'โค้ชสอนเทคนิค';
