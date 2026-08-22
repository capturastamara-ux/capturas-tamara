"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_LIMITS,
  uploadPortfolioMedia,
  validateMediaFile,
  type MediaKind,
} from "@/lib/storage/media";
import { useUploadFormTrack } from "@/components/admin/UploadFormContext";
import { useNotifyUploadingChange } from "@/components/admin/useUploadProgressTracker";
import { cn } from "@/lib/cn";

type MediaScope = "categories" | "plans" | "sections" | "gallery";

type MediaUploadFieldProps = {
  urlFieldName: string;
  kind: MediaKind;
  scope?: MediaScope;
  label: string;
  helper?: string;
  defaultUrl?: string | null;
  onUploadingChange?: (uploading: boolean) => void;
};

export function MediaUploadField({
  urlFieldName,
  kind,
  scope = "plans",
  label,
  helper,
  defaultUrl = null,
  onUploadingChange,
}: MediaUploadFieldProps) {
  const inputId = useId();
  const trackUpload = useUploadFormTrack();
  const notifyUploadingChange = useNotifyUploadingChange(
    onUploadingChange ?? trackUpload,
  );
  const limits = MEDIA_LIMITS[kind];
  const defaultHelper =
    kind === "image"
      ? `JPEG, PNG, WebP o GIF · máximo ${limits.label}`
      : `MP4, WebM o MOV · máximo ${limits.label}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(defaultUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    const nextUrl = defaultUrl ?? "";
    setUploadedUrl(nextUrl);
    setPreviewUrl(nextUrl || null);
    setFile(null);
    setError(null);
  }, [defaultUrl]);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleReset = () => {
      setFile(null);
      setError(null);
      setUploadedUrl(defaultUrl ?? "");
      setPreviewUrl(defaultUrl ?? null);
      setInputKey((current) => current + 1);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultUrl]);

  useEffect(() => {
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [file]);

  useEffect(() => {
    notifyUploadingChange(uploading);
  }, [notifyUploadingChange, uploading]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);

    if (!selected) return;

    const validationError = validateMediaFile(selected, kind);
    if (validationError) {
      setError(validationError);
      setFile(null);
      event.target.value = "";
      return;
    }

    setFile(selected);
    setUploading(true);

    const supabase = createClient();
    const result = await uploadPortfolioMedia(supabase, selected, kind, scope);

    setUploading(false);

    if (!result.ok) {
      setError(result.error);
      setFile(null);
      setPreviewUrl(defaultUrl ?? null);
      setUploadedUrl(defaultUrl ?? "");
      event.target.value = "";
      return;
    }

    setUploadedUrl(result.url);
    setPreviewUrl(result.url);
    event.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setUploadedUrl("");
    setPreviewUrl(null);
    setInputKey((current) => current + 1);
  };

  const hasStoredMedia = Boolean(uploadedUrl);

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <input type="hidden" name={urlFieldName} value={uploadedUrl} readOnly />

      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <p className="text-xs text-muted/80">{helper ?? defaultHelper}</p>

      <div
        className={cn(
          "rounded-sm border border-dashed border-primary/20 bg-surface/40 p-4 transition-colors",
          hasStoredMedia && "border-primary/30 bg-surface/70",
        )}
      >
        <input
          key={inputKey}
          id={inputId}
          type="file"
          accept={limits.accept}
          onChange={handleChange}
          disabled={uploading}
          className="block w-full text-sm text-primary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white disabled:opacity-60"
        />

        {uploading && (
          <p className="mt-3 text-sm text-primary">Subiendo a Storage…</p>
        )}

        {file && !uploading && (
          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">{file.name}</p>
              <p className="text-xs text-muted">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · máx. {limits.label}
              </p>
              {uploadedUrl && (
                <p className="mt-1 text-xs text-primary/70">Archivo listo en Storage</p>
              )}
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="shrink-0 text-xs uppercase tracking-[0.08em] text-muted transition-colors hover:text-accent"
            >
              Quitar
            </button>
          </div>
        )}

        {!file && hasStoredMedia && !uploading && (
          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="text-sm text-muted">Archivo actual guardado en Storage.</p>
            <button
              type="button"
              onClick={clearFile}
              className="shrink-0 text-xs uppercase tracking-[0.08em] text-muted transition-colors hover:text-accent"
            >
              Quitar
            </button>
          </div>
        )}

        {previewUrl && kind === "image" && !uploading && (
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-sm border border-primary/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {previewUrl && kind === "video" && !uploading && (
          <video
            src={previewUrl}
            controls
            className="mt-4 max-h-56 w-full rounded-sm border border-primary/10 bg-primary/5"
          />
        )}

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      </div>
    </div>
  );
}
