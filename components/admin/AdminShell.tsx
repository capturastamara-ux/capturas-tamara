"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAdmin } from "@/app/auth/actions";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/planes", label: "Planes" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/cotizador", label: "Cotizador" },
] as const;

type AdminShellProps = {
  email: string | null;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface text-primary lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-full lg:flex-row">
        <aside className="shrink-0 border-b border-primary/10 bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="shrink-0 px-6 py-6">
            <p className="font-display text-lg tracking-[0.12em]">J Montoya</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
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
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden shrink-0 border-t border-primary/10 px-6 py-5 lg:block">
            {email && (
              <p className="truncate text-xs text-muted" title={email}>
                {email}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/"
                className="text-xs uppercase tracking-[0.12em] text-primary transition-opacity hover:opacity-70"
              >
                Ver sitio
              </Link>
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.12em] text-muted transition-opacity hover:opacity-70"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64 lg:h-screen lg:overflow-y-auto">
          <header className="flex shrink-0 items-center justify-between border-b border-primary/10 bg-background px-5 py-4 lg:hidden">
            {email && <p className="truncate text-xs text-muted">{email}</p>}
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="text-xs uppercase tracking-[0.12em] text-muted"
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
