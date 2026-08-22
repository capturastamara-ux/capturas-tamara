"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type AdminReturnToFieldProps = {
  fallback: string;
};

function sanitizeAdminPath(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (!url.pathname.startsWith("/admin")) return null;
    url.searchParams.delete("saved");
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function AdminReturnToFieldInner({
  fallback,
}: Readonly<AdminReturnToFieldProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const [value, setValue] = useState(fromParam || fallback);

  useEffect(() => {
    if (fromParam) {
      setValue(sanitizeAdminPath(fromParam) ?? fallback);
      return;
    }

    const referrer = document.referrer;
    if (!referrer) return;

    try {
      const url = new URL(referrer);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;
      const next = sanitizeAdminPath(`${url.pathname}${url.search}`);
      if (next) setValue(next);
    } catch {
      // keep fallback
    }
  }, [fallback, fromParam, pathname]);

  return <input type="hidden" name="returnTo" value={value} />;
}

export function AdminReturnToField({
  fallback,
}: Readonly<AdminReturnToFieldProps>) {
  return (
    <Suspense fallback={<input type="hidden" name="returnTo" value={fallback} />}>
      <AdminReturnToFieldInner fallback={fallback} />
    </Suspense>
  );
}
