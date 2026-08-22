import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { SubcategoryGalleryField } from "@/components/admin/SubcategoryGalleryField";
import { SubcategoryPlacementFields } from "@/components/admin/SubcategoryPlacementFields";
import {
  deleteSubcategoryAction,
  updateSubcategoryAction,
} from "@/app/admin/actions";
import { descendantIdSet } from "@/lib/admin/subcategory-tree";
import {
  getAdminCategoryOptions,
  getAdminSubcategoryById,
  getAdminSubcategoryOptions,
} from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSubcategoryPage({ params }: PageProps) {
  const { id } = await params;
  const [subcategory, categories, allSubcategories] = await Promise.all([
    getAdminSubcategoryById(id),
    getAdminCategoryOptions(),
    getAdminSubcategoryOptions(),
  ]);
  if (!subcategory) notFound();

  const excludeIds = [
    subcategory.id,
    ...descendantIdSet(allSubcategories, subcategory.id),
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow={`${subcategory.category.title} · Subcategoría`}
        title={subcategory.title}
        description="Edita la subcategoría, anídala si hace falta y revisa sus planes."
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminMediaForm
          action={updateSubcategoryAction}
          className="space-y-5 rounded-sm border border-catalog/15 bg-background p-5 sm:p-6"
        >
          <input type="hidden" name="id" value={subcategory.id} />
          <SubcategoryPlacementFields
            categories={categories}
            subcategories={allSubcategories}
            defaultCategoryId={subcategory.categoryId}
            defaultParentId={subcategory.parentId}
            excludeIds={excludeIds}
          />
          <AdminField label="Título" name="title" required defaultValue={subcategory.title} />
          <AdminField
            label="Subtítulo"
            name="subtitle"
            defaultValue={subcategory.subtitle}
          />
          <AdminRichText
            label="Descripción"
            name="description"
            defaultValue={subcategory.description}
          />
          <MediaUploadField
            urlFieldName="coverUrl"
            kind="image"
            scope="subcategories"
            label="Imagen de portada"
            defaultUrl={subcategory.coverUrl}
          />
          <SubcategoryGalleryField
            subcategoryId={subcategory.id}
            images={subcategory.gallery}
          />
          <AdminCheckbox
            label="Publicada"
            name="published"
            defaultChecked={subcategory.published}
          />
          <div className="flex flex-wrap gap-3">
            <AdminMediaSubmitButton label="Guardar cambios" />
          </div>
        </AdminMediaForm>

        <div className="space-y-6">
          <section className="rounded-sm border border-catalog/15 bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-catalog-ink">
                Subcategorías hijas
              </h2>
              <Link
                href={`/admin/subcategorias/nueva?categoryId=${subcategory.categoryId}&parentId=${subcategory.id}`}
                className="text-xs uppercase tracking-[0.12em] text-catalog hover:text-catalog-ink"
              >
                Nueva hija
              </Link>
            </div>
            <ul className="space-y-3">
              {subcategory.children.map((child) => (
                <li key={child.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/subcategorias/${child.id}`}
                    className="hover:opacity-70"
                  >
                    {child.title}
                  </Link>
                  <span className="text-muted">{child._count.plans} planes</span>
                </li>
              ))}
              {subcategory.children.length === 0 && (
                <li className="text-sm text-muted">Sin subcategorías anidadas.</li>
              )}
            </ul>
          </section>

          <section className="rounded-sm border border-catalog/15 bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-catalog-ink">Planes</h2>
              <Link
                href={`/admin/planes/nuevo?subcategoryId=${subcategory.id}`}
                className="text-xs uppercase tracking-[0.12em] text-catalog hover:text-catalog-ink"
              >
                Nuevo plan
              </Link>
            </div>
            <ul className="space-y-3">
              {subcategory.plans.map((plan) => (
                <li key={plan.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/planes/${plan.id}`}
                    className="hover:opacity-70"
                  >
                    {plan.title}
                  </Link>
                  <StatusBadge published={plan.published} />
                </li>
              ))}
              {subcategory.plans.length === 0 && (
                <li className="text-sm text-muted">Sin planes todavía.</li>
              )}
            </ul>
          </section>

          <div className="rounded-sm border border-accent/20 bg-background p-5">
            <p className="text-sm text-muted">
              Eliminar esta subcategoría también borrará las que cuelgan de ella,
              sus planes y sus galerías.
            </p>
            <div className="mt-4">
              <AdminConfirmDeleteForm
                action={deleteSubcategoryAction}
                itemLabel={`la subcategoría "${subcategory.title}"`}
                buttonLabel="Eliminar subcategoría"
                variant="danger"
              >
                <input type="hidden" name="id" value={subcategory.id} />
              </AdminConfirmDeleteForm>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
