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
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import { getAdminCategoryById } from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Categorías"
        title={category.title}
        description="Edita la categoría y revisa sus planes."
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminMediaForm
          action={updateCategoryAction}
          className="space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
        >
          <input type="hidden" name="id" value={category.id} />
          <AdminField label="Título" name="title" required defaultValue={category.title} />
          <AdminField
            label="Subtítulo"
            name="subtitle"
            defaultValue={category.subtitle}
          />
          <AdminRichText
            label="Descripción"
            name="description"
            defaultValue={category.description}
          />
          <MediaUploadField
            urlFieldName="coverUrl"
            kind="image"
            scope="categories"
            label="Imagen de portada"
            defaultUrl={category.coverUrl}
          />
          <AdminCheckbox
            label="Publicada"
            name="published"
            defaultChecked={category.published}
          />
          <div className="flex flex-wrap gap-3">
            <AdminMediaSubmitButton label="Guardar cambios" />
          </div>
        </AdminMediaForm>

        <div className="space-y-6">
          <section className="rounded-sm border border-primary/10 bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl italic">Planes</h2>
              <Link
                href={`/admin/planes/nuevo?categoryId=${category.id}`}
                className="text-xs uppercase tracking-[0.12em] text-primary hover:opacity-70"
              >
                Nuevo plan
              </Link>
            </div>
            <ul className="space-y-3">
              {category.plans.map((plan) => (
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
              {category.plans.length === 0 && (
                <li className="text-sm text-muted">Sin planes todavía.</li>
              )}
            </ul>
          </section>

          <div className="rounded-sm border border-accent/20 bg-background p-5">
            <p className="text-sm text-muted">
              Eliminar esta categoría también borrará todos sus planes.
            </p>
            <div className="mt-4">
              <AdminConfirmDeleteForm
                action={deleteCategoryAction}
                itemLabel={`la categoría "${category.title}"`}
                buttonLabel="Eliminar categoría"
                variant="danger"
              >
                <input type="hidden" name="id" value={category.id} />
              </AdminConfirmDeleteForm>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
