import { updateCatalogPrintRowsAction } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPageHeader, AdminSubmitButton } from "@/components/admin/AdminUi";
import { AdminPrintPriceList } from "@/components/admin/AdminPrintPriceList";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { adminConfig } from "@/config/admin";
import { catalogConfig } from "@/config/catalog";
import { getAdminCatalogPrintRows } from "@/lib/db/admin";

export default async function AdminPrintListsPage() {
  const copy = adminConfig.printLists;
  const rows = await getAdminCatalogPrintRows();
  const rowsByProduct = new Map<string, Array<{ name: string; price: number }>>();

  for (const row of rows) {
    const current = rowsByProduct.get(row.productId) ?? [];
    current.push({ name: row.name, price: row.price });
    rowsByProduct.set(row.productId, current);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <AdminForm
        action={updateCatalogPrintRowsAction}
        className="space-y-8"
      >
        <AdminReturnToField fallback={copy.href} />

        {catalogConfig.products.map((product) => (
          <section
            key={product.id}
            className="space-y-4 rounded-sm border border-catalog/15 bg-background p-5 sm:p-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                {product.eyebrow}
              </p>
              <h2 className="mt-1 font-display text-2xl italic text-catalog-ink">
                {product.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{product.subtitle}</p>
            </div>
            <AdminPrintPriceList
              productId={product.id}
              defaultRows={
                rowsByProduct.get(product.id) ??
                product.rows.map((row) => ({ name: row.size, price: row.price }))
              }
            />
          </section>
        ))}

        <AdminSubmitButton label={copy.saveLabel} />
      </AdminForm>
    </>
  );
}
