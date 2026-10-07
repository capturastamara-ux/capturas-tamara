"use client";

import { deleteTeamMemberDraftImageAction } from "@/app/admin/actions";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { adminConfig } from "@/config/admin";

type AdminTeamPhotoFieldProps = {
  defaultUrl?: string | null;
};

export function AdminTeamPhotoField({
  defaultUrl = null,
}: Readonly<AdminTeamPhotoFieldProps>) {
  const copy = adminConfig.team;

  return (
    <MediaUploadField
      urlFieldName="photoUrl"
      kind="image"
      scope="team"
      label={copy.photoLabel}
      defaultUrl={defaultUrl}
      onClearStoredUrl={(url) => {
        const formData = new FormData();
        formData.set("url", url);
        void deleteTeamMemberDraftImageAction(formData);
      }}
    />
  );
}
