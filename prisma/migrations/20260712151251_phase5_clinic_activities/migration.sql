-- CreateEnum
CREATE TYPE "ClinicActivityCategory" AS ENUM ('ASSESSMENT', 'TREATMENT', 'FIELD');

-- CreateTable
CREATE TABLE "clinic_activities" (
    "id" TEXT NOT NULL,
    "category" "ClinicActivityCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_activities_pkey" PRIMARY KEY ("id")
);
