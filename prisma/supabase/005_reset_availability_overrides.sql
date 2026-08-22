-- Ejecutar en Supabase SQL Editor si aplica migraciones a mano.
-- Restablece la agenda al horario habitual: viernes y sábado abiertos (sin excepciones).
DELETE FROM "AvailabilityOverride";
