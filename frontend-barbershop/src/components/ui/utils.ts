// Utilidad mínima sin dependencias externas (clsx/tailwind-merge)
type ClassValue = string | number | null | undefined | boolean | ClassValue[] | Record<string, boolean | undefined | null>;

function toClassString(value: ClassValue): string {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toClassString).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, v]) => !!v)
      .map(([k]) => k)
      .join(" ");
  }
  return "";
}

export function cn(...inputs: ClassValue[]) {
  return inputs.map(toClassString).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
