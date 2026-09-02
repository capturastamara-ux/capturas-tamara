-- CreateTable
CREATE TABLE "CatalogPrintRow" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogPrintRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogPrintRow_productId_sortOrder_idx" ON "CatalogPrintRow"("productId", "sortOrder");

-- Seed current landing prices
INSERT INTO "CatalogPrintRow" ("id", "productId", "name", "price", "sortOrder", "createdAt", "updatedAt") VALUES
('print_retablos_0', 'retablos', '10×15', 20000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_1', 'retablos', '13×18', 24000, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_2', 'retablos', '15×21', 30000, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_3', 'retablos', '20×30', 46000, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_4', 'retablos', '30×45', 72000, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_5', 'retablos', '40×60', 143000, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_6', 'retablos', '50×70', 185000, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_retablos_7', 'retablos', '60×100', 234000, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_0', 'impresiones', '10×15', 1800, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_1', 'impresiones', '13×18', 2400, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_2', 'impresiones', '15×21', 3000, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_3', 'impresiones', '20×30', 12000, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_4', 'impresiones', '30×45', 24000, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('print_impresiones_5', 'impresiones', '40×60', 37000, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
