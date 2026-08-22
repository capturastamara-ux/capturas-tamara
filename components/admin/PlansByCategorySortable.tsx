"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type DragEvent } from "react";
import { reorderPlansAction, deletePlanAction } from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { StatusBadge } from "@/components/admin/AdminUi";
import { formatPlanPrice } from "@/lib/format/price";
import { cn } from "@/lib/cn";

export type SortablePlan = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  coverUrl: string | null;
  published: boolean;
  sectionCount: number;
  categorySlug: string;
  subcategorySlug: string;
};

export type PlanCategoryGroup = {
  id: string;
  title: string;
  slug: string;
  categoryTitle: string;
  plans: SortablePlan[];
};

function GripIcon() {
  return (
    <svg
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="currentColor"
      aria-hidden="true"
      className="text-muted/70"
    >
      <circle cx="4" cy="3" r="1.4" />
      <circle cx="10" cy="3" r="1.4" />
      <circle cx="4" cy="9" r="1.4" />
      <circle cx="10" cy="9" r="1.4" />
      <circle cx="4" cy="15" r="1.4" />
      <circle cx="10" cy="15" r="1.4" />
    </svg>
  );
}

type PlanSortableListProps = {
  subcategoryId: string;
  plans: SortablePlan[];
};

function PlanSortableList({
  subcategoryId,
  plans: initialPlans,
}: Readonly<PlanSortableListProps>) {
  const [plans, setPlans] = useState(initialPlans);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const persistOrder = (next: SortablePlan[]) => {
    setPlans(next);
    startTransition(async () => {
      await reorderPlansAction(
        subcategoryId,
        next.map((plan) => plan.id),
      );
    });
  };

  const onDragStart = (event: DragEvent<HTMLLIElement>, id: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const onDragOver = (event: DragEvent<HTMLLIElement>, id: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  };

  const onDrop = (event: DragEvent<HTMLLIElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = plans.findIndex((plan) => plan.id === sourceId);
    const toIndex = plans.findIndex((plan) => plan.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...plans];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    persistOrder(next);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  return (
    <ul
      className={cn("space-y-3", isPending && "opacity-70")}
      aria-busy={isPending}
    >
      {plans.map((plan, index) => (
        <li
          key={plan.id}
          draggable
          onDragStart={(event) => onDragStart(event, plan.id)}
          onDragOver={(event) => onDragOver(event, plan.id)}
          onDrop={(event) => onDrop(event, plan.id)}
          onDragEnd={onDragEnd}
          className={cn(
            "flex flex-col gap-3 rounded-sm border border-primary/10 bg-background p-3 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-4",
            draggingId === plan.id && "opacity-50",
            overId === plan.id &&
              draggingId !== plan.id &&
              "border-primary/40 bg-surface/60",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-8 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted active:cursor-grabbing"
              title="Arrastra para reordenar"
            >
              <GripIcon />
            </span>

            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-surface">
              {plan.coverUrl && (
                <Image
                  src={plan.coverUrl}
                  alt={plan.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/planes/${plan.id}`}
                className="truncate text-sm font-medium hover:opacity-70"
                draggable={false}
                onClick={(event) => {
                  if (draggingId) event.preventDefault();
                }}
              >
                {plan.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                Posición {index + 1}
                {plan.price != null && (
                  <> · {formatPlanPrice(plan.price)}</>
                )}
                <> · {plan.sectionCount} secciones</>
              </p>
            </div>

            <div className="hidden sm:block">
              <StatusBadge published={plan.published} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-11 sm:shrink-0 sm:pl-0">
            <div className="sm:hidden">
              <StatusBadge published={plan.published} />
            </div>
            <Link
              href={`/admin/planes/${plan.id}`}
              className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
              draggable={false}
            >
              Editar
            </Link>
            <Link
              href={`/portafolio/${plan.categorySlug}#${plan.slug}`}
              className="text-xs uppercase tracking-[0.1em] text-muted hover:opacity-70"
              draggable={false}
            >
              Ver
            </Link>
            <AdminConfirmDeleteForm
              action={deletePlanAction}
              itemLabel={`el plan "${plan.title}"`}
              buttonLabel="Eliminar"
              variant="link"
            >
              <input type="hidden" name="id" value={plan.id} />
            </AdminConfirmDeleteForm>
          </div>
        </li>
      ))}
    </ul>
  );
}

type PlansByCategorySortableProps = {
  groups: PlanCategoryGroup[];
};

export function PlansByCategorySortable({
  groups,
}: Readonly<PlansByCategorySortableProps>) {
  if (groups.length === 0) {
    return (
      <p className="rounded-sm border border-primary/10 bg-background px-4 py-8 text-sm text-muted">
        No hay planes. Crea el primero.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section
          key={group.id}
          className="overflow-hidden rounded-sm border border-primary/10 bg-background p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-primary/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                {group.categoryTitle}
              </p>
              <h2 className="mt-1 font-display text-2xl italic">{group.title}</h2>
            </div>
            <p className="text-xs text-muted">
              Arrastra para definir el orden en el portafolio
            </p>
          </div>

          <div className="mt-4">
            <PlanSortableList subcategoryId={group.id} plans={group.plans} />
          </div>
        </section>
      ))}
    </div>
  );
}
