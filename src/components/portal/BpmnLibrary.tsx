import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PROCESS_STAGE_META } from "@/components/portal/ui";
import { deriveProcessStage } from "@/lib/portal-progress";
import type { PortalBpmn, PortalProcess, PortalProject } from "@/lib/supabase";

export const BpmnLibrary = ({ projects, diagrams }: { projects: PortalProject[]; diagrams: PortalBpmn[] }) => {
  const processByDiagram = new Map<number, PortalProcess>();
  projects.forEach((project) => {
    project.procesos?.forEach((process) => {
      process.bpmn?.forEach((diagram) => processByDiagram.set(diagram.id, process));
    });
  });

  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">BPMN</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Biblioteca de procesos</h2>
        <p className="mt-2 text-sm text-slate-600">Abre cada diagrama en una pantalla amplia para revisarlo con comodidad.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {diagrams.map((diagram, index) => {
          const process = processByDiagram.get(diagram.id);
          return (
            <div key={diagram.id} className="rounded-sm border border-slate-200 p-5 transition hover:border-blue-300">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <p className="font-display text-[11px] tracking-[0.1em] text-slate-500">D-{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-display text-xl font-semibold leading-tight text-slate-950">{diagram.nombre}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {process?.area ?? "Proceso"} · {process ? PROCESS_STAGE_META[deriveProcessStage(process)].label : "Publicado"}
                  </p>
                  {diagram.descripcion && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{diagram.descripcion}</p>
                  )}
                </div>
                <Button asChild className="w-full sm:w-fit">
                  <Link to={`/portal/bpmn/${diagram.id}`} target="_blank" rel="noreferrer">
                    Ver pantalla completa
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
