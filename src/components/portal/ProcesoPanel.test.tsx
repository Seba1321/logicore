import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ProcesoPanel } from "@/components/portal/ProcesoPanel";
import type { PortalBpmn, PortalFinding, PortalInforme, PortalProcess } from "@/lib/supabase";

const bpmn = (id: number, nombre: string, conPreview = true): PortalBpmn => ({
  id,
  nombre,
  descripcion: null,
  archivo_path: null,
  archivo_url: `https://storage.test/${id}.bpmn`,
  preview_path: conPreview ? `bpmn/${id}-preview.svg` : null,
  preview_url: conPreview ? `https://storage.test/${id}-preview.svg` : null,
  updated_at: null,
});

const hallazgo = (id: number, titulo: string): PortalFinding => ({
  id,
  titulo,
  descripcion: null,
  impacto: null,
  recomendacion: null,
  prioridad: "media",
  estado: "abierto",
  archivo_path: null,
  archivo_url: `https://storage.test/${id}.png`,
  orden: id,
});

const informe = (id: number, nombre: string): PortalInforme => ({
  id,
  nombre,
  descripcion: null,
  archivo_path: null,
  archivo_url: `https://storage.test/${id}.pdf`,
  orden: 1,
  updated_at: null,
});

const proceso = (overrides: Partial<PortalProcess> = {}): PortalProcess => ({
  id: 1,
  slug: "proceso-demo",
  nombre: "Proceso Demo",
  area: "Operaciones",
  estado: "finalizado",
  responsable_methodical: null,
  responsable_cliente: "Nombre Cliente",
  descripcion: null,
  orden: 1,
  updated_at: null,
  bpmn: [],
  hallazgos: [],
  informes: [],
  ...overrides,
});

const renderPanel = (process: PortalProcess) =>
  render(
    <MemoryRouter>
      <ProcesoPanel process={process} index={2} />
    </MemoryRouter>
  );

// Las cinco matrices del Ciclo de Vida del Personal: el caso que motivó dejar
// de esconder los entregables tras una pestaña y un desplegable.
const CINCO_MATRICES = [
  hallazgo(10, "A · Reclutamiento y Selección"),
  hallazgo(11, "B · Contratación e Incorporación"),
  hallazgo(12, "C · Asistencia y Cierre Mensual"),
  hallazgo(13, "D · Permisos, Feriados y Licencias"),
  hallazgo(14, "E · Desvinculación y Finiquito"),
];

describe("ProcesoPanel", () => {
  it("muestra todas las matrices a la vez, sin interacción previa", () => {
    renderPanel(proceso({ hallazgos: CINCO_MATRICES }));

    CINCO_MATRICES.forEach((matriz) => {
      expect(screen.getByText(matriz.titulo)).toBeInTheDocument();
    });
    expect(screen.getByText(/5 matrices/)).toBeInTheDocument();
  });

  it("muestra todos los diagramas a la vez", () => {
    renderPanel(proceso({ bpmn: [bpmn(1, "Marketing"), bpmn(2, "Encuestas"), bpmn(3, "Reclamos")] }));

    expect(screen.getByText("Marketing")).toBeInTheDocument();
    expect(screen.getByText("Encuestas")).toBeInTheDocument();
    expect(screen.getByText("Reclamos")).toBeInTheDocument();
    expect(screen.getByText(/3 diagramas/)).toBeInTheDocument();
  });

  it("enlaza cada pieza a su visor", () => {
    renderPanel(proceso({ bpmn: [bpmn(7, "Diagrama")], hallazgos: [hallazgo(21, "Matriz")] }));

    expect(screen.getByRole("link", { name: /Diagrama/ })).toHaveAttribute(
      "href",
      "/portal/bpmn/7"
    );
    expect(screen.getByRole("link", { name: /Matriz/ })).toHaveAttribute(
      "href",
      "/portal/hallazgo/21"
    );
  });

  it("usa la miniatura del diagrama cuando existe", () => {
    renderPanel(proceso({ bpmn: [bpmn(1, "Con preview")] }));

    const img = document.querySelector('img[src*="1-preview.svg"]');
    expect(img).not.toBeNull();
    expect(screen.queryByText("Sin vista previa")).not.toBeInTheDocument();
  });

  it("cae a tarjeta de texto si el diagrama no tiene miniatura", () => {
    renderPanel(proceso({ bpmn: [bpmn(1, "Sin preview", false)] }));

    expect(screen.getByText("Sin vista previa")).toBeInTheDocument();
    expect(screen.getByText("Sin preview")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sin preview/ })).toHaveAttribute(
      "href",
      "/portal/bpmn/1"
    );
  });

  it("anuncia los grupos sin publicar en vez de esconderlos", () => {
    renderPanel(proceso({ hallazgos: [hallazgo(10, "Matriz")] }));

    // Al proceso le faltan BPMN e informe: ambos se declaran, no desaparecen.
    expect(screen.getAllByText(/en preparación/)).toHaveLength(2);
    expect(screen.getByText("BPMN")).toBeInTheDocument();
    expect(screen.getByText("Informe final")).toBeInTheDocument();
  });

  it("ofrece ver y descargar el informe", () => {
    renderPanel(proceso({ informes: [informe(20, "Informe final")] }));

    expect(screen.getByRole("link", { name: "Ver PDF" })).toHaveAttribute(
      "href",
      expect.stringContaining("20.pdf")
    );
    expect(screen.getByRole("link", { name: "Descargar" })).toHaveAttribute("download");
  });

  it("muestra la etapa derivada de lo publicado", () => {
    renderPanel(proceso({ hallazgos: [hallazgo(10, "Matriz")], informes: [informe(20, "Informe")] }));

    expect(screen.getByText("Informe final", { selector: "span" })).toBeInTheDocument();
  });
});
