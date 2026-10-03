-- CreateTable
CREATE TABLE "LiveEventImage" (
    "id" TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveEventImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveEventImage_liveEventId_sortOrder_idx" ON "LiveEventImage"("liveEventId", "sortOrder");

-- AddForeignKey
ALTER TABLE "LiveEventImage" ADD CONSTRAINT "LiveEventImage_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
