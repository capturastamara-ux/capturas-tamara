"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AdminFlashToast } from "@/components/admin/AdminFlashToast";
import { adminConfig } from "@/config/admin";

const messages: Record<string, string> = {
  created: adminConfig.toast.created,
  updated: adminConfig.toast.updated,
  plan: adminConfig.toast.saved,
  section: adminConfig.toast.saved,
};

export function AdminSavedToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved");

  return (
    <AdminFlashToast
      message={saved ? (messages[saved] ?? adminConfig.toast.saved) : null}
      clearPath={pathname}
    />
  );
}
