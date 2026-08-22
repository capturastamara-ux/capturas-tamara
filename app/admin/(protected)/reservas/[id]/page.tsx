import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminForm } from "@/components/admin/AdminForm";
import { PrintReservationContractButton } from "@/components/admin/PrintReservationContractButton";
import { ReservationFormFields } from "@/components/admin/ReservationFormFields";
import {
  deleteReservationAction,
  updateReservationAction,
} from "@/app/admin/actions";
import { buildReservationContractData } from "@/lib/admin/reservation-contract";
import { toDateInputValue } from "@/lib/admin/reservations";
import {
  getAdminCategoryOptions,
  getAdminPlanOptions,
  getAdminReservationById,
} from "@/lib/db/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReservationPage({ params }: Readonly<PageProps>) {
  const { id } = await params;
  const [reservation, categories, plans] = await Promise.all([
    getAdminReservationById(id),
    getAdminCategoryOptions(),
    getAdminPlanOptions(),
  ]);

  if (!reservation) notFound();

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
            <ReservationFormFields
              categories={categories}
              plans={plans}
              defaults={{
                eventDate: toDateInputValue(reservation.eventDate),
                clientName: reservation.clientName,
                clientPhone: reservation.clientPhone,
                clientEmail: reservation.clientEmail ?? "",
                clientIdNumber: reservation.clientIdNumber ?? "",
                categoryId: reservation.categoryId ?? "",
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
