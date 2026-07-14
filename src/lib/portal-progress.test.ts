import { describe, expect, it } from "vitest";

import type { PortalProject, PortalTask } from "@/lib/supabase";
import {
  countTaskTimings,
  deriveProcessStage,
  getExpectedTaskProgress,
  getPlanCalendar,
  getPlanPhases,
  getProjectProgress,
  getTaskProgress,
  getTaskTiming,
  parsePortalDate,
  toTime,
} from "@/lib/portal-progress";

const day = (value: string) => {
  const time = toTime(value);
  if (time === null) throw new Error(`fecha inválida en test: ${value}`);
  return time;
};

const makeTask = (overrides: Partial<PortalTask>): PortalTask => ({
  id: 1,
  id_git: null,
  fase: null,
  titulo: "Tarea",
  descripcion: null,
  estado: "pendiente",
  responsable: null,
  fecha_inicio: "2026-06-08",
  fecha_fin: "2026-06-12",
  progreso: 0,
  peso: 1,
  orden: 1,
  dependencias: [],
  ...overrides,
});

const makeProject = (tareas: PortalTask[]): PortalProject => ({
  id: 1,
  nombre: "Proyecto",
  descripcion: null,
  estado: "en_desarrollo",
  fecha_inicio: "2026-06-08",
  fecha_fin: "2026-08-14",
  updated_at: null,
  tareas,
  procesos: [],
  bpmn: [],
});

describe("parsePortalDate", () => {
  it("interpreta YYYY-MM-DD en hora local, sin corrimiento de zona horaria", () => {
    const date = parsePortalDate("2026-06-08");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(8);
    expect(date?.getHours()).toBe(0);
  });

  it("devuelve null para vacío o inválido", () => {
    expect(parsePortalDate(null)).toBeNull();
    expect(parsePortalDate("")).toBeNull();
    expect(parsePortalDate("no-es-fecha")).toBeNull();
  });
});

describe("getExpectedTaskProgress (avance según plan)", () => {
  const task = makeTask({ fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" });

  it("es 0 antes del inicio de la ventana", () => {
    expect(getExpectedTaskProgress(task, day("2026-05-31"))).toBe(0);
    expect(getExpectedTaskProgress(task, day("2026-06-01"))).toBe(0);
  });

  it("avanza proporcional a los días transcurridos (fin inclusivo)", () => {
    expect(getExpectedTaskProgress(task, day("2026-06-06"))).toBe(50);
  });

  it("es 100 cuando la ventana ya pasó", () => {
    expect(getExpectedTaskProgress(task, day("2026-06-11"))).toBe(100);
  });

  it("es 0 si faltan fechas", () => {
    expect(getExpectedTaskProgress(makeTask({ fecha_inicio: null }), day("2026-06-06"))).toBe(0);
  });
});

describe("getTaskProgress", () => {
  it("una tarea cerrada cuenta 100 aunque su ventana no haya empezado", () => {
    const task = makeTask({ estado: "completada", fecha_inicio: "2026-12-01", fecha_fin: "2026-12-10" });
    expect(getTaskProgress(task, day("2026-06-06"))).toBe(100);
  });

  it("una tarea abierta usa el calendario", () => {
    const task = makeTask({ estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" });
    expect(getTaskProgress(task, day("2026-06-06"))).toBe(50);
  });
});

describe("getTaskTiming (nunca estados negativos)", () => {
  it("solo un estado cerrado en la BD marca completada", () => {
    expect(getTaskTiming(makeTask({ estado: "completada" }), day("2026-06-10"))).toBe("completada");
    expect(getTaskTiming(makeTask({ estado: "aprobada" }), day("2026-06-10"))).toBe("completada");
  });

  it("una tarea vencida sin cerrar es pendiente, nunca completada ni atrasada", () => {
    const overdue = makeTask({ estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" });
    expect(getTaskTiming(overdue, day("2026-06-11"))).toBe("pendiente");
    expect(getTaskProgress(overdue, day("2026-06-11"))).toBe(100);
  });

  it("ventana activa es en_curso; futura es pendiente", () => {
    const task = makeTask({ estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" });
    expect(getTaskTiming(task, day("2026-06-05"))).toBe("en_curso");
    expect(getTaskTiming(task, day("2026-05-20"))).toBe("pendiente");
  });

  it("el último día de la ventana sigue en curso (fin inclusivo)", () => {
    const task = makeTask({ estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" });
    expect(getTaskTiming(task, day("2026-06-10"))).toBe("en_curso");
  });

  it("sin fechas es pendiente", () => {
    expect(getTaskTiming(makeTask({ estado: "en_desarrollo", fecha_inicio: null }), day("2026-06-10"))).toBe("pendiente");
  });
});

describe("countTaskTimings", () => {
  it("la suma de los conteos siempre iguala el total de tareas", () => {
    const today = day("2026-07-13");
    const tasks = [
      makeTask({ id: 1, estado: "completada" }),
      makeTask({ id: 2, estado: "en_desarrollo", fecha_inicio: "2026-07-06", fecha_fin: "2026-07-24" }),
      makeTask({ id: 3, estado: "pendiente", fecha_inicio: "2026-08-10", fecha_fin: "2026-08-14" }),
      makeTask({ id: 4, estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" }),
    ];
    const counts = countTaskTimings(tasks, today);
    expect(counts.completada + counts.en_curso + counts.pendiente).toBe(tasks.length);
    expect(counts).toEqual({ completada: 1, en_curso: 1, pendiente: 2 });
  });
});

describe("getProjectProgress (ponderado por peso)", () => {
  it("pondera por peso", () => {
    const today = day("2026-06-20");
    const project = makeProject([
      makeTask({ id: 1, estado: "completada", peso: 3 }),
      makeTask({ id: 2, estado: "pendiente", peso: 1, fecha_inicio: "2026-08-01", fecha_fin: "2026-08-10" }),
    ]);
    expect(getProjectProgress(project, today)).toBe(75);
  });

  it("es 0 antes de empezar y 100 con todo el calendario vencido", () => {
    const tasks = [
      makeTask({ id: 1, estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-10" }),
      makeTask({ id: 2, estado: "pendiente", fecha_inicio: "2026-06-11", fecha_fin: "2026-06-20" }),
    ];
    expect(getProjectProgress(makeProject(tasks), day("2026-05-01"))).toBe(0);
    expect(getProjectProgress(makeProject(tasks), day("2026-07-01"))).toBe(100);
  });

  it("es 0 sin tareas", () => {
    expect(getProjectProgress(makeProject([]), day("2026-06-20"))).toBe(0);
  });
});

describe("getPlanCalendar (la regla del proyecto)", () => {
  // Plan real de MauleMed: 8 jun — 14 ago 2026.
  const tasks = [
    makeTask({ id: 1, fecha_inicio: "2026-06-08", fecha_fin: "2026-06-12" }),
    makeTask({ id: 2, fecha_inicio: "2026-08-10", fecha_fin: "2026-08-14" }),
  ];

  it("calcula día y total consistentes con la Gantt", () => {
    const calendar = getPlanCalendar(tasks, day("2026-07-13"));
    expect(calendar?.totalDays).toBe(68);
    expect(calendar?.dayIndex).toBe(36);
    expect(calendar?.todayInRange).toBe(true);
  });

  it("acota el día a los bordes del plan", () => {
    expect(getPlanCalendar(tasks, day("2026-05-01"))?.dayIndex).toBe(1);
    expect(getPlanCalendar(tasks, day("2026-09-01"))?.dayIndex).toBe(68);
    expect(getPlanCalendar(tasks, day("2026-09-01"))?.todayInRange).toBe(false);
  });

  it("devuelve null sin tareas fechadas", () => {
    expect(getPlanCalendar([makeTask({ fecha_inicio: null, fecha_fin: null })], day("2026-07-13"))).toBeNull();
  });
});

describe("getPlanPhases", () => {
  it("deriva ventanas por fase ordenadas por inicio, con su estado", () => {
    const today = day("2026-07-13");
    const phases = getPlanPhases(
      [
        makeTask({ id: 1, fase: "Inicio", estado: "completada", fecha_inicio: "2026-06-08", fecha_fin: "2026-06-12" }),
        makeTask({ id: 2, fase: "Levantamiento", estado: "en_desarrollo", fecha_inicio: "2026-06-15", fecha_fin: "2026-07-17" }),
        makeTask({ id: 3, fase: "Cierre", estado: "pendiente", fecha_inicio: "2026-08-10", fecha_fin: "2026-08-14" }),
      ],
      today
    );
    expect(phases.map((phase) => phase.fase)).toEqual(["Inicio", "Levantamiento", "Cierre"]);
    expect(phases.map((phase) => phase.status)).toEqual(["completada", "en_curso", "proxima"]);
    expect(phases[0].start).toBe(day("2026-06-08"));
    expect(phases[0].end).toBe(day("2026-06-12"));
  });

  it("una fase vencida sin cerrar queda en curso, nunca en un estado negativo", () => {
    const phases = getPlanPhases(
      [makeTask({ id: 1, fase: "Inicio", estado: "en_desarrollo", fecha_inicio: "2026-06-01", fecha_fin: "2026-06-05" })],
      day("2026-07-13")
    );
    expect(phases[0].status).toBe("en_curso");
  });

  it("la ventana de la fase abarca todas sus tareas y exige que todas estén cerradas", () => {
    const today = day("2026-07-13");
    const phases = getPlanPhases(
      [
        makeTask({ id: 1, fase: "Inicio", estado: "completada", fecha_inicio: "2026-06-08", fecha_fin: "2026-06-12" }),
        makeTask({ id: 2, fase: "Inicio", estado: "en_desarrollo", fecha_inicio: "2026-06-10", fecha_fin: "2026-06-20" }),
      ],
      today
    );
    expect(phases).toHaveLength(1);
    expect(phases[0].start).toBe(day("2026-06-08"));
    expect(phases[0].end).toBe(day("2026-06-20"));
    expect(phases[0].status).toBe("en_curso");
  });

  it("ignora fases sin tareas fechadas", () => {
    expect(getPlanPhases([makeTask({ fase: "Inicio", fecha_inicio: null, fecha_fin: null })], day("2026-07-13"))).toEqual([]);
  });
});

describe("deriveProcessStage", () => {
  const base = {
    id: 1,
    slug: null,
    nombre: "Proceso",
    area: null,
    estado: "identificado",
    responsable_methodical: null,
    responsable_cliente: null,
    descripcion: null,
    orden: 1,
    updated_at: null,
  };
  const bpmn = { id: 1, nombre: "b", descripcion: null, archivo_path: null, archivo_url: null, updated_at: null };
  const hallazgo = {
    id: 1,
    titulo: "h",
    descripcion: null,
    impacto: null,
    recomendacion: null,
    prioridad: "media",
    estado: "abierto",
    archivo_path: null,
    archivo_url: null,
    orden: 1,
  };
  const informe = { id: 1, nombre: "i", descripcion: null, archivo_path: null, archivo_url: null, orden: 1, updated_at: null };

  it("asciende de etapa según entregables publicados", () => {
    expect(deriveProcessStage({ ...base, bpmn: [], hallazgos: [], informes: [] })).toBe("por_levantar");
    expect(deriveProcessStage({ ...base, bpmn: [bpmn], hallazgos: [], informes: [] })).toBe("construyendo_bpmn");
    expect(deriveProcessStage({ ...base, bpmn: [bpmn], hallazgos: [hallazgo], informes: [] })).toBe("analisis_hammer");
    expect(deriveProcessStage({ ...base, bpmn: [bpmn], hallazgos: [hallazgo], informes: [informe] })).toBe("informe_final");
  });
});
