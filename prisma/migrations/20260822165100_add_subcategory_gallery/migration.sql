-- CreateTable
CREATE TABLE "SubcategoryGalleryImage" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubcategoryGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubcategoryGalleryImage_subcategoryId_sortOrder_idx" ON "SubcategoryGalleryImage"("subcategoryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "SubcategoryGalleryImage" ADD CONSTRAINT "SubcategoryGalleryImage_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
