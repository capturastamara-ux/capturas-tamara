"use client";

import { siteConfig } from "@/config/site";
import { printCotizador } from "@/lib/cotizador/print";

type CotizadorPrintButtonProps = {
  printTargetId: string;
};

export function CotizadorPrintButton({
  printTargetId,
}: Readonly<CotizadorPrintButtonProps>) {
  return (
    <button
      type="button"
      onClick={() => printCotizador(printTargetId)}
      className="rounded-full border border-primary/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
    >
      {siteConfig.cotizador.printLabel}
    </button>
  );
}
