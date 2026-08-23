import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminForm } from "@/components/admin/AdminForm";
import { PrintReservationContractButton } from "@/components/admin/PrintReservationContractButton";
import { AdminReturnToField } from "@/components/admin/AdminReturnToField";
import { ReservationFormFields } from "@/components/admin/ReservationFormFields";
import { reservationConfig } from "@/config/reservations";
import {
  deleteReservationAction,
  updateReservationAction,
} from "@/app/admin/actions";
import { buildReservationContractData } from "@/lib/admin/reservation-contract";
import { toDateInputValue } from "@/lib/admin/reservations";
import { withPathLabels } from "@/lib/admin/subcategory-tree";
import {
  getAdminCategoryOptions,
  getAdminPlanOptions,
  getAdminReservationById,
  getAdminReservationsForDate,
  getAdminSubcategoryOptions,
} from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReservationPage({ params }: Readonly<PageProps>) {
  const { id } = await params;
  const reservation = await getAdminReservationById(id);
  if (!reservation) notFound();

  const [categories, subcategories, plans, sameDayReservations] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminSubcategoryOptions(),
    getAdminPlanOptions(),
    getAdminReservationsForDate(reservation.eventDate),
  ]);

  const contractData = buildReservationContractData({
    clientName: reservation.clientName,
    clientIdNumber: reservation.clientIdNumber,
    clientPhone: reservation.clientPhone,
    clientEmail: reservation.clientEmail,
    eventDate: reservation.eventDate,
    location: reservation.location,
    guestCount: reservation.guestCount,
    amountPaid: reservation.amountPaid,
    amountRemaining: reservation.amountRemaining,
    notes: reservation.notes,
    category: reservation.category,
    plan: reservation.plan,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Agenda"
        title={reservation.clientName}
        description="Edita los datos de esta reserva."
      />

      <div className="mb-6">
        <Link
          href="/admin/reservas"
          className="text-xs uppercase tracking-[0.12em] text-primary hover:opacity-70"
        >
          ← Volver a reservas
        </Link>
      </div>

      <div className="space-y-8">
        <div className="rounded-sm border border-primary/10 bg-background p-5 sm:p-6">
          <AdminForm action={updateReservationAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={reservation.id} />
            <AdminReturnToField fallback="/admin/reservas" />
            <ReservationFormFields
              categories={categories}
              subcategories={withPathLabels(subcategories)}
              plans={plans.map((plan) => ({
                id: plan.id,
                title: plan.title,
                categoryId: plan.categoryId,
                subcategoryId: plan.subcategoryId,
                category: plan.category,
                price: plan.price,
              }))}
              showTimePicker
              occupiedReservations={sameDayReservations.filter(
                (item) => item.id !== reservation.id,
              )}
              defaults={{
                eventDate: toDateInputValue(reservation.eventDate),
                startTime: reservation.startTime ?? reservationConfig.hours.allDayValue,
                clientName: reservation.clientName,
                clientPhone: reservation.clientPhone,
                clientEmail: reservation.clientEmail ?? "",
                clientIdNumber: reservation.clientIdNumber ?? "",
                categoryId: reservation.categoryId ?? "",
                subcategoryId: reservation.subcategoryId ?? "",
                planId: reservation.planId ?? "",
                guestCount: reservation.guestCount,
                location: reservation.location ?? "",
                notes: reservation.notes ?? "",
                status: reservation.status,
                amountPaid: reservation.amountPaid,
                amountRemaining: reservation.amountRemaining,
              }}
              submitLabel="Guardar cambios"
              extraActions={<PrintReservationContractButton data={contractData} />}
            />
          </AdminForm>
        </div>

        <div className="rounded-sm border border-accent/20 bg-background p-5">
          <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
          <div className="mt-4">
            <AdminConfirmDeleteForm
              action={deleteReservationAction}
              itemLabel={`la reserva de ${reservation.clientName}`}
              buttonLabel="Eliminar reserva"
              variant="danger"
            >
              <input type="hidden" name="id" value={reservation.id} />
            </AdminConfirmDeleteForm>
          </div>
        </div>
      </div>
    </>
  );
}
