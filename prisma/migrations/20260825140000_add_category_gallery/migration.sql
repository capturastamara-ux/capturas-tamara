-- CreateTable
CREATE TABLE "CategoryGalleryImage" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryGalleryImage_categoryId_sortOrder_idx" ON "CategoryGalleryImage"("categoryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "CategoryGalleryImage" ADD CONSTRAINT "CategoryGalleryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
