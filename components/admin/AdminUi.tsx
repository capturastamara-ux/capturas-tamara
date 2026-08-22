import Link from "next/link";
import { cn } from "@/lib/cn";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.16em] text-catalog">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl italic text-catalog-ink sm:text-4xl">
          {title}
        </h1>
        <span
          className="mt-4 block h-px w-14 bg-catalog-gold/80"
          aria-hidden="true"
        />
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-full bg-catalog px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 hover:bg-catalog-ink"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

type StatusBadgeProps = {
  published: boolean;
};

export function StatusBadge({ published }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
        published
          ? "bg-catalog/15 text-catalog"
          : "bg-muted/15 text-muted",
      )}
    >
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

export function AdminField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: "text" | "number" | "url";
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="rounded-sm border border-catalog/20 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-catalog"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function AdminTextarea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="resize-y rounded-sm border border-catalog/20 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-catalog"
      />
    </label>
  );
}

export function AdminCheckbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-catalog-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-catalog"
      />
      <span>{label}</span>
    </label>
  );
}

export function AdminSubmitButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "danger" | "ghost";
}) {
  const styles = {
    primary:
      "bg-catalog text-white hover:bg-catalog-ink",
    danger:
      "border border-accent/40 text-accent hover:bg-accent hover:text-white",
    ghost:
      "border border-catalog/25 text-catalog hover:bg-catalog hover:text-white",
  };

  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5",
        styles[variant],
      )}
    >
      {label}
    </button>
  );
}
