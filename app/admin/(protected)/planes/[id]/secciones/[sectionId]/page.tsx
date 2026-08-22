import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { deleteSectionAction, updateSectionAction } from "@/app/admin/actions";
import { getAdminSectionById } from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string; sectionId: string }>;
};

export default async function EditSectionPage({ params }: Readonly<PageProps>) {
  const { id, sectionId } = await params;
  const section = await getAdminSectionById(sectionId);

  if (section?.plan.id !== id) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow={`${section.plan.subcategory.category.title} · ${section.plan.title} · Sección`}
        title={section.title}
        description="Edita los datos de esta sección del plan."
      />

      <div className="mb-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em]">
        <Link
          href={`/admin/planes/${section.plan.id}`}
          className="text-primary hover:opacity-70"
        >
          ← Volver al plan
        </Link>
      </div>

      <div className="space-y-8">
        <div className="rounded-sm border border-primary/10 bg-background p-5 sm:p-6">
          <AdminMediaForm action={updateSectionAction} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h2 className="font-display text-2xl italic">Datos de la sección</h2>
            </div>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="planId" value={section.plan.id} />
            <AdminField label="Título" name="title" required defaultValue={section.title} />
            <AdminField label="Intro" name="intro" defaultValue={section.intro} />
            <div className="sm:col-span-2">
              <MediaUploadField
                urlFieldName="imageUrl"
                kind="image"
                scope="sections"
                label="Imagen de la sección"
                defaultUrl={section.imageUrl}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminRichText label="Nota" name="note" compact defaultValue={section.note} />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <AdminMediaSubmitButton label="Guardar sección" />
            </div>
          </AdminMediaForm>
        </div>

        <div className="rounded-sm border border-accent/20 bg-background p-5">
          <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
          <div className="mt-4">
            <AdminConfirmDeleteForm
              action={deleteSectionAction}
              itemLabel={`la sección "${section.title}"`}
              buttonLabel="Eliminar sección"
              variant="danger"
            >
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="planId" value={section.plan.id} />
            </AdminConfirmDeleteForm>
          </div>
        </div>
      </div>
    </>
  );
}
