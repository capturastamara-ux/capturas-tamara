"use client";

import { useId, useState, useTransition } from "react";
import {
  createCategoryGalleryImagesAction,
  deleteCategoryGalleryImageAction,
} from "@/app/admin/actions";
import { useUploadFormTrack } from "@/components/admin/UploadFormContext";
import { useNotifyUploadingChange } from "@/components/admin/useUploadProgressTracker";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_LIMITS,
  uploadPortfolioMedia,
  validateMediaFile,
} from "@/lib/storage/media";
import { cn } from "@/lib/cn";

type GalleryImage = {
  id: string;
  url: string;
};

type CategoryGalleryFieldProps = {
  categoryId: string;
  images: GalleryImage[];
};

export function CategoryGalleryField({
  categoryId,
  images,
}: Readonly<CategoryGalleryFieldProps>) {
  const inputId = useId();
  const trackUpload = useUploadFormTrack();
  const notifyUploadingChange = useNotifyUploadingChange(trackUpload);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const limits = MEDIA_LIMITS.image;

  const removeImage = (image: GalleryImage) => {
    const formData = new FormData();
    formData.set("id", image.id);
    formData.set("categoryId", categoryId);
    setPendingDeleteId(image.id);
    startTransition(() => {
      void deleteCategoryGalleryImageAction(formData);
    });
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setError(null);
    event.target.value = "";

    if (selected.length === 0) return;

    const valid: File[] = [];
    for (const file of selected) {
      const validationError = validateMediaFile(file, "image");
      if (validationError) {
        setError(validationError);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setUploading(true);
    notifyUploadingChange(true);

    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const [index, file] of valid.entries()) {
      setProgress(`Optimizando y subiendo ${index + 1} de ${valid.length}…`);
      const result = await uploadPortfolioMedia(
        supabase,
        file,
        "image",
        "category-gallery",
      );
      if (!result.ok) {
        setError(result.error);
        continue;
      }
      uploadedUrls.push(result.url);
    }

    if (uploadedUrls.length > 0) {
      const formData = new FormData();
      formData.set("categoryId", categoryId);
      for (const url of uploadedUrls) {
        formData.append("url", url);
      }
      startTransition(() => {
        void createCategoryGalleryImagesAction(formData);
      });
    }

    setUploading(false);
    notifyUploadingChange(false);
    setProgress(null);
    setInputKey((current) => current + 1);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">
        Galería
      </span>
      <p className="text-xs text-muted/80">
        JPEG, PNG, WebP o GIF · máximo {limits.label} cada una · se convierte a
        WebP al subir · puedes elegir varias a la vez
      </p>

      <div
        className={cn(
          "rounded-sm border border-dashed border-primary/20 bg-surface/40 p-4 transition-colors",
          images.length > 0 && "border-primary/30 bg-surface/70",
        )}
      >
        <input
          key={inputKey}
          id={inputId}
          type="file"
          accept={limits.accept}
          multiple
          onChange={handleChange}
          disabled={uploading}
          className="block w-full text-sm text-primary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white disabled:opacity-60"
        />

        {uploading && progress && (
          <p className="mt-3 text-sm text-primary">{progress}</p>
        )}

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        {images.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="overflow-hidden rounded-sm border border-primary/10 bg-background"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`Imagen ${index + 1} de la galería`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex justify-end px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    disabled={pending && pendingDeleteId === image.id}
                    className="text-xs uppercase tracking-[0.1em] text-accent hover:opacity-70 disabled:opacity-50"
                  >
                    {pending && pendingDeleteId === image.id
                      ? "Quitando…"
                      : "Quitar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
