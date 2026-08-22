import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SiteLogo } from "@/components/layout/SiteLogo";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center text-primary transition-opacity hover:opacity-60"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cream px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              Redes sociales
            </p>
            <div className="mt-4 flex justify-center gap-4 lg:justify-start">
              <SocialIcon href={siteConfig.social.instagram} label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-8 3.999 3.999 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
                </svg>
              </SocialIcon>
              <SocialIcon href={siteConfig.social.tiktok} label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </SocialIcon>
              <SocialIcon href={siteConfig.social.facebook} label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="order-1 flex flex-col items-center text-center lg:order-2">
            <SiteLogo
              size="md"
              showName
              stackedOnMobile
              nameClassName="text-primary"
            />
            <p className="mt-8 max-w-md font-display text-lg italic leading-relaxed text-primary/80">
              &ldquo;{siteConfig.footer.quote}&rdquo;
            </p>
          </div>

          <div className="order-3 flex flex-col items-center gap-3 text-center lg:items-end lg:pt-1 lg:text-right">
            <Link
              href={siteConfig.footer.privacyHref}
              className="text-xs uppercase tracking-[0.12em] text-primary transition-opacity hover:opacity-60"
            >
              {siteConfig.footer.privacyLabel}
            </Link>
            <p className="text-xs uppercase tracking-[0.1em] text-muted">
              © {year} {siteConfig.footer.copyright}
            </p>
            <Link
              href={siteConfig.footer.credits.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted transition-opacity hover:opacity-60"
            >
              {siteConfig.footer.credits.label}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
