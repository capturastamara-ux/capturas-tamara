import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminForm } from "@/components/admin/AdminForm";
import {
  AdminMediaForm,
  AdminMediaScope,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { AdminFlashToast } from "@/components/admin/AdminFlashToast";
import { SectionSortableList } from "@/components/admin/SectionSortableList";
import { AdminPriceTierList } from "@/components/admin/AdminPriceTierList";
import { PlanFormSaveButton, PlanFormSaveProvider, PlanFormSaveStatusBridge } from "@/components/admin/PlanFormSaveButton";
import {
  createGalleryImageAction,
  createSectionAction,
  deleteGalleryImageAction,
  deletePlanAction,
  updatePlanAction,
} from "@/app/admin/actions";
import { CategorySubcategorySelect } from "@/components/admin/CategorySubcategorySelect";
import { getAdminCategoryOptions, getAdminPlanById, getAdminSubcategoryOptions } from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditPlanPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [plan, categories, subcategories] = await Promise.all([
    getAdminPlanById(id),
    getAdminCategoryOptions(),
    getAdminSubcategoryOptions(),
  ]);

  if (!plan) notFound();

  return (
    <>
      <AdminFlashToast
        message={saved === "section" ? "Guardado correctamente." : null}
        clearPath={`/admin/planes/${id}`}
      />

      <AdminPageHeader
        eyebrow={`${plan.subcategory.category.title} · ${plan.subcategory.title} · Plan`}
        title={plan.title}
        description="Edita el plan y administra sus secciones y galería."
      />

      <div className="mb-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em]">
        <Link
          href={`/portafolio/${plan.subcategory.category.slug}/${plan.subcategory.slug}/${plan.slug}`}
          className="text-primary hover:opacity-70"
        >
          Ver en el sitio
        </Link>
        <Link
          href={`/admin/subcategorias/${plan.subcategoryId}`}
          className="text-muted hover:opacity-70"
        >
          Ir a subcategoría
        </Link>
      </div>

      <AdminMediaScope>
        <PlanFormSaveProvider>
        <div className="space-y-8">
          <div className="rounded-sm border border-primary/10 bg-background p-5 sm:p-6">
            <AdminForm id="plan-form" action={updatePlanAction} className="space-y-5">
              <h2 className="font-display text-2xl italic">Datos del plan</h2>
              <input type="hidden" name="id" value={plan.id} />

              <CategorySubcategorySelect
                categories={categories}
                subcategories={subcategories}
                defaultCategoryId={plan.subcategory.categoryId}
                defaultSubcategoryId={plan.subcategoryId}
              />

              <AdminField label="Pre título" name="tagline" defaultValue={plan.tagline} />
              <AdminField label="Título" name="title" required defaultValue={plan.title} />
              <div className="sm:col-span-2">
                <AdminPriceTierList
                  formId="plan-form"
                  defaultTiers={plan.priceTiers.map((tier) => ({
                    id: tier.id,
                    guestCount: tier.guestCount,
                    price: tier.price,
                  }))}
                />
              </div>
              <AdminRichText
                label="Descripción"
                name="description"
                defaultValue={plan.description}
              />
              <MediaUploadField
                urlFieldName="coverUrl"
                kind="image"
                scope="plans"
                label="Imagen de portada"
                defaultUrl={plan.coverUrl}
              />
              <AdminCheckbox
                label="Publicado"
                name="published"
                defaultChecked={plan.published}
              />
              <PlanFormSaveStatusBridge />
            </AdminForm>

            <section className="mt-10 border-t border-primary/10 pt-8">
              <div>
                <h2 className="font-display text-2xl italic">Secciones</h2>
                <p className="mt-1 text-sm text-muted">
                  Banquetería, decoración, sonido, etc.
                </p>
              </div>

              <details className="group mt-5 rounded-sm border border-dashed border-primary/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface/60 [&::-webkit-details-marker]:hidden">
                  <span>Agregar nueva sección</span>
                  <span
                    aria-hidden="true"
                    className="text-base leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <AdminMediaForm
                  action={createSectionAction}
                  resetOnSuccess
                  className="grid gap-4 border-t border-dashed border-primary/20 p-5 sm:grid-cols-2"
                >
                  <input type="hidden" name="planId" value={plan.id} />
                  <AdminField label="Título" name="title" required placeholder="Decoración" />
                  <AdminField label="Intro" name="intro" placeholder="Incluye:" />
                  <div className="sm:col-span-2">
                    <MediaUploadField
                      urlFieldName="imageUrl"
                      kind="image"
                      scope="sections"
                      label="Imagen de la sección"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <AdminRichText label="Nota" name="note" compact placeholder="Nota opcional…" />
                  </div>
                  <div className="sm:col-span-2">
                    <AdminMediaSubmitButton label="Agregar sección" />
                  </div>
                </AdminMediaForm>
              </details>

              {plan.sections.length > 0 && (
                <SectionSortableList
                  planId={plan.id}
                  sections={plan.sections.map((section) => ({
                    id: section.id,
                    title: section.title,
                    imageUrl: section.imageUrl,
                    sortOrder: section.sortOrder,
                  }))}
                />
              )}
            </section>

            <section className="mt-10 border-t border-primary/10 pt-8">
              <div>
                <h2 className="font-display text-2xl italic">Galería</h2>
                <p className="mt-1 text-sm text-muted">
                  Sube imágenes del plan a Storage (máx. 5 MB c/u).
                </p>
              </div>

              <AdminMediaForm
                action={createGalleryImageAction}
                className="mt-5 rounded-sm border border-dashed border-primary/20 p-5"
              >
                <input type="hidden" name="planId" value={plan.id} />
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <MediaUploadField
                    urlFieldName="url"
                    kind="image"
                    scope="gallery"
                    label="Imagen"
                  />
                  <AdminMediaSubmitButton label="Agregar imagen" />
                </div>
              </AdminMediaForm>

              {plan.gallery.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {plan.gallery.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-sm border border-primary/10"
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={image.url}
                          alt={plan.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="flex justify-end px-3 py-3">
                        <AdminConfirmDeleteForm
                          action={deleteGalleryImageAction}
                          itemLabel="esta imagen de la galería"
                          buttonLabel="Quitar"
                          variant="link"
                        >
                          <input type="hidden" name="id" value={image.id} />
                          <input type="hidden" name="planId" value={plan.id} />
                        </AdminConfirmDeleteForm>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-10 border-t border-primary/10 pt-6">
              <PlanFormSaveButton formId="plan-form" />
            </div>
          </div>

          <div className="rounded-sm border border-accent/20 bg-background p-5">
            <p className="text-sm text-muted">
              Eliminar el plan borrará secciones y galería.
            </p>
            <div className="mt-4">
              <AdminConfirmDeleteForm
                action={deletePlanAction}
                itemLabel={`el plan "${plan.title}"`}
                buttonLabel="Eliminar plan"
                variant="danger"
              >
                <input type="hidden" name="id" value={plan.id} />
              </AdminConfirmDeleteForm>
            </div>
          </div>
        </div>
        </PlanFormSaveProvider>
      </AdminMediaScope>
    </>
  );
}
