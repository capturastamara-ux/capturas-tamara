-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_categoryId_slug_key" ON "Subcategory"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_published_sortOrder_idx" ON "Subcategory"("categoryId", "published", "sortOrder");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing plans need a subcategory before dropping categoryId
INSERT INTO "Subcategory" ("id", "categoryId", "slug", "title", "sortOrder", "published", "createdAt", "updatedAt")
SELECT
  'sub_' || c."id",
  c."id",
  'general',
  'General',
  0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Category" c
WHERE EXISTS (
  SELECT 1 FROM "Plan" p WHERE p."categoryId" = c."id"
);

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "subcategoryId" TEXT;

UPDATE "Plan" AS p
SET "subcategoryId" = s."id"
FROM "Subcategory" AS s
WHERE s."categoryId" = p."categoryId";

DELETE FROM "Plan" WHERE "subcategoryId" IS NULL;

ALTER TABLE "Plan" ALTER COLUMN "subcategoryId" SET NOT NULL;

ALTER TABLE "Plan" DROP CONSTRAINT "Plan_categoryId_fkey";

DROP INDEX "Plan_categoryId_slug_key";

DROP INDEX "Plan_categoryId_published_sortOrder_idx";

ALTER TABLE "Plan" DROP COLUMN "categoryId";

CREATE UNIQUE INDEX "Plan_subcategoryId_slug_key" ON "Plan"("subcategoryId", "slug");

CREATE INDEX "Plan_subcategoryId_published_sortOrder_idx" ON "Plan"("subcategoryId", "published", "sortOrder");

ALTER TABLE "Plan" ADD CONSTRAINT "Plan_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "subcategoryId" TEXT;

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
