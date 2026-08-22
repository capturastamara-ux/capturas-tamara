import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { isAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: `${siteConfig.login.title} | ${siteConfig.name}`,
  description: siteConfig.login.subtitle,
};

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="relative overflow-x-clip bg-catalog px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div
          className="catalog-grain pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-lg text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-catalog-gold">
            Administración
          </p>
          <SectionHeading className="mt-3 font-display italic text-white">
            {siteConfig.login.title}
          </SectionHeading>
          <p className="mt-4 text-base text-white/70">
            {siteConfig.login.subtitle}
          </p>
          <div className="admin-app mt-12 rounded-sm border border-white/15 bg-white/95 p-6 text-left text-catalog-ink sm:p-8">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
