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
import { createCategoryAction } from "@/app/admin/actions";

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Categorías"
        title="Nueva categoría"
        description="Se mostrará en /portafolio cuando esté publicada."
      />

      <AdminMediaForm
        action={createCategoryAction}
        className="max-w-2xl space-y-5 rounded-sm border border-primary/10 bg-background p-5 sm:p-6"
      >
        <AdminField label="Título" name="title" required placeholder="Bodas" />
        <AdminField
          label="Subtítulo"
          name="subtitle"
          placeholder="Celebraciones con intención"
        />
        <AdminRichText
          label="Descripción"
          name="description"
          placeholder="Describe la categoría…"
        />
        <MediaUploadField
          urlFieldName="coverUrl"
          kind="image"
          scope="categories"
          label="Imagen de portada"
        />
        <AdminCheckbox label="Publicada" name="published" defaultChecked />
        <AdminMediaSubmitButton label="Crear categoría" />
      </AdminMediaForm>
    </>
  );
}
