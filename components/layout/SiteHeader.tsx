"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  variant?: "overlay" | "solid";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const pathname = usePathname();
  const isSolid = variant === "solid";

  return (
    <header
      className={cn(
        "z-40",
        isSolid
          ? "relative border-b border-primary/10 bg-background"
          : "absolute inset-x-0 top-0",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
        <SiteLogo
          priority={pathname === "/"}
          showName
          nameClassName={isSolid ? "text-primary" : "text-white/95"}
        />

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-0.5 lg:flex xl:gap-1"
        >
          {siteConfig.nav.map((item) => {
            const [rawPath, hash] = item.href.split("#");
            const pathOnly = rawPath || "/";
            // Los enlaces de ancla (/#seccion) no se marcan como activos:
            // solo cuentan las rutas reales.
            const isActive =
              !hash &&
              (pathOnly === "/"
                ? pathname === "/"
                : pathname === pathOnly || pathname.startsWith(`${pathOnly}/`));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors xl:px-3.5 xl:text-[11px] 2xl:px-4 2xl:text-xs",
                  isSolid
                    ? "text-primary hover:bg-primary/5"
                    : "text-white hover:bg-white/10",
                  isActive &&
                    (isSolid
                      ? "border border-primary/40 bg-primary/5"
                      : "border border-white/55 bg-white/10"),
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="lg:hidden">
          <MobileDrawer theme={isSolid ? "dark" : "light"} />
        </div>
      </div>
    </header>
  );
}
