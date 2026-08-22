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
import { createSubcategoryAction } from "@/app/admin/actions";
import { getAdminCategoryOptions } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function NewSubcategoryPage({ searchParams }: PageProps) {
  const { categoryId } = await searchParams;
  const categories = await getAdminCategoryOptions();

  return (
    <>
      <AdminPageHeader
        eyebrow="Subcategorías"
        title="Nueva subcategoría"
        description="Quedará dentro de una categoría. Después podrás crear planes."
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
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">
              Categoría *
            </span>
            <select
              name="categoryId"
              required
              defaultValue={categoryId ?? categories[0]?.id}
              className="rounded-sm border border-catalog/20 bg-background px-3 py-2.5 text-sm outline-none focus:border-catalog"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
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
