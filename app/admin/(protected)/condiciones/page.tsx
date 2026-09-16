import { updateCatalogConditionsAction } from "@/app/admin/actions";
import { AdminConditionsList } from "@/components/admin/AdminConditionsList";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPageHeader, AdminSubmitButton } from "@/components/admin/AdminUi";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { adminConfig } from "@/config/admin";
import { catalogConfig } from "@/config/catalog";
import { getAdminCatalogConditions } from "@/lib/db/admin";

export default async function AdminConditionsPage() {
  const copy = adminConfig.conditions;
  const rows = await getAdminCatalogConditions();
  const defaultItems =
    rows.length > 0
      ? rows.map((row) => ({ title: row.title, body: row.body }))
      : [...catalogConfig.conditions.items];

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <AdminForm action={updateCatalogConditionsAction} className="space-y-8">
        <AdminReturnToField fallback={copy.href} />

        <section className="space-y-4 rounded-sm border border-catalog/15 bg-background p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {catalogConfig.conditions.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-2xl italic text-catalog-ink">
              {catalogConfig.conditions.title}
            </h2>
          </div>
          <AdminConditionsList defaultItems={defaultItems} />
        </section>

        <AdminSubmitButton label={copy.saveLabel} />
      </AdminForm>
    </>
  );
}
