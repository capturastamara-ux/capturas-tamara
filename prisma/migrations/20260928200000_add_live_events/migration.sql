-- CreateTable
CREATE TABLE "LiveEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonLabel" TEXT NOT NULL,
    "buttonUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveEvent_slug_key" ON "LiveEvent"("slug");

-- CreateIndex
CREATE INDEX "LiveEvent_published_sortOrder_idx" ON "LiveEvent"("published", "sortOrder");
