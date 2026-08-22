export const reservationConfig = {
  /** 0 = domingo … 6 = sábado. Todos los días abiertos por defecto. */
  defaultOpenWeekdays: [0, 1, 2, 3, 4, 5, 6] as const,
  weekdayLabels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const,
  weekdayLabelsShort: ["D", "L", "M", "M", "J", "V", "S"] as const,
  calendarStatusColors: {
    open: {
      indicator: "#16a34a",
      bg: "#ffffff",
    },
    closed: {
      indicator: "#c4bdb5",
      bg: "#f5f0eb",
    },
  },
  categoryColors: {
    bodas: {
      bg: "#1a1a1a",
      text: "#ffffff",
      ring: "#1a1a1a33",
    },
    quinceaneras: {
      bg: "#8b2635",
      text: "#ffffff",
      ring: "#8b263533",
    },
  },
  fallbackPalette: [
    { bg: "#4a5568", text: "#ffffff", ring: "#4a556833" },
    { bg: "#7c6a4f", text: "#ffffff", ring: "#7c6a4f33" },
    { bg: "#2f4858", text: "#ffffff", ring: "#2f485833" },
  ],
  form: {
    clientIdNumberLabel: "Cédula",
    guestCountLabel: "Cantidad de personas",
    planPriceLabel: "Precio",
    amountPaidLabel: "Lo que abona",
    amountRemainingLabel: "Lo que resta",
    priceHint: "Valor en pesos colombianos (COP).",
    validation: {
      phone: "El teléfono debe tener solo números (máximo 10 dígitos).",
      email: "Ingresa un correo electrónico válido.",
      clientIdNumber: "La cédula debe contener solo números (6 a 12 dígitos).",
      category: "Selecciona una categoría.",
      subcategory: "Selecciona una subcategoría.",
      plan: "Selecciona un plan.",
      guestCount: "Selecciona la cantidad de personas.",
    },
    confirm: {
      title: "Confirmar reserva",
      description: "Revisa los datos antes de registrar el evento.",
      confirmLabel: "Sí, crear reserva",
      cancelLabel: "Volver al formulario",
    },
  },
  contract: {
    printLabel: "Imprimir contrato",
    preparingLabel: "Preparando contrato…",
    documentTitle: "Contrato de prestación de servicios",
    intro:
      "Entre las partes que se identifican a continuación se celebra el presente contrato de prestación de servicios para la producción y cobertura del evento descrito.",
    providerLabel: "Prestador",
    clientLabel: "Contratante",
    eventLabel: "Evento",
    serviceLabel: "Servicio contratado",
    financialLabel: "Valores acordados",
    clausesTitle: "Cláusulas generales",
    clauses: [
      "El contratante se compromete a realizar los pagos en las fechas acordadas.",
      "Los servicios incluidos corresponden al plan seleccionado y la cantidad de personas indicada.",
      "Cualquier modificación al alcance del servicio deberá acordarse por escrito entre las partes.",
      "En caso de cancelación, aplicarán las políticas de la empresa vigentes al momento de la firma.",
    ],
    signatureProviderName: "Tamara",
    signatureProviderRole: "CapturasTamara",
    signatureClientRole: "Cliente",
    signatureLineLabel: "Firma",
    fileNamePrefix: "contrato",
  },
  email: {
    subject: (clientName: string) => `Reserva registrada: ${clientName}`,
    noReplyNotice:
      "Este correo es solo informativo. Por favor no respondas a este mensaje.",
    motto: "Captura tu mejor imagen",
    heading: "¡Reserva registrada!",
    greeting: (name: string) => `Hola ${name},`,
    intro:
      "Registramos tu reserva con estos datos. Te contactaremos para continuar la planificación.",
    detailsTitle: "Detalles de tu reserva",
    outro: "Pronto te contactaremos para continuar con la planificación de tu evento.",
    footerNote: "Con cariño, CapturasTamara",
  },
} as const;

export type CategoryColor = {
  bg: string;
  text: string;
  ring: string;
};

export function getCategoryColor(slug: string | null | undefined, index = 0): CategoryColor {
  if (slug && slug in reservationConfig.categoryColors) {
    return reservationConfig.categoryColors[
      slug as keyof typeof reservationConfig.categoryColors
    ];
  }

  const palette = reservationConfig.fallbackPalette;
  return palette[index % palette.length] ?? palette[0];
}
