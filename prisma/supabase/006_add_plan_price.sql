-- Ejecutar en Supabase SQL Editor si aplica migraciones a mano.
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "price" INTEGER;
