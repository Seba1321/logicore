import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ProcesoPanel } from "@/components/portal/ProcesoPanel";
import type { PortalBpmn, PortalFinding, PortalInforme, PortalProcess } from "@/lib/supabase";

const bpmn = (id: number, nombre: string): PortalBpmn => ({
  id,
  nombre,
  descripcion: null,
  archivo_path: null,
  archivo_url: `https://storage.test/${id}.bpmn`,
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

const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(`^${name}`) });

describe("ProcesoPanel", () => {
  it("muestra el conteo de cada pestaña y deshabilita las vacías", () => {
    renderPanel(
      proceso({
        bpmn: [],
        hallazgos: [hallazgo(10, "A · Reclutamiento"), hallazgo(11, "B · Contratación")],
        informes: [informe(20, "Informe final")],
      })
    );

    expect(tab("BPMN")).toBeDisabled();
    expect(tab("HAMMER")).toBeEnabled();
    expect(within(tab("HAMMER")).getByText("2")).toBeInTheDocument();
    expect(within(tab("Informe")).getByText("1")).toBeInTheDocument();
  });

  it("abre en la primera pestaña con contenido cuando la anterior está vacía", () => {
    renderPanel(proceso({ hallazgos: [hallazgo(10, "A · Reclutamiento")] }));

    expect(tab("HAMMER")).toHaveAttribute("aria-selected", "true");
    expect(tab("BPMN")).toHaveAttribute("aria-selected", "false");
  });

  it("omite el selector cuando la pestaña tiene una sola pieza", () => {
    renderPanel(proceso({ bpmn: [bpmn(1, "Diagrama único")] }));

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Diagrama único")).toBeInTheDocument();
  });

  it("cambia la pieza mostrada al elegir otra en el selector", () => {
    renderPanel(
      proceso({
        hallazgos: [
          hallazgo(10, "A · Reclutamiento"),
          hallazgo(11, "B · Contratación"),
          hallazgo(12, "C · Asistencia"),
        ],
      })
    );

    expect(screen.getByRole("img", { name: "A · Reclutamiento" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "12" } });

    expect(screen.getByRole("img", { name: "C · Asistencia" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "A · Reclutamiento" })).not.toBeInTheDocument();
  });

  it("conserva la selección de cada pestaña al alternar entre ellas", () => {
    renderPanel(
      proceso({
        bpmn: [bpmn(1, "Diagrama A"), bpmn(2, "Diagrama B")],
        hallazgos: [hallazgo(10, "Matriz A"), hallazgo(11, "Matriz B")],
      })
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    fireEvent.click(tab("HAMMER"));
    fireEvent.click(tab("BPMN"));

    expect(screen.getByRole("combobox")).toHaveValue("2");
  });

  it("ofrece ver y descargar cuando la pieza es un informe en PDF", () => {
    renderPanel(proceso({ bpmn: [bpmn(1, "Diagrama")], informes: [informe(20, "Informe final")] }));

    fireEvent.click(tab("Informe"));

    expect(screen.getByRole("link", { name: "Ver PDF" })).toHaveAttribute(
      "href",
      expect.stringContaining("20.pdf")
    );
    expect(screen.getByRole("link", { name: "Descargar" })).toHaveAttribute("download");
  });

  it("avisa cuando el proceso no tiene ningún entregable publicado", () => {
    renderPanel(proceso());

    expect(screen.getByText(/todavía no tiene entregables publicados/i)).toBeInTheDocument();
    expect(tab("BPMN")).toBeDisabled();
  });
});
