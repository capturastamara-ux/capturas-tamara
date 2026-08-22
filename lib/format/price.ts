export function formatPlanPrice(price: number | null | undefined) {
  if (price == null) return null;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function stripPriceDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPriceDigits(digits: string) {
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

export function formatPriceInputValue(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  const digits = stripPriceDigits(String(value));
  return formatPriceDigits(digits);
}
