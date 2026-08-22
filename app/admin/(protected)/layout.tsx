import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSavedToast } from "@/components/admin/AdminSavedToast";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionUser, isAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const user = await getSessionUser();

  return (
    <AdminShell email={user?.email ?? null}>
      <Suspense fallback={null}>
        <AdminSavedToast />
      </Suspense>
      {children}
    </AdminShell>
  );
}
