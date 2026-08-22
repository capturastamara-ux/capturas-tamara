"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type DragEvent } from "react";
import { deleteCategoryAction, reorderCategoriesAction } from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { StatusBadge } from "@/components/admin/AdminUi";
import { cn } from "@/lib/cn";

export type SortableCategory = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  planCount: number;
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

type CategoriesSortableTableProps = {
  categories: SortableCategory[];
};

export function CategoriesSortableTable({
  categories: initialCategories,
}: Readonly<CategoriesSortableTableProps>) {
  const [categories, setCategories] = useState(initialCategories);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const persistOrder = (next: SortableCategory[]) => {
    setCategories(next);
    startTransition(async () => {
      await reorderCategoriesAction(next.map((category) => category.id));
    });
  };

  const onDragStart = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const onDragOver = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  };

  const onDrop = (event: DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = categories.findIndex((category) => category.id === sourceId);
    const toIndex = categories.findIndex((category) => category.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...categories];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    persistOrder(next);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  if (categories.length === 0) {
    return (
      <p className="rounded-sm border border-primary/10 bg-background px-4 py-8 text-sm text-muted">
        No hay categorías. Crea la primera.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-sm border border-primary/10 bg-background",
        isPending && "opacity-70",
      )}
    >
      <p className="border-b border-primary/10 px-4 py-3 text-xs text-muted">
        Arrastra para definir el orden en el portafolio
      </p>
      <table className="w-full text-left text-sm" aria-busy={isPending}>
        <thead className="border-b border-primary/10 text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="w-12 px-3 py-3 font-normal">
              <span className="sr-only">Reordenar</span>
            </th>
            <th className="px-4 py-3 font-normal">Título</th>
            <th className="hidden px-4 py-3 font-normal sm:table-cell">Slug</th>
            <th className="px-4 py-3 font-normal">Planes</th>
            <th className="px-4 py-3 font-normal">Estado</th>
            <th className="px-4 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              draggable
              onDragStart={(event) => onDragStart(event, category.id)}
              onDragOver={(event) => onDragOver(event, category.id)}
              onDrop={(event) => onDrop(event, category.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "border-b border-primary/5 last:border-0 transition-colors",
                draggingId === category.id && "opacity-50",
                overId === category.id &&
                  draggingId !== category.id &&
                  "bg-surface/60",
              )}
            >
              <td className="px-3 py-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-8 cursor-grab items-center justify-center rounded-sm text-muted active:cursor-grabbing"
                  title="Arrastra para reordenar"
                >
                  <GripIcon />
                </span>
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/admin/categorias/${category.id}`}
                  className="font-medium hover:opacity-70"
                  draggable={false}
                  onClick={(event) => {
                    if (draggingId) event.preventDefault();
                  }}
                >
                  {category.title}
                </Link>
                <p className="mt-1 text-xs text-muted sm:hidden">/{category.slug}</p>
              </td>
              <td className="hidden px-4 py-4 text-muted sm:table-cell">{category.slug}</td>
              <td className="px-4 py-4">{category.planCount}</td>
              <td className="px-4 py-4">
                <StatusBadge published={category.published} />
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/categorias/${category.id}`}
                    className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                    draggable={false}
                  >
                    Editar
                  </Link>
                  <AdminConfirmDeleteForm
                    action={deleteCategoryAction}
                    itemLabel={`la categoría "${category.title}"`}
                    buttonLabel="Eliminar"
                    variant="link"
                  >
                    <input type="hidden" name="id" value={category.id} />
                  </AdminConfirmDeleteForm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
