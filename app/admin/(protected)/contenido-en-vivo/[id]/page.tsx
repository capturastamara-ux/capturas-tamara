import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteLiveEventAction,
  updateLiveEventAction,
} from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminLiveEventImagesField } from "@/components/admin/AdminLiveEventImagesField";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
  AdminTextarea,
} from "@/components/admin/AdminUi";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { adminConfig } from "@/config/admin";
import { liveContentConfig, liveEventPath } from "@/config/live-content";
import { siteConfig } from "@/config/site";
import { getAdminLiveEventById } from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLiveEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getAdminLiveEventById(id);
  if (!event) notFound();

  const copy = adminConfig.liveEvents;
  const publicPath = liveEventPath(event.slug);
  const publicUrl = `${siteConfig.url}${publicPath}`;

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.title}
        title={event.title}
        description={copy.description}
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminMediaForm
          action={updateLiveEventAction}
          className="space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
        >
          <input type="hidden" name="id" value={event.id} />
          <AdminReturnToField fallback={copy.href} />
          <AdminField
            label={copy.titleLabel}
            name="title"
            required
            defaultValue={event.title}
            placeholder={copy.titlePlaceholder}
          />
          <AdminTextarea
            label={copy.descriptionLabel}
            name="description"
            rows={5}
            defaultValue={event.description}
          />
          <AdminLiveEventImagesField
            defaultUrls={event.images.map((image) => image.url)}
          />
          <AdminField
            label={copy.buttonLabelLabel}
            name="buttonLabel"
            defaultValue={event.buttonLabel}
            placeholder={liveContentConfig.defaultButtonLabel}
          />
          <AdminField
            label={copy.buttonUrlLabel}
            name="buttonUrl"
            type="url"
            required
            defaultValue={event.buttonUrl}
            placeholder={copy.buttonUrlPlaceholder}
            hint={copy.buttonUrlHint}
          />
          <AdminCheckbox
            label={copy.publishedLabel}
            name="published"
            defaultChecked={event.published}
          />
          <AdminMediaSubmitButton label={copy.saveLabel} />
        </AdminMediaForm>

        <div className="space-y-6">
          <section className="rounded-sm border border-primary/10 bg-background p-5">
            <h2 className="font-display text-2xl italic text-catalog-ink">
              {copy.publicLinkLabel}
            </h2>
            <p className="mt-3 break-all text-sm text-muted">{publicUrl}</p>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-xs uppercase tracking-[0.12em] text-primary hover:opacity-70"
            >
              {copy.openPublicLabel}
            </Link>
          </section>

          <div className="rounded-sm border border-accent/20 bg-background p-5">
            <p className="text-sm text-muted">{copy.deleteHint}</p>
            <div className="mt-4">
              <AdminConfirmDeleteForm
                action={deleteLiveEventAction}
                itemLabel={`el evento "${event.title}"`}
                buttonLabel={copy.deleteLabel}
                variant="danger"
              >
                <input type="hidden" name="id" value={event.id} />
              </AdminConfirmDeleteForm>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
