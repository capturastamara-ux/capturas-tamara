"use client";

import { useMemo, useState } from "react";

export type CategorySelectOption = {
  id: string;
  title: string;
};

export type SubcategorySelectOption = {
  id: string;
  title: string;
  categoryId: string;
};

type CategorySubcategorySelectProps = {
  categories: CategorySelectOption[];
  subcategories: SubcategorySelectOption[];
  defaultCategoryId?: string;
  defaultSubcategoryId?: string;
  required?: boolean;
};

export function CategorySubcategorySelect({
  categories,
  subcategories,
  defaultCategoryId,
  defaultSubcategoryId,
  required = true,
}: Readonly<CategorySubcategorySelectProps>) {
  const initialCategoryId =
    defaultCategoryId ||
    subcategories.find((item) => item.id === defaultSubcategoryId)?.categoryId ||
    categories[0]?.id ||
    "";

  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [subcategoryId, setSubcategoryId] = useState(
    defaultSubcategoryId ||
      subcategories.find((item) => item.categoryId === initialCategoryId)?.id ||
      "",
  );

  const filtered = useMemo(
    () => subcategories.filter((item) => item.categoryId === categoryId),
    [categoryId, subcategories],
  );

  const selectClassName =
    "rounded-sm border border-catalog/20 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-catalog";

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">
          Categoría{required ? " *" : ""}
        </span>
        <select
          value={categoryId}
          required={required}
          onChange={(event) => {
            const nextCategoryId = event.target.value;
            setCategoryId(nextCategoryId);
            const first = subcategories.find((item) => item.categoryId === nextCategoryId);
            setSubcategoryId(first?.id ?? "");
          }}
          className={selectClassName}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">
          Subcategoría{required ? " *" : ""}
        </span>
        <select
          name="subcategoryId"
          required={required}
          disabled={!categoryId}
          value={subcategoryId}
          onChange={(event) => setSubcategoryId(event.target.value)}
          className={selectClassName}
        >
          <option value="" disabled>
            {categoryId
              ? filtered.length > 0
                ? "Selecciona una subcategoría"
                : "Esta categoría no tiene subcategorías"
              : "Primero elige una categoría"}
          </option>
          {filtered.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
