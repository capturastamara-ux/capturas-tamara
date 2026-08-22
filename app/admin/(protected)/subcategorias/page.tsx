import { AdminPageHeader } from "@/components/admin/AdminUi";
import { SubcategoriesSortableTable } from "@/components/admin/SubcategoriesSortableTable";
import { getAdminSubcategories } from "@/lib/db/admin";

export default async function AdminSubcategoriesPage() {
  const subcategories = await getAdminSubcategories();

  return (
    <>
      <AdminPageHeader
        eyebrow="Portafolio"
        title="Subcategorías"
        description="Cada categoría se divide en subcategorías. Los planes viven dentro de una subcategoría."
        action={{ href: "/admin/subcategorias/nueva", label: "Nueva subcategoría" }}
      />

      <SubcategoriesSortableTable
        subcategories={subcategories.map((subcategory) => ({
          id: subcategory.id,
          title: subcategory.title,
          slug: subcategory.slug,
          published: subcategory.published,
          planCount: subcategory._count.plans,
          categoryTitle: subcategory.category.title,
        }))}
      />
    </>
  );
}
