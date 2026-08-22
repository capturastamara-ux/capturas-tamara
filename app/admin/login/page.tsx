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
      <main className="bg-surface px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Administración
          </p>
          <SectionHeading className="mt-3 font-display italic">
            {siteConfig.login.title}
          </SectionHeading>
          <p className="mt-4 text-base text-muted">{siteConfig.login.subtitle}</p>
          <div className="mt-12 text-left">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
