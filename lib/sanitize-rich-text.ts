const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "div",
]);

function stripDisallowedTags(html: string) {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName: string) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (tag === "a") {
      if (match.startsWith("</")) return "</a>";

      const hrefMatch = match.match(/\shref=["']([^"']*)["']/i);
      const href = hrefMatch?.[1]?.trim();

      if (!href || !/^https?:\/\//i.test(href)) {
        return "";
      }

      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
    }

    return match.replace(/\s(on\w+|style)=["'][^"']*["']/gi, "");
  });
}

function isEmptyRichText(html: string) {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  return text.length === 0;
}

export function sanitizeRichText(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withoutScripts = trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  const sanitized = stripDisallowedTags(withoutScripts).trim();
  if (!sanitized || isEmptyRichText(sanitized)) return null;

  return sanitized;
}

export function richTextToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
