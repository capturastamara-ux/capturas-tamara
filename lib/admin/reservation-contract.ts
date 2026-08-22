export type ReservationContractData = {
  clientName: string;
  clientIdNumber: string | null;
  clientPhone: string;
  clientEmail: string | null;
  eventDateLabel: string;
  location: string | null;
  categoryTitle: string | null;
  planTitle: string | null;
  planTagline: string | null;
  planDescription: string | null;
  planSections: Array<{ title: string; intro: string | null }>;
  guestCount: number | null;
  planPrice: number | null;
  amountPaid: number | null;
  amountRemaining: number | null;
  notes: string | null;
  issuedAtLabel: string;
};

export function buildReservationContractData(input: {
  clientName: string;
  clientIdNumber: string | null;
  clientPhone: string;
  clientEmail: string | null;
  eventDate: Date;
  location: string | null;
  guestCount: number | null;
  amountPaid: number | null;
  amountRemaining: number | null;
  notes: string | null;
  category: { title: string } | null;
  plan: {
    title: string;
    tagline: string | null;
    description: string | null;
    price: number | null;
    sections: Array<{ title: string; intro: string | null }>;
  } | null;
}): ReservationContractData {
  const eventDateLabel = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(input.eventDate);

  const issuedAtLabel = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const planPrice = input.plan?.price ?? null;

  return {
    clientName: input.clientName,
    clientIdNumber: input.clientIdNumber,
    clientPhone: input.clientPhone,
    clientEmail: input.clientEmail,
    eventDateLabel,
    location: input.location,
    categoryTitle: input.category?.title ?? null,
    planTitle: input.plan?.title ?? null,
    planTagline: input.plan?.tagline ?? null,
    planDescription: input.plan?.description ?? null,
    planSections: input.plan?.sections ?? [],
    guestCount: input.guestCount,
    planPrice,
    amountPaid: input.amountPaid,
    amountRemaining: input.amountRemaining,
    notes: input.notes,
    issuedAtLabel,
  };
}

