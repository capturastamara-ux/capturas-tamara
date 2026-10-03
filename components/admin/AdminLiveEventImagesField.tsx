"use client";

import { useEffect, useId, useRef, useState } from "react";
import { deleteLiveEventDraftImageAction } from "@/app/admin/actions";
import { adminConfig } from "@/config/admin";
import { liveContentConfig } from "@/config/live-content";
import { useUploadFormTrack } from "@/components/admin/UploadFormContext";
import { useNotifyUploadingChange } from "@/components/admin/useUploadProgressTracker";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_LIMITS,
  uploadPortfolioMedia,
  validateMediaFile,
} from "@/lib/storage/media";
import { cn } from "@/lib/cn";

type AdminLiveEventImagesFieldProps = {
  defaultUrls?: string[];
};

type EditorImage = {
  key: string;
  url: string;
  persisted: boolean;
};

export function AdminLiveEventImagesField({
  defaultUrls = [],
}: Readonly<AdminLiveEventImagesFieldProps>) {
  const copy = adminConfig.liveEvents;
  const inputId = useId();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const trackUpload = useUploadFormTrack();
  const notifyUploadingChange = useNotifyUploadingChange(trackUpload);
  const [images, setImages] = useState<EditorImage[]>(() =>
    defaultUrls.map((url) => ({
      key: url,
      url,
      persisted: true,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const limits = MEDIA_LIMITS.image;

  const syncHiddenValue = (next: EditorImage[]) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(next.map((image) => image.url));
    }
  };

  useEffect(() => {
    syncHiddenValue(images);
  }, [images]);

  useEffect(() => {
    notifyUploadingChange(uploading);
  }, [notifyUploadingChange, uploading]);

  const remaining = liveContentConfig.maxImages - images.length;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setError(null);
    event.target.value = "";

    if (selected.length === 0) return;
    if (remaining <= 0) {
      setError(copy.imagesMaxError);
      return;
    }

    const valid: File[] = [];
    for (const file of selected.slice(0, remaining)) {
      const validationError = validateMediaFile(file, "image");
      if (validationError) {
        setError(validationError);
        continue;
      }
      valid.push(file);
    }

    if (selected.length > remaining) {
      setError(copy.imagesMaxError);
    }

    if (valid.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploaded: EditorImage[] = [];

    for (const [index, file] of valid.entries()) {
      setProgress(`Optimizando y subiendo ${index + 1} de ${valid.length}…`);
      const result = await uploadPortfolioMedia(
        supabase,
        file,
        "image",
        "live-events",
      );
      if (!result.ok) {
        setError(result.error);
        continue;
      }
      uploaded.push({
        key: result.url,
        url: result.url,
        persisted: false,
      });
    }

    if (uploaded.length > 0) {
      setImages((current) => {
        const next = [...current, ...uploaded].slice(
          0,
          liveContentConfig.maxImages,
        );
        syncHiddenValue(next);
        return next;
      });
    }

    setUploading(false);
    setProgress(null);
    setInputKey((current) => current + 1);
  };

  const removeImage = (image: EditorImage) => {
    setImages((current) => {
      const next = current.filter((item) => item.key !== image.key);
      syncHiddenValue(next);
      return next;
    });

    if (!image.persisted) {
      const formData = new FormData();
      formData.set("url", image.url);
      void deleteLiveEventDraftImageAction(formData);
    }
  };

  const makeFeatured = (image: EditorImage) => {
    setImages((current) => {
      const next = [
        image,
        ...current.filter((item) => item.key !== image.key),
      ];
      syncHiddenValue(next);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">
        {copy.imagesLabel}
      </span>
      <p className="text-xs text-muted/80">{copy.imagesHint}</p>
      <p className="text-xs text-muted/80">{copy.imagesFeaturedHint}</p>

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
          disabled={uploading || remaining <= 0}
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
                key={image.key}
                className="overflow-hidden rounded-sm border border-primary/10 bg-background"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`Foto ${index + 1} del evento`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-catalog px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
                      {copy.imagesFeaturedBadge}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  {index === 0 ? (
                    <span className="text-xs uppercase tracking-[0.1em] text-muted">
                      {copy.imagesFeaturedBadge}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeFeatured(image)}
                      className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                    >
                      {copy.imagesFeaturedAction}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="text-xs uppercase tracking-[0.1em] text-accent hover:opacity-70"
                  >
                    {copy.imagesRemoveLabel}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        ref={hiddenRef}
        type="hidden"
        name="imageUrls"
        defaultValue={JSON.stringify(defaultUrls)}
      />
    </div>
  );
}
