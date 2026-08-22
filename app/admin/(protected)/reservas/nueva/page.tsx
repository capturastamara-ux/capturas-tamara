import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ fecha?: string }>;
};

export default async function NewReservationPage({ searchParams }: Readonly<PageProps>) {
  const { fecha } = await searchParams;
  redirect(fecha ? `/admin/reservas?nueva=${fecha}` : "/admin/reservas");
}
