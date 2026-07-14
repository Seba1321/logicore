import type { PortalProcess, PortalProject, PortalTask } from "@/lib/supabase";

// Modelo de avance del portal: el portal refleja SOLO el plan (calendario).
// No existe avance "real" reportado ni estados negativos de cara al cliente:
// una tarea es "completada" únicamente si su estado en la BD está cerrado;
// todo lo demás es "en_curso" (ventana activa) o "pendiente" (futura o vencida).

export const DAY_MS = 24 * 60 * 60 * 1000;

export const parsePortalDate = (value: string | number | null): Date | null => {
  if (value === null || value === "") return null;

  if (typeof value === "number") return new Date(value);

  // Fechas YYYY-MM-DD se interpretan en hora local para evitar corrimientos de zona horaria.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toTime = (value: string | number | null): number | null => {
  const date = parsePortalDate(value);
  return date ? date.getTime() : null;
};

export const formatDate = (value: string | number | null): string => {
  const date = parsePortalDate(value);
  if (!date) return "Por definir";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDayMonth = (value: number): string =>
  new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" }).format(new Date(value));

// Medianoche del día actual — alimenta todos los cálculos dependientes de fecha.
export const getTodayTime = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

export const clampProgress = (value: number) => Math.max(0, Math.min(100, value));

const CLOSED_STATUSES = new Set([
  "aprobado",
  "aprobada",
  "cerrado",
  "cerrada",
  "completada",
  "finalizada",
  "validado",
  "validada",
  "done",
]);

export const isClosedStatus = (status: string) => CLOSED_STATUSES.has(status.toLowerCase());

// Avance de una tarea según el calendario del plan: % de su ventana ya transcurrido.
export const getExpectedTaskProgress = (task: PortalTask, today: number): number => {
  const start = toTime(task.fecha_inicio);
  const end = toTime(task.fecha_fin);
  if (start === null || end === null) return 0;
  const endExclusive = end + DAY_MS;
  if (today <= start) return 0;
  if (today >= endExclusive) return 100;
  return clampProgress(((today - start) / (endExclusive - start)) * 100);
};

export const getTaskProgress = (task: PortalTask, today: number): number => {
  if (isClosedStatus(task.estado)) return 100;
  return Math.round(getExpectedTaskProgress(task, today));
};

// Promedio ponderado por peso de las tareas del proyecto.
export const getProjectProgress = (project: PortalProject, today: number): number => {
  const tasks = project.tareas ?? [];
  const totalWeight = tasks.reduce((total, task) => total + (Number(task.peso) || 1), 0);

  if (!tasks.length || !totalWeight) return 0;

  const weightedProgress = tasks.reduce(
    (total, task) => total + getTaskProgress(task, today) * (Number(task.peso) || 1),
    0
  );

  return Math.round(weightedProgress / totalWeight);
};

export const getOverallProgress = (projects: PortalProject[], today: number): number => {
  if (!projects.length) return 0;
  const total = projects.reduce((sum, project) => sum + getProjectProgress(project, today), 0);
  return Math.round(total / projects.length);
};

// Estado de una tarea de cara al cliente. Solo tres valores: una tarea cerrada en la
// BD es "completada"; con ventana activa es "en_curso"; todo lo demás — futura o con
// ventana vencida sin cerrar — es "pendiente". Nunca se muestra atraso.
export type TaskTiming = "completada" | "en_curso" | "pendiente";

export const getTaskTiming = (task: PortalTask, today: number): TaskTiming => {
  if (isClosedStatus(task.estado)) return "completada";
  const start = toTime(task.fecha_inicio);
  const end = toTime(task.fecha_fin);
  if (start === null || end === null) return "pendiente";
  if (today < start) return "pendiente";
  if (today >= end + DAY_MS) return "pendiente";
  return "en_curso";
};

export const countTaskTimings = (tasks: PortalTask[], today: number): Record<TaskTiming, number> => {
  const counts: Record<TaskTiming, number> = { en_curso: 0, pendiente: 0, completada: 0 };
  tasks.forEach((task) => {
    counts[getTaskTiming(task, today)]++;
  });
  return counts;
};

// El estado de un proceso es un embudo derivado de sus entregables publicados.
export type ProcessStage = "por_levantar" | "construyendo_bpmn" | "analisis_hammer" | "informe_final";

export const PROCESS_STAGE_ORDER: ProcessStage[] = [
  "por_levantar",
  "construyendo_bpmn",
  "analisis_hammer",
  "informe_final",
];

export const deriveProcessStage = (process: PortalProcess): ProcessStage => {
  if ((process.informes ?? []).length) return "informe_final";
  if ((process.hallazgos ?? []).length) return "analisis_hammer";
  if ((process.bpmn ?? []).length) return "construyendo_bpmn";
  return "por_levantar";
};

// --- Calendario del plan (la "regla" del proyecto) ---

export type PlanRange = { start: number; end: number };

export const getGanttRange = (tasks: PortalTask[]): PlanRange | null => {
  const dates = tasks
    .flatMap((task) => [toTime(task.fecha_inicio), toTime(task.fecha_fin)])
    .filter((time): time is number => time !== null);

  if (!dates.length) return null;

  const start = Math.min(...dates);
  const end = Math.max(...dates) + DAY_MS;

  return { start, end: end === start ? start + DAY_MS : end };
};

export const getGanttPosition = (task: PortalTask, range: PlanRange) => {
  const taskStart = toTime(task.fecha_inicio) ?? range.start;
  const taskEnd = (toTime(task.fecha_fin) ?? taskStart) + DAY_MS;
  const total = Math.max(range.end - range.start, DAY_MS);
  const left = clampProgress(((taskStart - range.start) / total) * 100);
  const width = Math.max(4, clampProgress(((taskEnd - taskStart) / total) * 100));

  return { left, width: Math.min(width, 100 - left) };
};

export type PlanCalendar = {
  range: PlanRange;
  totalDays: number;
  // Día actual dentro del plan (1..totalDays), acotado a los bordes.
  dayIndex: number;
  // true solo si hoy cae dentro de la ventana del plan.
  todayInRange: boolean;
  // Posición porcentual de "hoy" sobre la regla, o null si está fuera.
  todayPosition: number | null;
};

export const getPlanCalendar = (tasks: PortalTask[], today: number): PlanCalendar | null => {
  const range = getGanttRange(tasks);
  if (!range) return null;

  const totalDays = Math.max(1, Math.round((range.end - range.start) / DAY_MS));
  const dayIndex = Math.min(totalDays, Math.max(1, Math.floor((today - range.start) / DAY_MS) + 1));
  const todayInRange = today >= range.start && today < range.end;
  const todayPosition =
    today >= range.start && today <= range.end ? ((today - range.start) / (range.end - range.start)) * 100 : null;

  return { range, totalDays, dayIndex, todayInRange, todayPosition };
};

// Estado de una fase de cara al cliente, mismo espíritu que el timing de tareas:
// "completada" solo si todas sus tareas están cerradas en la BD; "proxima" si su
// ventana aún no comienza; todo lo demás — incluida ventana vencida — es "en_curso".
export type PhaseStatus = "completada" | "en_curso" | "proxima";

export type PlanPhase = {
  fase: string;
  // Primer y último día de la fase, ambos inclusivos.
  start: number;
  end: number;
  status: PhaseStatus;
};

// Fases del plan ordenadas por inicio, con su ventana derivada de las tareas que agrupan.
export const getPlanPhases = (tasks: PortalTask[], today: number): PlanPhase[] => {
  const groups = new Map<string, PortalTask[]>();
  tasks.forEach((task) => {
    const fase = task.fase || "General";
    groups.set(fase, [...(groups.get(fase) ?? []), task]);
  });

  return [...groups.entries()]
    .flatMap(([fase, phaseTasks]) => {
      const starts = phaseTasks.map((task) => toTime(task.fecha_inicio)).filter((time): time is number => time !== null);
      const ends = phaseTasks.map((task) => toTime(task.fecha_fin)).filter((time): time is number => time !== null);
      if (!starts.length || !ends.length) return [];

      const start = Math.min(...starts);
      const end = Math.max(...ends);
      const status: PhaseStatus = phaseTasks.every((task) => isClosedStatus(task.estado))
        ? "completada"
        : today < start
          ? "proxima"
          : "en_curso";

      return [{ fase, start, end, status }];
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);
};
