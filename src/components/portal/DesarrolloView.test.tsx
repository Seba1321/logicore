import { beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { groupModulos } from "@/components/portal/DesarrolloView";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { deriveModuloEtapa, toTime } from "@/lib/portal-progress";
import type { EmpresaLogin, PortalModulo, PortalProject, ProjectTipo } from "@/lib/supabase";

const modulo = (id: number, nombre: string, grupo: string | null, orden = id): PortalModulo => ({
  id,
  slug: null,
  nombre,
  grupo,
  descripcion: null,
  etapa: "en_desarrollo",
  fecha_inicio: null,
  fecha_fin: null,
  orden,
});

const project = (id: number, tipo: ProjectTipo, overrides: Partial<PortalProject> = {}): PortalProject => ({
  id,
  nombre: `Proyecto ${id}`,
  descripcion: null,
  estado: "en_desarrollo",
  tipo,
  sistema_url: null,
  fecha_inicio: null,
  fecha_fin: null,
  updated_at: null,
  tareas: [],
  procesos: [],
  bpmn: [],
  modulos: [],
  documentos: [],
  ...overrides,
});

const session: EmpresaLogin = {
  id: 1,
  empresa: "MauleMed",
  usuario: "Usuario",
  session_token: "token",
  expires_at: "2026-12-31T00:00:00Z",
};

const renderDashboard = (proyectos: PortalProject[], url = "/portal") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <PortalDashboard
        session={session}
        data={{ empresa: { id: 1, empresa: "MauleMed", usuario: "Usuario" }, proyectos }}
        isLoading={false}
        onLogout={() => {}}
      />
    </MemoryRouter>
  );

describe("groupModulos", () => {
  it("agrupa por grupo en el orden en que aparece cada uno", () => {
    const grupos = groupModulos([
      modulo(3, "Compras", "Operaciones"),
      modulo(1, "Dashboard", "Principal"),
      modulo(2, "Inventario", "Operaciones"),
      modulo(4, "Suelto", null),
    ]);

    expect(grupos.map((g) => g.grupo)).toEqual(["Principal", "Operaciones", "Otros"]);
    expect(grupos[1].modulos.map((m) => m.nombre)).toEqual(["Inventario", "Compras"]);
  });
});

describe("deriveModuloEtapa", () => {
  const conVentana = { ...modulo(1, "Compras", "Abastecimiento"), fecha_inicio: "2026-11-23", fecha_fin: "2026-12-25" };
  const etapaEl = (fecha: string) => deriveModuloEtapa(conVentana, "2027-02-19", toTime(fecha)!);

  it("sigue al calendario del plan", () => {
    expect(etapaEl("2026-11-16")).toBe("por_desarrollar");
    expect(etapaEl("2026-11-23")).toBe("en_desarrollo");
    expect(etapaEl("2026-12-25")).toBe("en_desarrollo");
    expect(etapaEl("2027-01-04")).toBe("en_pruebas");
    expect(etapaEl("2027-02-22")).toBe("entregado");
  });

  it("sin ventana usa la etapa declarada", () => {
    expect(deriveModuloEtapa({ ...modulo(2, "Asistente", null), etapa: "en_pruebas" }, "2027-02-19", toTime("2026-11-16")!)).toBe(
      "en_pruebas"
    );
  });
});

describe("PortalDashboard · vistas", () => {
  // jsdom no trae IntersectionObserver y Reveal (framer-motion) lo necesita.
  beforeAll(() => {
    globalThis.IntersectionObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  });

  const desarrollo = project(2, "desarrollo", {
    modulos: [modulo(1, "Inventario", "Operaciones")],
    sistema_url: "https://erp.test",
  });
  const levantamiento = project(1, "levantamiento");

  it("con los dos tipos abre en Desarrollo y permite cambiar a Levantamiento", () => {
    renderDashboard([levantamiento, desarrollo]);

    expect(screen.getByRole("tab", { name: "Desarrollo de software" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir sistema/ })).toHaveAttribute("href", "https://erp.test");

    fireEvent.click(screen.getByRole("tab", { name: "Levantamiento de procesos" }));

    expect(screen.getByRole("tab", { name: "Levantamiento de procesos" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("Inventario")).not.toBeInTheDocument();
    expect(screen.getByText("Estado del proyecto")).toBeInTheDocument();
  });

  it("respeta ?vista= al cargar", () => {
    renderDashboard([levantamiento, desarrollo], "/portal?vista=levantamiento");

    expect(screen.getByRole("tab", { name: "Levantamiento de procesos" })).toHaveAttribute("aria-selected", "true");
  });

  it("con un solo tipo no muestra el selector", () => {
    renderDashboard([levantamiento]);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByText("Estado del proyecto")).toBeInTheDocument();
  });
});
