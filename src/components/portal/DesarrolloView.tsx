import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/sections/shared";
import { PlanTimeline } from "@/components/portal/PlanTimeline";
import { PortalGantt } from "@/components/portal/PortalGantt";
import { InformeRow } from "@/components/portal/ProcesoPanel";
import { CornerTicks, Reveal } from "@/components/portal/technical";
import { EmptyPanel, MetricStrip, ModuloEtapaPill } from "@/components/portal/ui";
import { deriveModuloEtapa, getOverallProgress, getProjectProgress } from "@/lib/portal-progress";
import { withVersion } from "@/lib/utils";
import type { PortalModulo, PortalProject } from "@/lib/supabase";

// Vista del desarrollo de software: plan de trabajo, módulos del sistema con su
// etapa, documentos y enlace al sistema. Como en el levantamiento, el avance y
// las etapas salen solo del calendario del plan.

const SIN_GRUPO = "Otros";

// Agrupa los módulos respetando el orden en que aparece cada grupo por primera
// vez, que es el orden del menú del sistema.
export const groupModulos = (modulos: PortalModulo[]) => {
  const groups = new Map<string, PortalModulo[]>();
  for (const modulo of [...modulos].sort((a, b) => a.orden - b.orden || a.id - b.id)) {
    const key = modulo.grupo ?? SIN_GRUPO;
    groups.set(key, [...(groups.get(key) ?? []), modulo]);
  }
  return [...groups.entries()].map(([grupo, items]) => ({ grupo, modulos: items }));
};

export const DesarrolloView = ({
  empresa,
  projects,
  today,
  switcher,
}: {
  empresa: string;
  projects: PortalProject[];
  today: number;
  switcher?: ReactNode;
}) => {
  const modulos = projects.flatMap((project) =>
    (project.modulos ?? []).map((modulo) => ({
      ...modulo,
      etapa: deriveModuloEtapa(modulo, project.fecha_fin, today),
    }))
  );
  const tasks = projects.flatMap((project) => project.tareas ?? []);
  const documentos = projects.flatMap((project) => project.documentos ?? []);
  const sistemaUrl = projects.find((project) => project.sistema_url)?.sistema_url ?? null;
  const entregados = modulos.filter((modulo) => modulo.etapa === "entregado").length;
  const enCurso = modulos.filter(
    (modulo) => modulo.etapa === "en_desarrollo" || modulo.etapa === "en_pruebas"
  ).length;
  const grupos = groupModulos(modulos);

  const metrics = [
    { label: "Módulos", value: modulos.length, helper: "del sistema" },
    { label: "En curso", value: enCurso, helper: "en desarrollo o pruebas" },
    { label: "Entregados", value: entregados, helper: "listos para usar" },
    { label: "Documentos", value: documentos.length, helper: "publicados" },
  ].filter((metric) => metric.value > 0);

  let section = 0;
  const nextIndex = () => String(++section).padStart(2, "0");

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(160deg,#071330_0%,#0d2a66_55%,#123a8a_120%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-[1500px] space-y-9 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div>
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200/70">Portal de cliente</p>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">{empresa}</h1>
            {switcher}
            <p className="mt-4 max-w-2xl text-blue-50/70">
              Plan de trabajo, módulos del sistema y su etapa de desarrollo, y documentos del proyecto.
            </p>
            {sistemaUrl && (
              <Button asChild className="mt-6">
                <a href={sistemaUrl} target="_blank" rel="noreferrer">
                  Abrir sistema →
                </a>
              </Button>
            )}
          </div>
          {tasks.length > 0 && (
            <PlanTimeline
              tasks={tasks}
              today={today}
              progress={getOverallProgress(projects, today)}
              label="Plan de desarrollo"
            />
          )}
          {metrics.length > 0 && (
            <Reveal>
              <MetricStrip metrics={metrics} />
            </Reveal>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] space-y-14 px-4 py-12 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <SectionHeader
            index={nextIndex()}
            eyebrow="Sistema"
            title="Módulos del sistema"
            lead="Agrupados por hito del plan. Cada módulo está en desarrollo durante sus semanas del plan y en pruebas hasta la entrega."
          />
          {grupos.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {grupos.map(({ grupo, modulos: items }, position) => (
                <Reveal key={grupo} delay={position * 0.05}>
                  <section className="relative h-full rounded-sm border border-slate-200 bg-white">
                    <CornerTicks className="text-slate-200" />
                    <header className="border-b border-slate-200 px-5 py-4">
                      <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        {grupo} <span className="text-slate-400">· {items.length}</span>
                      </p>
                    </header>
                    <ul className="divide-y divide-slate-100">
                      {items.map((modulo) => (
                        <li key={modulo.id} className="flex items-start justify-between gap-4 px-5 py-4">
                          <div>
                            <p className="font-display text-base font-semibold leading-snug text-slate-950">{modulo.nombre}</p>
                            {modulo.descripcion && (
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">{modulo.descripcion}</p>
                            )}
                          </div>
                          <ModuloEtapaPill etapa={modulo.etapa} />
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyPanel title="Sin módulos publicados" text="Aquí verás los módulos del sistema en cuanto estén definidos." />
          )}
        </div>

        <div className="space-y-8">
          <SectionHeader
            index={nextIndex()}
            eyebrow="Documentos"
            title="Documentos del proyecto"
            lead="Requisitos, manuales y actas de entrega, listos para ver y descargar."
          />
          {documentos.length ? (
            <div className="space-y-3 rounded-sm border border-slate-200 bg-white p-4 md:p-6">
              {documentos.map((documento) => (
                <InformeRow
                  key={documento.id}
                  titulo={documento.nombre}
                  descripcion={documento.descripcion}
                  archivo={withVersion(documento.archivo_url, documento.updated_at ?? documento.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel title="Sin documentos publicados" text="Aquí verás los documentos del proyecto en cuanto estén disponibles." />
          )}
        </div>

        {tasks.length > 0 && (
          <div className="space-y-8">
            <SectionHeader
              index={nextIndex()}
              eyebrow="Plan"
              title="Plan de trabajo"
              lead="Las semanas del plan con su objetivo, agrupadas por etapa."
            />
            {projects
              .filter((project) => (project.tareas ?? []).length > 0)
              .map((project) => (
                <Reveal key={project.id}>
                  <section className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                    <div className="flex flex-col gap-5 border-b border-slate-200 p-6 md:p-8 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Proyecto</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{project.nombre}</h2>
                        {project.descripcion && (
                          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{project.descripcion}</p>
                        )}
                      </div>
                      <div className="shrink-0 lg:text-right">
                        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Avance según plan</p>
                        <p className="mt-1 font-display text-4xl font-semibold leading-none tabular-nums text-slate-950">
                          {getProjectProgress(project, today)}%
                        </p>
                      </div>
                    </div>
                    <PortalGantt tasks={project.tareas} today={today} />
                  </section>
                </Reveal>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
