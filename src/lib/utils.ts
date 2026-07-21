import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Versiona una URL pública de Storage con un token que cambia en cada sync.
 * La URL de `getPublicUrl` es estable entre syncs, así que sin esto el navegador
 * puede servir contenido viejo desde caché. Pasar `updated_at` o `id` de la fila.
 */
export function withVersion(
  url: string | null | undefined,
  token: string | number | null | undefined
): string | null {
  if (!url) return null;
  if (token === null || token === undefined) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(String(token))}`;
}
