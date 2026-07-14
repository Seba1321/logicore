import { CountUp } from "@/components/portal/technical";
import { PROCESS_STAGE_META, TIMING_META } from "@/components/portal/ui";
import {
  PROCESS_STAGE_ORDER,
  countTaskTimings,
  deriveProcessStage,
  getTaskTiming,
  type TaskTiming,
} from "@/lib/portal-progress";
import type { PortalProcess, PortalTask } from "@/lib/supabase";

const TILE_LABELS: Record<TaskTiming, string> = {
  en_curso: "En curso",
  pendiente: "Pendientes",
  completada: "Completadas",
};

// Vive dentro de la zona navy del dashboard (el "tablero"): superficies
// translúcidas sobre el gradiente, sin tarjetas blancas — salvo el Foco actual,
// que se invierte a blanco a propósito: lo que importa hoy es lo que brilla.
export const PulsePanel = ({
  processes,
  tasks,
  today,
}: {
  processes: PortalProcess[];
  tasks: PortalTask[];
  today: number;
}) => {
  const counts = countTaskTimings(tasks, today);
  const activeTasks = tasks.filter((task) => getTaskTiming(task, today) === "en_curso");

  return (
    <section>
      <div className="mb-6">
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-200/70">Seguimiento</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">Pulso del levantamiento</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/15">
          <PlanTile timing="en_curso" value={counts.en_curso} />
          <PlanTile timing="pendiente" value={counts.pendiente} />
          <PlanTile timing="completada" value={counts.completada} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ProcessFunnel processes={processes} />

          <div className="flex flex-col justify-center rounded-sm bg-white p-6 text-slate-900">
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Foco actual</p>
            {activeTasks.length ? (
              <ul className="mt-3 space-y-2.5">
                {activeTasks.map((task) => (
                  <li key={task.id} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span className="font-medium text-slate-900">{task.titulo}</span>
                    {task.fase && (
                      <span className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">{task.fase}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No hay tareas activas para hoy.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const PlanTile = ({ timing, value }: { timing: TaskTiming; value: number }) => {
  const meta = TIMING_META[timing];
  return (
    <div className="bg-[#0A1A3D] p-4">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.08em] text-blue-100/70">{TILE_LABELS[timing]}</p>
      </div>
      <p className="mt-2 font-display text-4xl font-semibold leading-none tabular-nums text-white">
        <CountUp value={value} />
      </p>
    </div>
  );
};

// Embudo de entregables: cada proceso asciende de etapa cuando se publica su
// entregable. Las etapas sin procesos aún se muestran como lo que viene.
const ProcessFunnel = ({ processes }: { processes: PortalProcess[] }) => {
  const countsByStage = PROCESS_STAGE_ORDER.map((stage) => ({
    stage,
    count: processes.filter((process) => deriveProcessStage(process) === stage).length,
  }));

  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold text-white">Procesos por etapa</p>
      <p className="mt-1 text-xs text-blue-100/60">Cada proceso avanza de etapa cuando publicamos su entregable.</p>
      <ol className="mt-4 space-y-2">
        {countsByStage.map(({ stage, count }, index) => {
          const meta = PROCESS_STAGE_META[stage];
          const reached = count > 0;
          return (
            <li
              key={stage}
              className={`flex items-center gap-3 rounded-sm border p-3 ${
                reached ? "border-white/10 bg-white/[0.07]" : "border-dashed border-white/15 bg-transparent"
              }`}
            >
              <span className={`font-display text-[11px] ${reached ? "text-blue-100/60" : "text-blue-100/40"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${reached ? meta.dot : "bg-white/25"}`} />
              <span className={`flex-1 text-sm font-medium ${reached ? "text-white" : "text-blue-100/50"}`}>
                {meta.label}
              </span>
              {reached ? (
                <span className="font-display text-2xl font-semibold leading-none tabular-nums text-white">{count}</span>
              ) : (
                <span className="font-display text-[11px] font-medium uppercase tracking-[0.08em] text-blue-100/45">Próxima etapa</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
