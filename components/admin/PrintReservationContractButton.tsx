"use client";

import { useState } from "react";
import { getReservationContractAction } from "@/app/admin/actions";
import { reservationConfig } from "@/config/reservations";
import type { ReservationContractData } from "@/lib/admin/reservation-contract";
import { downloadReservationContractPdf } from "@/lib/admin/reservation-contract-pdf";
import { cn } from "@/lib/cn";

type PrintReservationContractButtonProps = {
  data?: ReservationContractData;
  reservationId?: string;
  variant?: "button" | "link";
  className?: string;
};

export function PrintReservationContractButton({
  data,
  reservationId,
  variant = "button",
  className,
}: Readonly<PrintReservationContractButtonProps>) {
  const [isPrinting, setIsPrinting] = useState(false);

  async function handleClick() {
    if (isPrinting) return;

    setIsPrinting(true);
    try {
      const contract = data ?? (reservationId ? await getReservationContractAction(reservationId) : null);
      if (contract) await downloadReservationContractPdf(contract);
    } finally {
      setIsPrinting(false);
    }
  }

  const label = isPrinting
    ? reservationConfig.contract.preparingLabel
    : reservationConfig.contract.printLabel;

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPrinting}
        className={cn(
          "inline-flex text-left text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70 disabled:opacity-50",
          className,
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPrinting}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-primary/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white disabled:opacity-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
