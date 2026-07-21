import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { deriveProcessStage } from "@/lib/portal-progress";
import { PROCESS_STAGE_META } from "@/components/portal/ui";
import { withVersion } from "@/lib/utils";
import type { PortalFinding, PortalProcess, PortalProject } from "@/lib/supabase";

export const HallazgoLibrary = ({
  projects,
  findings,
}: {
  projects: PortalProject[];
  findings: PortalFinding[];
}) => {
  const processByFinding = new Map<number, PortalProcess>();
  projects.forEach((project) => {
    project.procesos?.forEach((process) => {
      process.hallazgos?.forEach((finding) => processByFinding.set(finding.id, process));
    });
  });

  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Hallazgos</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Matrices del análisis HAMMER</h2>
        <p className="mt-2 text-sm text-slate-600">Abre cada matriz en el visor con zoom para revisarla en detalle.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {findings.map((finding, index) => {
          const process = processByFinding.get(finding.id);
          const thumbUrl = withVersion(finding.archivo_url, finding.id);
          return (
            <div key={finding.id} className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 transition hover:border-blue-300">
              <Link
                to={`/portal/hallazgo/${finding.id}`}
                target="_blank"
                rel="noreferrer"
                className="block aspect-[4/3] overflow-hidden border-b border-slate-200 bg-slate-50"
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={finding.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">Sin imagen</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-[11px] tracking-[0.1em] text-slate-500">H-{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-display text-lg font-semibold leading-tight text-slate-950">{finding.titulo}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {process?.area ?? "Proceso"} · {process ? PROCESS_STAGE_META[deriveProcessStage(process)].label : "Publicado"}
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-fit">
                  <Link to={`/portal/hallazgo/${finding.id}`} target="_blank" rel="noreferrer">
                    Ver en pantalla completa
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
