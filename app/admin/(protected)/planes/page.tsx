import {
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminFlashToast } from "@/components/admin/AdminFlashToast";
import { PlansByCategorySortable } from "@/components/admin/PlansByCategorySortable";
import { getAdminPlanGroups } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminPlansPage({ searchParams }: Readonly<PageProps>) {
  const { saved } = await searchParams;
  const groups = await getAdminPlanGroups();

  return (
    <>
      <AdminPageHeader
        eyebrow="Portafolio"
        title="Planes"
        description="Cada plan pertenece a una subcategoría. Arrastra dentro de cada grupo para definir el orden."
        action={{ href: "/admin/planes/nuevo", label: "Nuevo plan" }}
      />

      <AdminFlashToast
        message={saved === "plan" ? "Plan guardado correctamente." : null}
        clearPath="/admin/planes"
      />

      <PlansByCategorySortable groups={groups} />
    </>
  );
}
