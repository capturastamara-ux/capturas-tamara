-- CreateTable
CREATE TABLE "PlanPriceTier" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanPriceTier_planId_sortOrder_idx" ON "PlanPriceTier"("planId", "sortOrder");

-- AddForeignKey
ALTER TABLE "PlanPriceTier" ADD CONSTRAINT "PlanPriceTier_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
