"use client";

import { useCallback, useState } from "react";
import { siteConfig } from "@/config/site";
import { buildPublicCotizadorPath } from "@/lib/cotizador/url";
import { printCotizador } from "@/lib/cotizador/print";

type CotizadorShareToolbarProps = {
  categorySlug: string;
  selectedPlanSlugs?: string[];
  guestCount?: number | null;
  printTargetId: string;
};

export function CotizadorShareToolbar({
  categorySlug,
  selectedPlanSlugs = [],
  guestCount = null,
  printTargetId,
}: Readonly<CotizadorShareToolbarProps>) {
  const [copied, setCopied] = useState(false);
  const publicPath = buildPublicCotizadorPath(
    categorySlug,
    selectedPlanSlugs,
    guestCount,
  );

  const handleCopy = useCallback(async () => {
    const fullUrl = `${window.location.origin}${publicPath}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [publicPath]);

  const handlePrint = useCallback(() => {
    printCotizador(printTargetId);
  }, [printTargetId]);

  return (
    <div className="cotizador-admin-only flex flex-col gap-3 rounded-sm border border-primary/10 bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
        >
          {copied ? siteConfig.cotizador.copiedLabel : siteConfig.cotizador.copyLinkLabel}
        </button>
        <a
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
        >
          {siteConfig.cotizador.openLinkLabel}
        </a>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5"
        >
          {siteConfig.cotizador.printLabel}
        </button>
      </div>
    </div>
  );
}
