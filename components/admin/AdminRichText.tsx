"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";

type AdminRichTextProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  compact?: boolean;
};

export function AdminRichText({
  label,
  name,
  defaultValue,
  placeholder,
  compact,
}: AdminRichTextProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <RichTextEditor
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        compact={compact}
      />
    </div>
  );
}
