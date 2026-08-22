-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Subcategory_parentId_sortOrder_idx" ON "Subcategory"("parentId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
