const MAX_PLANS = 3;

export function buildPublicCotizadorPath(
  categorySlug: string,
  planSlugs: string[] = [],
  guestCount?: number | null,
) {
  const base = `/cotizador/${categorySlug}`;
  const slugs = planSlugs.slice(0, MAX_PLANS);
  const params = new URLSearchParams();
  if (slugs.length > 0) params.set("planes", slugs.join(","));
  if (guestCount != null && guestCount > 0) {
    params.set("invitados", String(guestCount));
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function parsePlanSlugsParam(param?: string): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, MAX_PLANS);
}

export function parseGuestCountParam(param?: string): number | null {
  if (!param) return null;
  const value = Number.parseInt(param, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export const cotizadorMaxPlans = MAX_PLANS;
