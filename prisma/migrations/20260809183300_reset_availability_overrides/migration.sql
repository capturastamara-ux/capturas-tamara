-- Limpia excepciones manuales de disponibilidad.
-- La regla por defecto (viernes y sábado) vive en config/reservations.ts, no en la BD.
DELETE FROM "AvailabilityOverride";
