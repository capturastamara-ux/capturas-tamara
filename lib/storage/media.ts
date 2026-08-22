import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "media-files";

export const MEDIA_LIMITS = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    label: "5 MB",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
    accept: "image/jpeg,image/png,image/webp,image/gif",
  },
  video: {
    maxBytes: 50 * 1024 * 1024,
    label: "50 MB",
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"] as const,
    accept: "video/mp4,video/webm,video/quicktime",
  },
} as const;

export type MediaKind = keyof typeof MEDIA_LIMITS;

type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extensionForMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[mime] ?? "bin";
}

export function validateMediaFile(file: File, kind: MediaKind): string | null {
  if (!file || file.size === 0) return null;

  const limits = MEDIA_LIMITS[kind];

  if (!(limits.mimeTypes as readonly string[]).includes(file.type)) {
    const labels =
      kind === "image" ? "JPEG, PNG, WebP o GIF" : "MP4, WebM o MOV";
    return `Formato no permitido. Usa ${labels}.`;
  }

  if (file.size > limits.maxBytes) {
    return `El archivo supera el límite de ${limits.label}.`;
  }

  return null;
}

export function getPublicMediaUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export async function uploadPortfolioMedia(
  supabase: SupabaseClient,
  file: File,
  kind: MediaKind,
  scope: "categories" | "subcategories" | "plans" | "sections" | "gallery" = "plans",
): Promise<UploadResult> {
  const validationError = validateMediaFile(file, kind);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const folder = crypto.randomUUID();
  const safeName = sanitizeFileName(
    file.name || `${kind}.${extensionForMime(file.type)}`,
  );
  const path = `portfolio/${scope}/${folder}/${kind}-${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return {
      ok: false,
      error: "No se pudo subir el archivo. Verifica permisos de Storage.",
    };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return { ok: true, url: data.publicUrl, path };
}

export function mediaUrlFromFormData(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value || null;
}

export function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  try {
    return decodeURIComponent(url.slice(index + marker.length));
  } catch {
    return url.slice(index + marker.length);
  }
}

export function isStoredMediaUrl(url: string | null | undefined) {
  return Boolean(url && storagePathFromPublicUrl(url));
}

export function collectMediaUrls(
  ...groups: Array<string | null | undefined | Array<string | null | undefined>>
) {
  const urls = new Set<string>();

  for (const group of groups) {
    if (!group) continue;

    if (Array.isArray(group)) {
      for (const url of group) {
        if (url && isStoredMediaUrl(url)) urls.add(url);
      }
      continue;
    }

    if (isStoredMediaUrl(group)) urls.add(group);
  }

  return [...urls];
}

export async function deleteMediaUrls(
  supabase: SupabaseClient,
  urls: string[],
) {
  const paths = urls
    .map((url) => storagePathFromPublicUrl(url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) {
    console.error("No se pudieron eliminar archivos de Storage:", error.message);
  }
}

export function removedStorageUrls(
  previous: string | null | undefined,
  next: string | null | undefined,
): string[] {
  if (!previous || previous === next || !isStoredMediaUrl(previous)) return [];
  return [previous];
}
