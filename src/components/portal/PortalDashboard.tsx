import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DesarrolloView } from "@/components/portal/DesarrolloView";
import { Reveal } from "@/components/portal/technical";
import { SectionHeader } from "@/components/sections/shared";
import { PlanTimeline } from "@/components/portal/PlanTimeline";
import { ProcesoPanel } from "@/components/portal/ProcesoPanel";
import { ProjectSection } from "@/components/portal/ProjectSection";
import { PulsePanel } from "@/components/portal/PulsePanel";
import { EmptyPanel, MetricStrip } from "@/components/portal/ui";
import { deriveProcessStage, getOverallProgress, getTodayTime } from "@/lib/portal-progress";
import type { EmpresaLogin, PortalData, PortalProject, ProjectTipo } from "@/lib/supabase";

const VISTA_LABEL: Record<ProjectTipo, string> = {
  desarrollo: "Desarrollo de software",
  levantamiento: "Levantamiento de procesos",
};

// Selector segmentado entre vistas. Solo aparece si la empresa tiene proyectos
// de los dos tipos; la vista elegida vive en ?vista= para que sobreviva a la
// recarga y se pueda compartir.
export const VistaSwitcher = ({
  value,
  onChange,
}: {
  value: ProjectTipo;
  onChange: (vista: ProjectTipo) => void;
}) => (
  <div role="tablist" aria-label="Vista del portal" className="mt-6 inline-flex flex-wrap rounded-sm border border-white/15 bg-white/10 p-1">
    {(["desarrollo", "levantamiento"] as const).map((vista) => (
      <button
        key={vista}
        type="button"
        role="tab"
        aria-selected={value === vista}
        onClick={() => onChange(vista)}
        className={`rounded-sm px-4 py-2 font-display text-sm font-medium transition ${
          value === vista ? "bg-white text-[#071330]" : "text-white/75 hover:text-white"
        }`}
      >
        {VISTA_LABEL[vista]}
      </button>
    ))}
  </div>
);

export const PortalDashboard = ({
  session,
  data,
  isLoading,
  onLogout,
}: {
  session: EmpresaLogin;
  data: PortalData | null;
  isLoading: boolean;
  onLogout: () => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allProjects = data?.proyectos ?? [];
  // Proyectos sincronizados antes de existir `tipo` llegan sin él.
  const byTipo = (tipo: ProjectTipo) =>
    allProjects.filter((project) => (project.tipo ?? "levantamiento") === tipo);
  const desarrollo = byTipo("desarrollo");
  const levantamiento = byTipo("levantamiento");
  const hasBoth = desarrollo.length > 0 && levantamiento.length > 0;

  // Por defecto, Desarrollo: es lo que está en curso cuando hay de los dos.
  const requested = searchParams.get("vista");
  const defaultVista: ProjectTipo = desarrollo.length > 0 ? "desarrollo" : "levantamiento";
  const activeVista: ProjectTipo =
    hasBoth && (requested === "levantamiento" || requested === "desarrollo") ? requested : defaultVista;

  const switcher = hasBoth ? (
    <VistaSwitcher
      value={activeVista}
      onChange={(next) => setSearchParams({ vista: next }, { replace: true })}
    />
  ) : null;

  return (
    <main className="min-h-screen bg-[#F3F5FA] bg-grid text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071330]/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Volver al inicio de Methodical">
            <img src="/logo-transparente.png" alt="Methodical" className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
          <div className="hidden items-center gap-2 rounded-sm border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75 md:flex">
            {session.empresa} · {session.usuario}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {!isLoading && activeVista === "desarrollo" ? (
        <DesarrolloView empresa={session.empresa} projects={desarrollo} today={getTodayTime()} switcher={switcher} />
      ) : (
        <LevantamientoView
          empresa={session.empresa}
          projects={levantamiento}
          isLoading={isLoading}
          switcher={switcher}
        />
      )}
    </main>
  );
};

const LevantamientoView = ({
  empresa,
  projects,
  isLoading,
  switcher,
}: {
  empresa: string;
  projects: PortalProject[];
  isLoading: boolean;
  switcher: ReactNode;
}) => {
  const today = getTodayTime();
  const processes = projects.flatMap((project) => project.procesos ?? []);
  // Los diagramas se cuentan desde cada proceso, no desde el array a nivel de
  // proyecto: ese último llega ordenado por updated_at y mezcla los procesos.
  const diagrams = processes.flatMap((process) => process.bpmn ?? []);
  const tasks = projects.flatMap((project) => project.tareas ?? []);
  const findings = processes.flatMap((process) => process.hallazgos ?? []);
  const informes = processes.flatMap((process) => process.informes ?? []);
  const overallProgress = getOverallProgress(projects, today);
  const processesWithDeliverables = processes.filter(
    (process) => deriveProcessStage(process) !== "por_levantar"
  ).length;
  const hasDeliverables = diagrams.length > 0 || findings.length > 0 || informes.length > 0;

  // Solo métricas con algo que contar: los entregables aparecen cuando existen.
  const metrics = [
    { label: "Proyectos", value: projects.length, helper: projects.length === 1 ? "activo" : "activos" },
    {
      label: "Procesos",
      value: processes.length,
      // "con BPMN" era incorrecto: processesWithDeliverables cuenta cualquier
      // entregable publicado, no solo diagramas.
      helper: processesWithDeliverables
        ? `${processesWithDeliverables} con entregables`
        : "en levantamiento",
    },
    { label: "BPMN", value: diagrams.length, helper: "diagramas publicados" },
    { label: "Hallazgos", value: findings.length, helper: "análisis HAMMER" },
    { label: "Informes", value: informes.length, helper: "finales publicados" },
    { label: "Tareas", value: tasks.length, helper: "en el plan de trabajo" },
  ].filter((metric) => metric.value > 0);

  return (
    <>
      {/* Zona navy: el tablero — plan, métricas y pulso comparten una sola atmósfera */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(160deg,#071330_0%,#0d2a66_55%,#123a8a_120%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-[1500px] space-y-9 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div>
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200/70">Portal de cliente</p>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">{empresa}</h1>
            {switcher}
            <p className="mt-4 max-w-2xl text-blue-50/70">
              Estado del levantamiento, BPMN, hallazgos del análisis HAMMER e informes para seguimiento ejecutivo.
            </p>
          </div>
          {!isLoading && tasks.length > 0 && (
            <PlanTimeline tasks={tasks} today={today} progress={overallProgress} />
          )}
          {!isLoading && metrics.length > 0 && (
            <Reveal>
              <MetricStrip metrics={metrics} />
            </Reveal>
          )}
          {!isLoading && tasks.length > 0 && (
            <Reveal>
              <PulsePanel processes={processes} tasks={tasks} today={today} />
            </Reveal>
          )}
        </div>
      </section>

      {/* Zona clara: los documentos — bibliotecas, proyecto y Gantt sobre papel */}
      <div className="mx-auto max-w-[1500px] space-y-14 px-4 py-12 pb-20 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-sm border border-slate-200 bg-white p-8 text-center">Cargando información del portal...</div>
        ) : (
          <>
            {hasDeliverables && (
              <div className="space-y-8">
                <SectionHeader
                  index="01"
                  eyebrow="Entregables"
                  title="Documentos del levantamiento"
                  lead="Un panel por proceso con sus BPMN, sus matrices del análisis HAMMER y su informe final, listos para revisar en pantalla completa y descargar."
                />
                {processes.map((process, position) => (
                  <Reveal key={process.id} delay={position * 0.05}>
                    <ProcesoPanel process={process} index={position + 1} />
                  </Reveal>
                ))}
              </div>
            )}

            <div className="space-y-8">
              <SectionHeader
                index={hasDeliverables ? "02" : "01"}
                eyebrow="Proyecto"
                title="Estado del proyecto"
                lead="Procesos levantados y carta Gantt del plan de trabajo."
              />
              {projects.length ? (
                projects.map((project, index) => (
                  <Reveal key={project.id} delay={index * 0.05}>
                    <ProjectSection project={project} today={today} />
                  </Reveal>
                ))
              ) : (
                <EmptyPanel title="Sin proyectos publicados" text="Aquí verás tus proyectos en cuanto estén disponibles." />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
