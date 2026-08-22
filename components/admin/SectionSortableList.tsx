"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type DragEvent } from "react";
import { reorderSectionsAction } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

export type SortableSection = {
  id: string;
  title: string;
  imageUrl: string | null;
  sortOrder: number;
};

type SectionSortableListProps = {
  planId: string;
  sections: SortableSection[];
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

export function SectionSortableList({
  planId,
  sections: initialSections,
}: Readonly<SectionSortableListProps>) {
  const [sections, setSections] = useState(initialSections);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const persistOrder = (next: SortableSection[]) => {
    setSections(next);
    startTransition(async () => {
      await reorderSectionsAction(
        planId,
        next.map((section) => section.id),
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

    const fromIndex = sections.findIndex((section) => section.id === sourceId);
    const toIndex = sections.findIndex((section) => section.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...sections];
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
      className={cn("mt-6 space-y-3", isPending && "opacity-70")}
      aria-busy={isPending}
    >
      {sections.map((section, index) => (
        <li
          key={section.id}
          draggable
          onDragStart={(event) => onDragStart(event, section.id)}
          onDragOver={(event) => onDragOver(event, section.id)}
          onDrop={(event) => onDrop(event, section.id)}
          onDragEnd={onDragEnd}
          className={cn(
            "flex items-center gap-3 rounded-sm border border-primary/10 bg-background p-3 transition-colors sm:gap-4 sm:p-4",
            draggingId === section.id && "opacity-50",
            overId === section.id &&
              draggingId !== section.id &&
              "border-primary/40 bg-surface/60",
          )}
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-8 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted active:cursor-grabbing"
            title="Arrastra para reordenar"
          >
            <GripIcon />
          </span>

          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-surface">
            {section.imageUrl && (
              <Image
                src={section.imageUrl}
                alt={section.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{section.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              Orden de visualización {index}
            </p>
          </div>

          <Link
            href={`/admin/planes/${planId}/secciones/${section.id}`}
            className="shrink-0 rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white"
            draggable={false}
            onClick={(event) => {
              if (draggingId) event.preventDefault();
            }}
          >
            Editar
          </Link>
        </li>
      ))}
    </ul>
  );
}
