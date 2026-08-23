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
        description="Cada plan pertenece a una categoría. La subcategoría es opcional. Arrastra dentro de cada grupo para definir el orden."
        action={{ href: "/admin/planes/nuevo", label: "Nuevo plan" }}
      />

      <PlansByCategorySortable groups={groups} />
    </>
  );
}
