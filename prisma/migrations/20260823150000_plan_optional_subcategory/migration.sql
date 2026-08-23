-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "categoryId" TEXT;

UPDATE "Plan" AS plan
SET "categoryId" = subcategory."categoryId"
FROM "Subcategory" AS subcategory
WHERE plan."subcategoryId" = subcategory."id";

ALTER TABLE "Plan" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Plan" ALTER COLUMN "subcategoryId" DROP NOT NULL;

DROP INDEX "Plan_subcategoryId_slug_key";
DROP INDEX "Plan_subcategoryId_published_sortOrder_idx";

-- Slug único por subcategoría (como antes). En planes solo de categoría,
-- el índice parcial evita slugs duplicados dentro de la misma categoría.
CREATE UNIQUE INDEX "Plan_subcategoryId_slug_key" ON "Plan"("subcategoryId", "slug");
CREATE UNIQUE INDEX "Plan_categoryId_slug_category_level_key" ON "Plan"("categoryId", "slug") WHERE "subcategoryId" IS NULL;
CREATE INDEX "Plan_categoryId_published_sortOrder_idx" ON "Plan"("categoryId", "published", "sortOrder");
CREATE INDEX "Plan_subcategoryId_published_sortOrder_idx" ON "Plan"("subcategoryId", "published", "sortOrder");

ALTER TABLE "Plan" ADD CONSTRAINT "Plan_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
