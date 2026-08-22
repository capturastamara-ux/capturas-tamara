export function syncRichTextBeforeSubmit(form: HTMLFormElement) {
  form.querySelectorAll<HTMLDivElement>("[data-rich-text-editor]").forEach((editor) => {
    const hidden = editor.parentElement?.querySelector<HTMLInputElement>(
      'input[type="hidden"][data-rich-text-input]',
    );

    if (!hidden) return;

    const html = editor.innerHTML
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();

    hidden.value = html ? editor.innerHTML : "";
  });
}
