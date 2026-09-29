import { createLiveEventAction } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
  AdminSubmitButton,
  AdminTextarea,
} from "@/components/admin/AdminUi";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { adminConfig } from "@/config/admin";
import { liveContentConfig } from "@/config/live-content";

export default function NewLiveEventPage() {
  const copy = adminConfig.liveEvents;

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.title}
        title={copy.newTitle}
        description={copy.newDescription}
      />

      <AdminForm
        action={createLiveEventAction}
        className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
      >
        <AdminReturnToField fallback={copy.href} />
        <AdminField
          label={copy.titleLabel}
          name="title"
          required
          placeholder={copy.titlePlaceholder}
        />
        <AdminTextarea
          label={copy.descriptionLabel}
          name="description"
          rows={5}
        />
        <AdminField
          label={copy.buttonLabelLabel}
          name="buttonLabel"
          placeholder={liveContentConfig.defaultButtonLabel}
        />
        <AdminField
          label={copy.buttonUrlLabel}
          name="buttonUrl"
          type="url"
          required
          placeholder={copy.buttonUrlPlaceholder}
          hint={copy.buttonUrlHint}
        />
        <AdminCheckbox
          label={copy.publishedLabel}
          name="published"
          defaultChecked
        />
        <AdminSubmitButton label={copy.createLabel} />
      </AdminForm>
    </>
  );
}
