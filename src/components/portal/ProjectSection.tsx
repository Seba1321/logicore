import { PortalGantt } from "@/components/portal/PortalGantt";
import { EmptyPanel, ProcessStagePill } from "@/components/portal/ui";
import { deriveProcessStage, getProjectProgress } from "@/lib/portal-progress";
import type { PortalProcess, PortalProject } from "@/lib/supabase";

export const ProjectSection = ({ project, today }: { project: PortalProject; today: number }) => {
  const progress = getProjectProgress(project, today);

  return (
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Proyecto</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{project.nombre}</h2>
            {project.descripcion && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{project.descripcion}</p>}
          </div>
          <div className="shrink-0 lg:text-right">
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Avance según plan</p>
            <p className="mt-1 font-display text-4xl font-semibold leading-none tabular-nums text-slate-950">{progress}%</p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 p-6 md:p-8">
        <ProcessList processes={project.procesos ?? []} />
      </div>

      <PortalGantt tasks={project.tareas ?? []} today={today} />
    </section>
  );
};

const ProcessList = ({ processes }: { processes: PortalProcess[] }) => (
  <section>
    <h3 className="font-display text-2xl font-semibold tracking-tight">Procesos levantados</h3>
    {processes.length ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {processes.map((process) => (
          <div key={process.id} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{process.nombre}</p>
                <p className="mt-1 text-xs text-slate-600">{process.area ?? "Sin área"}</p>
              </div>
              <ProcessStagePill stage={deriveProcessStage(process)} />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-4">
        <EmptyPanel title="Sin procesos" text="Los procesos se publicarán aquí a medida que avance el levantamiento." compact />
      </div>
    )}
  </section>
);
