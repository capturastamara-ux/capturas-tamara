"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type DragEvent } from "react";
import {
  deleteSubcategoryAction,
  reorderSubcategoriesAction,
} from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { StatusBadge } from "@/components/admin/AdminUi";
import {
  flattenTree,
  nestByParent,
  type TreeNode,
} from "@/lib/admin/subcategory-tree";
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

function sameSiblingGroup(
  left: SortableSubcategory,
  right: SortableSubcategory,
) {
  return (
    left.categoryId === right.categoryId && left.parentId === right.parentId
  );
}

function findSameLevelTarget(
  items: SortableSubcategory[],
  source: SortableSubcategory,
  target: SortableSubcategory,
) {
  const byId = new Map(items.map((item) => [item.id, item]));
  let current: SortableSubcategory | undefined = target;

  while (current) {
    if (current.id === source.id) return null;
    if (sameSiblingGroup(source, current)) return current;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return null;
}

function applySiblingOrder(
  current: SortableSubcategory[],
  siblings: SortableSubcategory[],
) {
  const categoryId = siblings[0]?.categoryId;
  const parentId = siblings[0]?.parentId ?? null;
  if (!categoryId) return current;

  const orderedIds = siblings.map((item) => item.id);
  const tree = nestByParent(current);

  const reorderNodes = (
    nodes: Array<TreeNode<SortableSubcategory>>,
  ): Array<TreeNode<SortableSubcategory>> => {
    if (parentId === null) {
      const byId = new Map(
        nodes
          .filter((node) => node.categoryId === categoryId)
          .map((node) => [node.id, node]),
      );
      if (byId.size === 0) return nodes;

      const ordered = orderedIds.flatMap((id) => {
        const node = byId.get(id);
        return node ? [node] : [];
      });
      let inserted = false;
      const next: Array<TreeNode<SortableSubcategory>> = [];

      for (const node of nodes) {
        if (node.categoryId === categoryId) {
          if (!inserted) {
            next.push(...ordered);
            inserted = true;
          }
          continue;
        }
        next.push(node);
      }

      return next;
    }

    return nodes.map((node) => {
      if (node.id === parentId) {
        const byId = new Map(node.children.map((child) => [child.id, child]));
        const ordered = orderedIds.flatMap((id) => {
          const child = byId.get(id);
          return child ? [child] : [];
        });
        return { ...node, children: ordered };
      }
      return { ...node, children: reorderNodes(node.children) };
    });
  };

  return flattenTree(reorderNodes(tree));
}

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
    if (siblings.length === 0) return;
    setSubcategories((current) => applySiblingOrder(current, siblings));
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
    const source = draggingId
      ? subcategories.find((item) => item.id === draggingId)
      : undefined;
    const target = subcategories.find((item) => item.id === id);
    if (!source || !target) return;

    const sameLevel = findSameLevelTarget(subcategories, source, target);
    if (!sameLevel) {
      event.dataTransfer.dropEffect = "none";
      if (overId) setOverId(null);
      return;
    }

    event.dataTransfer.dropEffect = "move";
    if (overId !== sameLevel.id) setOverId(sameLevel.id);
  };

  const onDrop = (event: DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const source = subcategories.find((item) => item.id === sourceId);
    const target = subcategories.find((item) => item.id === targetId);
    if (!source || !target) return;

    const sameLevelTarget = findSameLevelTarget(subcategories, source, target);
    if (!sameLevelTarget) return;

    const siblings = subcategories.filter((item) =>
      sameSiblingGroup(item, source),
    );
    const fromSibling = siblings.findIndex((item) => item.id === sourceId);
    const toSibling = siblings.findIndex(
      (item) => item.id === sameLevelTarget.id,
    );
    if (fromSibling < 0 || toSibling < 0 || fromSibling === toSibling) return;

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
        Arrastra para ordenar hermanas del mismo nivel y la misma categoría.
        Las hijas se mueven junto a su padre. Para anidar, edita la
        subcategoría.
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
