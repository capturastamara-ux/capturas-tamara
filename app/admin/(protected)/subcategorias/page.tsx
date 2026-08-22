import { AdminPageHeader } from "@/components/admin/AdminUi";
import { SubcategoriesSortableTable } from "@/components/admin/SubcategoriesSortableTable";
import { flattenTree, nestByParent } from "@/lib/admin/subcategory-tree";
import { getAdminSubcategories } from "@/lib/db/admin";

export default async function AdminSubcategoriesPage() {
  const subcategories = await getAdminSubcategories();
  const treeRows = flattenTree(nestByParent(subcategories));

  return (
    <>
      <AdminPageHeader
        eyebrow="Portafolio"
        title="Subcategorías"
        description="Puedes anidar subcategorías y poner los planes en el nivel que quieras."
        action={{ href: "/admin/subcategorias/nueva", label: "Nueva subcategoría" }}
      />

      <SubcategoriesSortableTable
        subcategories={treeRows.map((subcategory) => ({
          id: subcategory.id,
          title: subcategory.title,
          slug: subcategory.slug,
          published: subcategory.published,
          planCount: subcategory._count.plans,
          childCount: subcategory._count.children,
          categoryId: subcategory.categoryId,
          categoryTitle: subcategory.category.title,
          parentId: subcategory.parentId,
          depth: subcategory.depth,
        }))}
      />
    </>
  );
}
