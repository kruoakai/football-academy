-- AlterTable: replace articles.author_name (plain text) with author_id (FK to users)
ALTER TABLE "articles" ADD COLUMN "authorId" TEXT;
ALTER TABLE "articles" DROP COLUMN "authorName";

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
