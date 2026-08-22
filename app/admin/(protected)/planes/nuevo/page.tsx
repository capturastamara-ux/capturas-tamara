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
import { AdminPriceField } from "@/components/admin/AdminPriceField";
import { CategorySubcategorySelect } from "@/components/admin/CategorySubcategorySelect";
import { createPlanAction } from "@/app/admin/actions";
import { getAdminCategoryOptions, getAdminSubcategoryOptions } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ categoryId?: string; subcategoryId?: string }>;
};

export default async function NewPlanPage({ searchParams }: PageProps) {
  const { categoryId, subcategoryId } = await searchParams;
  const [categories, subcategories] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminSubcategoryOptions(),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Planes"
        title="Nuevo plan"
        description="Después de crearlo podrás agregar secciones y galería."
      />

      {categories.length === 0 ? (
        <p className="text-sm text-muted">
          Primero crea una categoría en{" "}
          <a href="/admin/categorias/nueva" className="underline">
            Categorías
          </a>
          .
        </p>
      ) : subcategories.length === 0 ? (
        <p className="text-sm text-muted">
          Primero crea una subcategoría en{" "}
          <a href="/admin/subcategorias/nueva" className="underline">
            Subcategorías
          </a>
          .
        </p>
      ) : (
        <AdminMediaForm
          action={createPlanAction}
          className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
        >
          <CategorySubcategorySelect
            categories={categories}
            subcategories={subcategories}
            defaultCategoryId={categoryId}
            defaultSubcategoryId={subcategoryId}
          />

          <AdminField
            label="Pre título"
            name="tagline"
            placeholder="Hacemos las cosas con el corazón"
          />
          <AdminField label="Título" name="title" required placeholder="Todo Incluido" />
          <AdminPriceField label="Precio" name="price" required />
          <AdminRichText
            label="Descripción"
            name="description"
            placeholder="Describe el plan…"
          />
          <MediaUploadField
            urlFieldName="coverUrl"
            kind="image"
            scope="plans"
            label="Imagen de portada"
          />
          <AdminCheckbox label="Publicado" name="published" />
          <AdminMediaSubmitButton label="Crear plan" />
        </AdminMediaForm>
      )}
    </>
  );
}
