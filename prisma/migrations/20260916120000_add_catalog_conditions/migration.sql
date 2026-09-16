-- CreateTable
CREATE TABLE "CatalogCondition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogCondition_sortOrder_idx" ON "CatalogCondition"("sortOrder");

-- Seed current landing conditions
INSERT INTO "CatalogCondition" ("id", "title", "body", "sortOrder", "createdAt", "updatedAt") VALUES
('cond_0', 'Galería', 'Tu galería digital privada para la selección de fotos del paquete contratado estará disponible en 24 horas máximo.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_1', 'Digital', 'El material digital seleccionado se entregará 72 horas máximo luego de la selección.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_2', 'Físico', 'El material físico se entregará 5 días después de la sesión.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_3', 'Anticipo', 'Debe reservar con el 50% del valor del paquete contratado y el otro 50% una vez finalizada la sesión.', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_4', 'Cobertura', 'Se cubre en la ciudad de Manizales y Villamaría. Si la locación es por fuera de estas, los viáticos corren por cuenta del cliente (desplazamiento, comida y hospedaje de ser el caso).', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_5', 'Fotos extra', 'Si deseas fotos impresas adicionales a las contratadas, tendrá un costo de $5.000 cada una.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_6', 'Uso de imagen', 'El material puede ser usado como parte del portafolio y contenido publicitario de la marca. En caso de no autorizar el uso del mismo, informar al fotógrafo.', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_7', 'Confirmación', 'Recuerda enviarnos un pantallazo a nuestro WhatsApp del 50% para agendar tu reserva.', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cond_8', 'Cancelación', 'En caso de cancelación por algún motivo, se puede reprogramar la sesión pero no se hará devolución de dinero, a no ser que sea un caso fortuito donde esté en juego la integridad del cliente.', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
