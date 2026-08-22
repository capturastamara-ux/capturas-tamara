import { redirect } from "next/navigation";

export type AdminSavedFlag = "created" | "updated";

function isSafeAdminPath(value: string) {
  if (!value.startsWith("/admin")) return false;
  if (value.startsWith("//") || value.includes("://")) return false;
  if (value.includes("\\")) return false;
  return true;
}

export function parseAdminReturnTo(
  formData: FormData,
  fallback: string,
) {
  const raw = String(formData.get("returnTo") ?? "").trim();
  if (!raw || !isSafeAdminPath(raw)) return fallback;

  try {
    const url = new URL(raw, "http://local.invalid");
    if (!url.pathname.startsWith("/admin")) return fallback;
    url.searchParams.delete("saved");
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function withSavedQuery(path: string, saved: AdminSavedFlag) {
  const url = new URL(path, "http://local.invalid");
  url.searchParams.set("saved", saved);
  return `${url.pathname}${url.search}`;
}

export function redirectAfterSave(
  formData: FormData,
  fallback: string,
  saved: AdminSavedFlag,
): never {
  redirect(withSavedQuery(parseAdminReturnTo(formData, fallback), saved));
}
