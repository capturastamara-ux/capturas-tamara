import {
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { PlansByCategorySortable } from "@/components/admin/PlansByCategorySortable";
import { getAdminPlanGroups } from "@/lib/db/admin";

export default async function AdminPlansPage() {
  const groups = await getAdminPlanGroups();

  return (
    <>
      <AdminPageHeader
        eyebrow="Portafolio"
        title="Planes"
        description="Cada plan pertenece a una subcategoría. Arrastra dentro de cada grupo para definir el orden."
        action={{ href: "/admin/planes/nuevo", label: "Nuevo plan" }}
      />

      <PlansByCategorySortable groups={groups} />
    </>
  );
}
