import { AdminPageHeader } from "@/components/admin/AdminUi";
import { PlanComparison } from "@/components/admin/PlanComparison";
import { getAdminComparisonCategories } from "@/lib/db/admin";

export default async function AdminCotizadorPage() {
  const categories = await getAdminComparisonCategories();

  return (
    <>
      <div className="cotizador-admin-only">
        <AdminPageHeader
          eyebrow="Herramientas"
          title="Cotizador"
          description="Compara los planes de cada categoría (todas sus subcategorías) para armar propuestas."
        />
      </div>

      <PlanComparison categories={categories} />
    </>
  );
}
