import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { getAdminDashboardStats, getAdminCategories, getAdminPlans } from "@/lib/db/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const categories = await getAdminCategories();
  const plans = await getAdminPlans();

  return (
    <>
      <AdminPageHeader
        eyebrow="Panel"
        title="Inicio"
        description="Gestiona categorías, subcategorías, planes y reservas."
      />

      <div className="mb-4 text-sm text-muted">Auth: Supabase</div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Categorías", value: stats.categories },
          { label: "Subcategorías", value: stats.subcategories },
          { label: "Planes", value: stats.plans },
          { label: "Reservas", value: stats.reservations },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-sm border border-catalog/15 bg-background px-5 py-6"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              {item.label}
            </p>
            <p className="mt-3 font-display text-4xl italic text-catalog-ink">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/reservas"
          className="rounded-sm border border-catalog/15 bg-background p-5 transition-colors hover:border-catalog/30 hover:bg-cream"
        >
          <p className="font-display text-2xl italic text-catalog-ink">Reservas</p>
          <p className="mt-2 text-sm text-muted">Agenda de eventos y clientes.</p>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-sm border border-catalog/15 bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-catalog-ink">
              Categorías
            </h2>
            <Link
              href="/admin/categorias"
              className="text-xs uppercase tracking-[0.12em] text-catalog hover:text-catalog-ink"
            >
              Ver todas
            </Link>
          </div>
          <ul className="space-y-3">
            {categories.slice(0, 5).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/admin/categorias/${category.id}`}
                  className="flex items-center justify-between gap-3 text-sm transition-opacity hover:opacity-70"
                >
                  <span>{category.title}</span>
                  <span className="text-muted">
                    {category._count.subcategories} subcategorías
                  </span>
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-sm text-muted">Aún no hay categorías.</li>
            )}
          </ul>
        </section>

        <section className="rounded-sm border border-catalog/15 bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-catalog-ink">
              Planes recientes
            </h2>
            <Link
              href="/admin/planes"
              className="text-xs uppercase tracking-[0.12em] text-catalog hover:text-catalog-ink"
            >
              Ver todos
            </Link>
          </div>
          <ul className="space-y-3">
            {plans.slice(0, 5).map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/admin/planes/${plan.id}`}
                  className="flex items-center justify-between gap-3 text-sm transition-opacity hover:opacity-70"
                >
                  <span>
                    {plan.title}{" "}
                    <span className="text-muted">
                      · {plan.subcategory.category.title} / {plan.subcategory.title}
                    </span>
                  </span>
                  <span className="text-muted">
                    {plan.published ? "Publicado" : "Borrador"}
                  </span>
                </Link>
              </li>
            ))}
            {plans.length === 0 && (
              <li className="text-sm text-muted">Aún no hay planes.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
