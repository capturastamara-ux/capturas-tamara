"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAdmin } from "@/app/auth/actions";
import { siteConfig } from "@/config/site";
import { adminConfig } from "@/config/admin";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/subcategorias", label: "Subcategorías" },
  { href: "/admin/planes", label: "Planes" },
  { href: adminConfig.printLists.href, label: adminConfig.printLists.navLabel },
  { href: "/admin/reservas", label: "Reservas" },
] as const;

type AdminShellProps = {
  email: string | null;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="admin-app min-h-screen bg-surface text-catalog-ink lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-full lg:flex-row">
        <aside className="shrink-0 border-b border-white/10 bg-catalog lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="shrink-0 px-6 py-6">
            <p className="font-display text-lg tracking-[0.12em] text-white">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-catalog-gold">
              Administración
            </p>
          </div>

          <nav
            aria-label="Admin"
            className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3 lg:pb-0"
          >
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-sm px-3 py-2 text-xs uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "bg-catalog-gold text-catalog-ink"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden shrink-0 border-t border-white/15 px-6 py-5 lg:block">
            {email && (
              <p className="truncate text-xs text-white/55" title={email}>
                {email}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/"
                className="text-xs uppercase tracking-[0.12em] text-catalog-gold transition-opacity hover:opacity-80"
              >
                Ver sitio
              </Link>
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.12em] text-white/60 transition-opacity hover:text-white"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64 lg:h-screen lg:overflow-y-auto">
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-catalog px-5 py-4 lg:hidden">
            {email && <p className="truncate text-xs text-white/70">{email}</p>}
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="text-xs uppercase tracking-[0.12em] text-catalog-gold"
              >
                Salir
              </button>
            </form>
          </header>
          <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
