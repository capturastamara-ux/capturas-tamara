import { updateCatalogPrintRowsAction } from "@/app/admin/actions";
import { AdminKitPriceList } from "@/components/admin/AdminKitPriceList";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPageHeader, AdminSubmitButton } from "@/components/admin/AdminUi";
import { AdminPrintPriceList } from "@/components/admin/AdminPrintPriceList";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { adminConfig } from "@/config/admin";
import { catalogConfig } from "@/config/catalog";
import { catalogKitProduct, catalogPrintProductIds } from "@/lib/admin/form";
import { getAdminCatalogPrintRows } from "@/lib/db/admin";

export default async function AdminPrintListsPage() {
  const copy = adminConfig.printLists;
  const kitProduct = catalogKitProduct();
  const rows = await getAdminCatalogPrintRows();
  const rowsByProduct = new Map<string, Array<{ name: string; price: number }>>();

  for (const row of rows) {
    const current = rowsByProduct.get(row.productId) ?? [];
    current.push({ name: row.name, price: row.price });
    rowsByProduct.set(row.productId, current);
  }

  const kitRows = rowsByProduct.get(kitProduct.id) ?? [];

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

        {catalogPrintProductIds().map((productId) => {
          const product = catalogConfig.products.find((item) => item.id === productId);
          if (!product) return null;
          return (
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
          );
        })}

        <section className="space-y-4 rounded-sm border border-catalog/15 bg-background p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {kitProduct.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-2xl italic text-catalog-ink">
              {kitProduct.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{kitProduct.subtitle}</p>
            <p className="mt-2 text-xs text-muted/90">
              {adminConfig.kit.contentHint}
            </p>
          </div>
          <AdminKitPriceList
            productId={kitProduct.id}
            defaultRows={
              kitRows.length > 0
                ? kitRows
                : kitProduct.rows.map((row) => ({
                    name: row.size,
                    price: row.price,
                  }))
            }
          />
        </section>

        <AdminSubmitButton label={copy.saveLabel} />
      </AdminForm>
    </>
  );
}
