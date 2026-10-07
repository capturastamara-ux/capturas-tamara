import { notFound } from "next/navigation";
import {
  AdminCheckbox,
  AdminField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import {
  AdminMediaForm,
  AdminMediaSubmitButton,
} from "@/components/admin/UploadFormContext";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { AdminTeamPhotoField } from "@/components/admin/AdminTeamPhotoField";
import {
  deleteTeamMemberAction,
  updateTeamMemberAction,
} from "@/app/admin/actions";
import { adminConfig } from "@/config/admin";
import { getAdminTeamMemberById } from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getAdminTeamMemberById(id);
  if (!member) notFound();

  const copy = adminConfig.team;

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.title}
        title={member.name}
        description={copy.description}
      />

      <AdminMediaForm
        action={updateTeamMemberAction}
        className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
      >
        <input type="hidden" name="id" value={member.id} />
        <AdminReturnToField fallback={copy.href} />
        <AdminField
          label={copy.nameLabel}
          name="name"
          required
          defaultValue={member.name}
        />
        <AdminField
          label={copy.roleLabel}
          name="role"
          defaultValue={member.role ?? ""}
        />
        <AdminTeamPhotoField defaultUrl={member.photoUrl} />
        <AdminField
          label={copy.photoAltLabel}
          name="photoAlt"
          defaultValue={member.photoAlt ?? ""}
          placeholder={copy.photoAltPlaceholder}
          hint={copy.photoAltHint}
        />
        <AdminCheckbox
          label={copy.publishedLabel}
          name="published"
          defaultChecked={member.published}
        />
        <AdminMediaSubmitButton label={copy.saveLabel} />
      </AdminMediaForm>

      <div className="mt-8 max-w-2xl rounded-sm border border-accent/20 bg-background p-5">
        <p className="text-sm text-muted">{copy.deleteHint}</p>
        <div className="mt-4">
          <AdminConfirmDeleteForm
            action={deleteTeamMemberAction}
            itemLabel={`el perfil de "${member.name}"`}
            buttonLabel={copy.deleteLabel}
            variant="danger"
          >
            <input type="hidden" name="id" value={member.id} />
          </AdminConfirmDeleteForm>
        </div>
      </div>
    </>
  );
}
