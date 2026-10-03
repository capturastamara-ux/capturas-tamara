const MAX_EDGE = 1920;
const QUALITIES = [0.72, 0.62, 0.52] as const;
const LIGHT_QUALITIES = [0.68, 0.58, 0.48] as const;

export type CompressImageOptions = {
  maxEdge?: number;
  targetBytes?: number;
};

function canCompressInBrowser() {
  return typeof window !== "undefined" && typeof createImageBitmap === "function";
}

function replaceExtension(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "") || "imagen";
  return `${base}.${extension}`;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

/**
 * Reduce tamaño y convierte a WebP en el navegador antes de subir a Storage.
 * GIF se deja igual para no perder animación.
 */
export async function compressImageForUpload(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  if (!canCompressInBrowser()) {
    return file;
  }

  const maxEdge = options.maxEdge ?? MAX_EDGE;
  const targetBytes = options.targetBytes ?? 280 * 1024;
  const qualities = options.maxEdge && options.maxEdge < MAX_EDGE
    ? LIGHT_QUALITIES
    : QUALITIES;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let best: { blob: Blob; mime: string; extension: string } | null = null;

  for (const quality of qualities) {
    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp && (!best || webp.size < best.blob.size)) {
      best = { blob: webp, mime: "image/webp", extension: "webp" };
    }
    if (best && best.blob.size <= targetBytes) break;
  }

  if (!best) {
    const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.72);
    if (jpeg) {
      best = { blob: jpeg, mime: "image/jpeg", extension: "jpg" };
    }
  }

  if (!best || best.blob.size >= file.size) {
    return file;
  }

  return new File([best.blob], replaceExtension(file.name, best.extension), {
    type: best.mime,
    lastModified: Date.now(),
  });
}
