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
        description="Gestiona categorías, planes, reservas y cotizaciones."
      />

      <div className="mb-4 text-sm text-muted">Auth: Supabase</div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Categorías", value: stats.categories },
          { label: "Planes", value: stats.plans },
          { label: "Planes publicados", value: stats.publishedPlans },
          { label: "Reservas", value: stats.reservations },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-sm border border-primary/10 bg-background px-5 py-6"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              {item.label}
            </p>
            <p className="mt-3 font-display text-4xl italic">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/reservas"
          className="rounded-sm border border-primary/10 bg-background p-5 transition-colors hover:bg-surface"
        >
          <p className="font-display text-2xl italic">Reservas</p>
          <p className="mt-2 text-sm text-muted">Agenda de eventos y clientes.</p>
        </Link>
        <Link
          href="/admin/cotizador"
          className="rounded-sm border border-primary/10 bg-background p-5 transition-colors hover:bg-surface"
        >
          <p className="font-display text-2xl italic">Cotizador</p>
          <p className="mt-2 text-sm text-muted">Compara planes por categoría.</p>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-sm border border-primary/10 bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl italic">Categorías</h2>
            <Link
              href="/admin/categorias"
              className="text-xs uppercase tracking-[0.12em] text-muted hover:text-primary"
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
                    {category._count.plans} planes
                  </span>
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-sm text-muted">Aún no hay categorías.</li>
            )}
          </ul>
        </section>

        <section className="rounded-sm border border-primary/10 bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl italic">Planes recientes</h2>
            <Link
              href="/admin/planes"
              className="text-xs uppercase tracking-[0.12em] text-muted hover:text-primary"
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
                    <span className="text-muted">· {plan.category.title}</span>
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
