-- AlterTable
ALTER TABLE "home_page_content" ADD COLUMN     "showCtaTitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHeroBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHighlightsSectionTitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProgramsSectionSubtitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProgramsSectionTitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showUspSectionSubtitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showUspSectionTitle" BOOLEAN NOT NULL DEFAULT true;
