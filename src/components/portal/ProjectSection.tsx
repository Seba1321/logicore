import { PortalGantt } from "@/components/portal/PortalGantt";
import { EmptyPanel, NextMilestone, ProcessStagePill } from "@/components/portal/ui";
import { deriveProcessStage, getProjectProgress } from "@/lib/portal-progress";
import type { PortalFinding, PortalProcess, PortalProject } from "@/lib/supabase";

export const ProjectSection = ({ project, today }: { project: PortalProject; today: number }) => {
  const progress = getProjectProgress(project, today);
  const findings = (project.procesos ?? []).flatMap((process) => process.hallazgos ?? []);

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
        <div className="grid gap-6 lg:grid-cols-2">
          <ProcessList processes={project.procesos ?? []} />
          <FindingList findings={findings} />
        </div>
      </div>

      <PortalGantt tasks={project.tareas ?? []} today={today} />
    </section>
  );
};

const ProcessList = ({ processes }: { processes: PortalProcess[] }) => (
  <section>
    <h3 className="font-display text-2xl font-semibold tracking-tight">Procesos levantados</h3>
    <div className="mt-4 space-y-3">
      {processes.length ? (
        processes.map((process) => (
          <div key={process.id} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{process.nombre}</p>
                <p className="mt-1 text-xs text-slate-600">{process.area ?? "Sin área"}</p>
              </div>
              <ProcessStagePill stage={deriveProcessStage(process)} />
            </div>
          </div>
        ))
      ) : (
        <EmptyPanel title="Sin procesos" text="Los procesos se publicarán aquí a medida que avance el levantamiento." compact />
      )}
    </div>
  </section>
);

const FindingList = ({ findings }: { findings: PortalFinding[] }) => (
  <section>
    <h3 className="font-display text-2xl font-semibold tracking-tight">Hallazgos del análisis HAMMER</h3>
    <div className="mt-4 space-y-4">
      {findings.length ? (
        findings.map((finding) => (
          <figure key={finding.id} className="overflow-hidden rounded-sm border border-slate-200">
            {finding.archivo_url ? (
              <a href={finding.archivo_url} target="_blank" rel="noreferrer" className="block bg-slate-50">
                <img
                  src={finding.archivo_url}
                  alt={finding.titulo}
                  loading="lazy"
                  className="max-h-80 w-full object-contain transition hover:opacity-90"
                />
              </a>
            ) : (
              <div className="flex h-32 items-center justify-center bg-slate-50 text-xs text-slate-500">Sin imagen</div>
            )}
            <figcaption className="border-t border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              {finding.titulo}
            </figcaption>
          </figure>
        ))
      ) : (
        <NextMilestone text="Los hallazgos del análisis HAMMER se publican durante la fase de modelamiento y diagnóstico." />
      )}
    </div>
  </section>
);
