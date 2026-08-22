import { ReservationsPanel } from "@/components/admin/ReservationsPanel";
import { toDayKey } from "@/lib/admin/availability";
import { getAdminCalendarData, getAdminClients } from "@/lib/db/admin";

type PageProps = {
  searchParams: Promise<{ nueva?: string }>;
};

export default async function AdminReservationsPage({ searchParams }: Readonly<PageProps>) {
  const { nueva } = await searchParams;
  const [{ reservations, overrides, categories, subcategories, plans }, clients] =
    await Promise.all([
      getAdminCalendarData(),
      getAdminClients(),
    ]);

  const serializedReservations = reservations.map((reservation) => ({
    id: reservation.id,
    eventDate: toDayKey(reservation.eventDate),
    startTime: reservation.startTime,
    clientName: reservation.clientName,
    eventTitle: reservation.eventTitle,
    status: reservation.status,
    category: reservation.category,
  }));

  const serializedOverrides = overrides.map((override) => ({
    date: toDayKey(override.date),
    isOpen: override.isOpen,
    note: override.note,
  }));

  return (
    <ReservationsPanel
      reservations={serializedReservations}
      overrides={serializedOverrides}
      categories={categories}
      categoryOptions={categories}
      subcategoryOptions={subcategories}
      planOptions={plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        categoryId: plan.subcategory.categoryId,
        subcategoryId: plan.subcategoryId,
        category: plan.subcategory.category,
        price: plan.price,
      }))}
      clients={clients}
      initialNewReservationDate={nueva}
    />
  );
}
