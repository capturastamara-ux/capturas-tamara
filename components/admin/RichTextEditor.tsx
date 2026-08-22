"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type RichTextEditorProps = {
  name: string;
  id?: string;
  defaultValue?: string | null;
  placeholder?: string;
  compact?: boolean;
};

type ToolbarAction = {
  command: string;
  label: string;
  title: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { command: "bold", label: "B", title: "Negrita" },
  { command: "italic", label: "I", title: "Cursiva" },
  { command: "underline", label: "U", title: "Subrayado" },
  { command: "insertUnorderedList", label: "•", title: "Lista con viñetas" },
  { command: "insertOrderedList", label: "1.", title: "Lista numerada" },
];

function isEmptyEditorHtml(html: string) {
  return (
    html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim().length === 0
  );
}

export function RichTextEditor({
  name,
  id,
  defaultValue,
  placeholder = "Escribe aquí…",
  compact = false,
}: Readonly<RichTextEditorProps>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue ?? "");

  useEffect(() => {
    if (!editorRef.current || !defaultValue) return;
    editorRef.current.innerHTML = defaultValue;
    setHtml(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const editor = editorRef.current;
    const form = editor?.closest("form");
    if (!editor || !form) return;

    const handleReset = () => {
      editor.innerHTML = defaultValue ?? "";
      setHtml(defaultValue ?? "");
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultValue]);

  const sync = useCallback(() => {
    const next = editorRef.current?.innerHTML ?? "";
    setHtml(isEmptyEditorHtml(next) ? "" : next);
  }, []);

  const runCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    sync();
  };

  const insertLink = () => {
    const url = window.prompt("URL del enlace (https://…)");
    if (!url?.trim()) return;

    editorRef.current?.focus();
    document.execCommand("createLink", false, url.trim());
    sync();
  };

  return (
    <div className="overflow-hidden rounded-sm border border-primary/15 bg-background">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-primary/10 bg-surface/60 px-2 py-2"
        role="toolbar"
        aria-label="Formato de texto"
      >
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.command}
            type="button"
            title={action.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(action.command)}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-sm px-2 text-sm font-semibold text-primary/70 transition-colors hover:bg-background hover:text-primary",
              action.command === "italic" && "italic",
              action.command === "underline" && "underline",
            )}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          title="Enlace"
          onMouseDown={(event) => event.preventDefault()}
          onClick={insertLink}
          className="flex h-8 min-w-8 items-center justify-center rounded-sm px-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary/70 transition-colors hover:bg-background hover:text-primary"
        >
          Link
        </button>
      </div>

      <div
        ref={editorRef}
        id={id}
        contentEditable
        data-rich-text-editor=""
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={sync}
        onBlur={sync}
        className={cn(
          "min-w-0 px-3 py-2.5 text-sm leading-relaxed outline-none",
          compact ? "min-h-[96px]" : "min-h-[160px]",
          "[&:empty:before]:text-muted/50 [&:empty:before]:content-[attr(data-placeholder)]",
          "[&_a]:text-primary [&_a]:underline [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        )}
      />

      <input type="hidden" name={name} value={html} data-rich-text-input="" />
    </div>
  );
}
