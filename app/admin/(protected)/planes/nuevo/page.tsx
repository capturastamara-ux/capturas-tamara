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
import { AdminPriceTierList } from "@/components/admin/AdminPriceTierList";
import { createPlanAction } from "@/app/admin/actions";
import { getAdminCategoryOptions } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function NewPlanPage({ searchParams }: PageProps) {
  const { categoryId } = await searchParams;
  const categories = await getAdminCategoryOptions();

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
      ) : (
        <AdminMediaForm
          action={createPlanAction}
          className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">
              Categoría *
            </span>
            <select
              name="categoryId"
              required
              defaultValue={categoryId ?? categories[0]?.id}
              className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <AdminField
            label="Pre título"
            name="tagline"
            placeholder="Hacemos las cosas con el corazón"
          />
          <AdminField label="Título" name="title" required placeholder="Todo Incluido" />
          <div className="sm:col-span-2">
            <AdminPriceTierList />
          </div>
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
