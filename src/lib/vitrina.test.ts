import { describe, expect, it } from "vitest";

import type { VitrinaItem } from "@/lib/supabase";
import { canPreviewInline, groupVitrinaItems, toVideoEmbed } from "@/lib/vitrina";

const item = (overrides: Partial<VitrinaItem>): VitrinaItem => ({
  id: 1,
  grupo: null,
  tipo: "web",
  titulo: "Sitio",
  descripcion: null,
  estado: null,
  url: "https://example.com",
  captura_url: null,
  embeber: true,
  nota: null,
  fecha: null,
  ...overrides,
});

describe("toVideoEmbed", () => {
  it("convierte YouTube, Vimeo y Loom", () => {
    expect(toVideoEmbed("https://www.youtube.com/watch?v=abc123")).toBe("https://www.youtube.com/embed/abc123");
    expect(toVideoEmbed("https://youtu.be/abc123")).toBe("https://www.youtube.com/embed/abc123");
    expect(toVideoEmbed("https://vimeo.com/987654")).toBe("https://player.vimeo.com/video/987654");
    expect(toVideoEmbed("https://www.loom.com/share/xyz")).toBe("https://www.loom.com/embed/xyz");
  });

  it("devuelve null para archivos y URLs inválidas", () => {
    expect(toVideoEmbed("https://cdn.example.com/demo.mp4")).toBeNull();
    expect(toVideoEmbed("no es url")).toBeNull();
  });
});

describe("canPreviewInline", () => {
  it("respeta embeber solo en web y demo", () => {
    expect(canPreviewInline(item({ embeber: false }))).toBe(false);
    expect(canPreviewInline(item({ tipo: "video", embeber: false }))).toBe(true);
    expect(canPreviewInline(item({ url: null }))).toBe(false);
  });
});

describe("groupVitrinaItems", () => {
  it("mantiene el orden de los grupos", () => {
    const groups = groupVitrinaItems([
      item({ id: 1, grupo: "Web" }),
      item({ id: 2, grupo: "Sistema" }),
      item({ id: 3, grupo: "Web" }),
    ]);
    expect(groups.map((group) => [group.grupo, group.items.map((i) => i.id)])).toEqual([
      ["Web", [1, 3]],
      ["Sistema", [2]],
    ]);
  });
});
