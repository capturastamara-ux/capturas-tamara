import { AdminPageHeader } from "@/components/admin/AdminUi";
import { CategoriesSortableTable } from "@/components/admin/CategoriesSortableTable";
import { getAdminCategories } from "@/lib/db/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminPageHeader
        eyebrow="Portafolio"
        title="Categorías"
        description="Retratos, 15 años, embarazo y cualquier categoría nueva que quieras ofrecer. Lo publicado aparece en la landing."
        action={{ href: "/admin/categorias/nueva", label: "Nueva categoría" }}
      />

      <CategoriesSortableTable
        categories={categories.map((category) => ({
          id: category.id,
          title: category.title,
          slug: category.slug,
          published: category.published,
          planCount: category._count.plans,
        }))}
      />
    </>
  );
}
