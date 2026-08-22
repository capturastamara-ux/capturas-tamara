import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { SubcategoryPlacementFields } from "@/components/admin/SubcategoryPlacementFields";
import { createSubcategoryAction } from "@/app/admin/actions";
import { getAdminCategoryOptions, getAdminSubcategoryOptions } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ categoryId?: string; parentId?: string }>;
};

export default async function NewSubcategoryPage({ searchParams }: PageProps) {
  const { categoryId, parentId } = await searchParams;
  const [categories, subcategories] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminSubcategoryOptions(),
  ]);
  const parent = parentId
    ? subcategories.find((item) => item.id === parentId)
    : undefined;

  return (
    <>
      <AdminPageHeader
        eyebrow="Subcategorías"
        title="Nueva subcategoría"
        description="Puede colgar de una categoría o de otra subcategoría. Después podrás crear planes y agregar la galería."
      />

      {categories.length === 0 ? (
        <p className="text-sm text-muted">
          Primero crea una categoría en{" "}
          <a href="/admin/categorias/nueva" className="underline">
            Categorías
          </a>
          .
        </p>
      ) : (
        <AdminMediaForm
          action={createSubcategoryAction}
          className="max-w-2xl space-y-5 rounded-sm border border-catalog/15 bg-background p-5 sm:p-6"
        >
          <AdminReturnToField fallback="/admin/subcategorias" />
          <SubcategoryPlacementFields
            categories={categories}
            subcategories={subcategories}
            defaultCategoryId={parent?.categoryId ?? categoryId}
            defaultParentId={parentId}
          />
          <AdminField label="Título" name="title" required placeholder="Estudio" />
          <AdminField
            label="Subtítulo"
            name="subtitle"
            placeholder="Sesión en estudio"
          />
          <AdminRichText
            label="Descripción"
            name="description"
            placeholder="Describe la subcategoría…"
          />
          <MediaUploadField
            urlFieldName="coverUrl"
            kind="image"
            scope="subcategories"
            label="Imagen de portada"
          />
          <AdminCheckbox label="Publicada" name="published" defaultChecked />
          <AdminMediaSubmitButton label="Crear subcategoría" />
        </AdminMediaForm>
      )}
    </>
  );
}
