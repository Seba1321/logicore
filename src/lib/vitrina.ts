import type { VitrinaItem } from "@/lib/supabase";

/**
 * Convierte enlaces de YouTube, Vimeo y Loom a su versión embebible. Para
 * cualquier otro enlace devuelve null y el visor usa un <video> directo.
 */
export const toVideoEmbed = (url: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = parsed.pathname.match(/^\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "loom.com") {
    const id = parsed.pathname.match(/^\/(?:share|embed)\/([^/]+)/)?.[1];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }
  return null;
};

/** Un ítem se puede ver dentro de la vitrina si tiene URL y, para web/demo, admite iframe. */
export const canPreviewInline = (item: VitrinaItem) =>
  Boolean(item.url) && (item.tipo === "video" || item.tipo === "imagen" || item.tipo === "documento" || item.embeber);

/** Agrupa respetando el orden de llegada; los ítems sin grupo quedan en un bloque sin título. */
export const groupVitrinaItems = (items: VitrinaItem[]) => {
  const groups: { grupo: string | null; items: VitrinaItem[] }[] = [];
  for (const item of items) {
    const existing = groups.find((group) => group.grupo === item.grupo);
    if (existing) existing.items.push(item);
    else groups.push({ grupo: item.grupo, items: [item] });
  }
  return groups;
};
