"use client";

import { useMemo, useState } from "react";
import { pathLabelMap } from "@/lib/admin/subcategory-tree";

export type PlacementCategoryOption = {
  id: string;
  title: string;
};

export type PlacementSubcategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  parentId: string | null;
};

type SubcategoryPlacementFieldsProps = {
  categories: PlacementCategoryOption[];
  subcategories: PlacementSubcategoryOption[];
  defaultCategoryId?: string;
  defaultParentId?: string | null;
  excludeIds?: string[];
};

export function SubcategoryPlacementFields({
  categories,
  subcategories,
  defaultCategoryId,
  defaultParentId = null,
  excludeIds = [],
}: Readonly<SubcategoryPlacementFieldsProps>) {
  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const initialCategoryId = defaultCategoryId || categories[0]?.id || "";
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [parentId, setParentId] = useState(defaultParentId ?? "");

  const parentOptions = useMemo(() => {
    const inCategory = subcategories.filter(
      (item) => item.categoryId === categoryId && !excluded.has(item.id),
    );
    const labels = pathLabelMap(inCategory);
    return inCategory
      .map((item) => ({
        id: item.id,
        label: labels.get(item.id) ?? item.title,
      }))
      .sort((left, right) => left.label.localeCompare(right.label, "es"));
  }, [categoryId, excluded, subcategories]);

  const selectClassName =
    "rounded-sm border border-catalog/20 bg-background px-3 py-2.5 text-sm outline-none focus:border-catalog";

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">
          Categoría *
        </span>
        <select
          name="categoryId"
          required
          value={categoryId}
          onChange={(event) => {
            const nextCategoryId = event.target.value;
            setCategoryId(nextCategoryId);
            const parentStillValid = subcategories.some(
              (item) =>
                item.id === parentId && item.categoryId === nextCategoryId,
            );
            if (!parentStillValid) setParentId("");
          }}
          className={selectClassName}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">
          Cuelga de
        </span>
        <select
          name="parentId"
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className={selectClassName}
        >
          <option value="">La categoría (nivel principal)</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted/80">
          Déjalo vacío para que quede al mismo nivel que las demás, o elige otra
          subcategoría para anidarla.
        </p>
      </label>
    </div>
  );
}
