"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type DragEvent } from "react";
import {
  deleteSubcategoryAction,
  reorderSubcategoriesAction,
} from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { StatusBadge } from "@/components/admin/AdminUi";
import { flattenTree, nestByParent } from "@/lib/admin/subcategory-tree";
import { cn } from "@/lib/cn";

export type SortableSubcategory = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  planCount: number;
  childCount: number;
  categoryId: string;
  categoryTitle: string;
  parentId: string | null;
  parentTitle: string | null;
  depth: number;
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

type SubcategoriesSortableTableProps = {
  subcategories: SortableSubcategory[];
};

export function SubcategoriesSortableTable({
  subcategories: initialSubcategories,
}: Readonly<SubcategoriesSortableTableProps>) {
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSubcategories(initialSubcategories);
  }, [initialSubcategories]);

  const persistOrder = (siblings: SortableSubcategory[]) => {
    const parentId = siblings[0]?.parentId ?? null;
    setSubcategories((current) => {
      const others = current.filter((item) => item.parentId !== parentId);
      return flattenTree(nestByParent([...others, ...siblings]));
    });
    startTransition(async () => {
      await reorderSubcategoriesAction(siblings.map((item) => item.id));
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

    const fromIndex = subcategories.findIndex((item) => item.id === sourceId);
    const toIndex = subcategories.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const source = subcategories[fromIndex];
    const target = subcategories[toIndex];
    if (!source || !target || source.parentId !== target.parentId) return;

    const siblingIds = new Set(
      subcategories
        .filter((item) => item.parentId === source.parentId)
        .map((item) => item.id),
    );
    const siblings = subcategories.filter((item) => siblingIds.has(item.id));
    const fromSibling = siblings.findIndex((item) => item.id === sourceId);
    const toSibling = siblings.findIndex((item) => item.id === targetId);
    if (fromSibling < 0 || toSibling < 0) return;

    const nextSiblings = [...siblings];
    const [movedSibling] = nextSiblings.splice(fromSibling, 1);
    if (!movedSibling) return;
    nextSiblings.splice(toSibling, 0, movedSibling);
    persistOrder(nextSiblings);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  if (subcategories.length === 0) {
    return (
      <p className="rounded-sm border border-catalog/15 bg-background px-4 py-8 text-sm text-muted">
        No hay subcategorías. Crea la primera.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-sm border border-catalog/15 bg-background",
        isPending && "opacity-70",
      )}
    >
      <p className="border-b border-catalog/15 px-4 py-3 text-xs text-muted">
        Arrastra para ordenar hermanas del mismo nivel. Puedes anidar una
        subcategoría dentro de otra al editarla.
      </p>
      <table className="w-full text-left text-sm" aria-busy={isPending}>
        <thead className="border-b border-catalog/15 text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="w-12 px-3 py-3 font-normal">
              <span className="sr-only">Reordenar</span>
            </th>
            <th className="px-4 py-3 font-normal">Título</th>
            <th className="hidden px-4 py-3 font-normal sm:table-cell">Categoría</th>
            <th className="px-4 py-3 font-normal">Planes</th>
            <th className="px-4 py-3 font-normal">Estado</th>
            <th className="px-4 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((subcategory) => (
            <tr
              key={subcategory.id}
              draggable
              onDragStart={(event) => onDragStart(event, subcategory.id)}
              onDragOver={(event) => onDragOver(event, subcategory.id)}
              onDrop={(event) => onDrop(event, subcategory.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "border-b border-catalog/5 last:border-0 transition-colors",
                subcategory.depth > 0 && "bg-catalog/[0.04]",
                draggingId === subcategory.id && "opacity-50",
                overId === subcategory.id &&
                  draggingId !== subcategory.id &&
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
                <div
                  className="flex items-start gap-2"
                  style={{ paddingLeft: subcategory.depth * 28 }}
                >
                  {subcategory.depth > 0 && (
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-5 w-5 shrink-0 items-end justify-start text-catalog"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 0v8h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/subcategorias/${subcategory.id}`}
                        className="font-medium hover:opacity-70"
                        draggable={false}
                        onClick={(event) => {
                          if (draggingId) event.preventDefault();
                        }}
                      >
                        {subcategory.title}
                      </Link>
                      {subcategory.parentTitle && (
                        <span className="rounded-full bg-catalog/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-catalog">
                          Hija de {subcategory.parentTitle}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted sm:hidden">
                      {subcategory.categoryTitle}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-4 text-muted sm:table-cell">
                {subcategory.parentTitle
                  ? `${subcategory.categoryTitle} · ${subcategory.parentTitle}`
                  : subcategory.categoryTitle}
              </td>
              <td className="px-4 py-4">{subcategory.planCount}</td>
              <td className="px-4 py-4">
                <StatusBadge published={subcategory.published} />
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/subcategorias/${subcategory.id}`}
                    className="text-xs uppercase tracking-[0.1em] text-catalog hover:text-catalog-ink"
                    draggable={false}
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/admin/subcategorias/nueva?categoryId=${subcategory.categoryId}&parentId=${subcategory.id}`}
                    className="text-xs uppercase tracking-[0.1em] text-catalog hover:text-catalog-ink"
                    draggable={false}
                  >
                    Agregar hija
                  </Link>
                  <AdminConfirmDeleteForm
                    action={deleteSubcategoryAction}
                    itemLabel={`la subcategoría "${subcategory.title}"`}
                    buttonLabel="Eliminar"
                    variant="link"
                  >
                    <input type="hidden" name="id" value={subcategory.id} />
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
