-- Elimina ítems de sección (ya no se usan en el admin ni en el sitio)
DROP TABLE IF EXISTS "PlanSectionItem";

INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "finished_at",
    "migration_name",
    "started_at",
    "applied_steps_count"
)
SELECT
    gen_random_uuid()::text,
    '0000000000000000000000000000000000000000000000000000000000000000',
    now(),
    '20260804203100_drop_plan_section_items',
    now(),
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM "_prisma_migrations"
    WHERE "migration_name" = '20260804203100_drop_plan_section_items'
);
