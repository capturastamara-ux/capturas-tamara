import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { AdminTeamPhotoField } from "@/components/admin/AdminTeamPhotoField";
import { createTeamMemberAction } from "@/app/admin/actions";
import { adminConfig } from "@/config/admin";

export default function NewTeamMemberPage() {
  const copy = adminConfig.team;

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.title}
        title={copy.newTitle}
        description={copy.newDescription}
      />

      <AdminMediaForm
        action={createTeamMemberAction}
        className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
      >
        <AdminReturnToField fallback={copy.href} />
        <AdminField
          label={copy.nameLabel}
          name="name"
          required
          placeholder={copy.namePlaceholder}
        />
        <AdminField
          label={copy.roleLabel}
          name="role"
          placeholder={copy.rolePlaceholder}
        />
        <AdminTeamPhotoField />
        <AdminField
          label={copy.photoAltLabel}
          name="photoAlt"
          placeholder={copy.photoAltPlaceholder}
          hint={copy.photoAltHint}
        />
        <AdminCheckbox
          label={copy.publishedLabel}
          name="published"
          defaultChecked
        />
        <AdminMediaSubmitButton label={copy.createLabel} />
      </AdminMediaForm>
    </>
  );
}
