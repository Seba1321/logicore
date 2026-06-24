import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BpmnViewer, type BpmnStats } from "@/components/portal/BpmnViewer";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/portal/technical";
import { getPortalSession } from "@/lib/portal-session";
import { supabase, type EmpresaLogin, type PortalBpmn, type PortalData, type PortalProcess } from "@/lib/supabase";

const BpmnViewerPage = () => {
  const { diagramId } = useParams();
  const [session, setSession] = useState<EmpresaLogin | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [stats, setStats] = useState<BpmnStats | null>(null);

  useEffect(() => {
    const savedSession = getPortalSession();
    setSession(savedSession);

    if (!savedSession || !supabase) {
      setIsLoading(false);
      return;
    }

    const loadDiagrams = async () => {
      const { data } = await supabase.rpc("get_portal_empresa", {
        p_session_token: savedSession.session_token,
      });
      if (data) setPortalData(data as PortalData);
      setIsLoading(false);
    };

    loadDiagrams();
  }, []);

  const diagram = portalData?.proyectos
    ?.flatMap((project) => project.bpmn ?? [])
    .find((item) => String(item.id) === diagramId) ?? null;
  const process = findProcessForDiagram(portalData, diagram);

  if (isLoading) {
    return <FullPageState text="Cargando BPMN..." />;
  }

  if (!session) {
    return (
      <FullPageState
        text="Tu sesión expiró. Ingresa nuevamente al portal."
        action={<Button asChild><Link to="/portal">Ir al portal</Link></Button>}
      />
    );
  }

  if (!diagram) {
    return (
      <FullPageState
        text="No encontramos este BPMN para tu sesión."
        action={<Button asChild><Link to="/portal">Volver al portal</Link></Button>}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <header className="border-b border-white/10 bg-[linear-gradient(135deg,#071330_0%,#123a8a_100%)] text-white">
        <div className="flex min-h-16 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/portal" aria-label="Volver al portal">
              <img src="/logo-transparente.png" alt="Methodical" className="h-8 w-auto object-contain brightness-0 invert" />
            </Link>
            <div>
              <p className="text-sm text-blue-100/60">{session.empresa}</p>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{diagram.nombre}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setShowDetails((current) => !current)}
            >
              {showDetails ? "Ocultar detalle" : "Mostrar detalle"}
            </Button>
            {diagram.archivo_url && (
              <Button asChild variant="secondary" size="sm">
                <a href={diagram.archivo_url} target="_blank" rel="noreferrer">Descargar fuente</a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/portal">Volver al portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className={`grid flex-1 gap-4 p-4 sm:p-6 lg:p-8 ${showDetails ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "xl:grid-cols-1"}`}>
        <section className="min-h-[calc(100vh-132px)] rounded-sm bg-white p-3 border border-slate-200">
          <BpmnViewer
            xmlUrl={diagram.archivo_url}
            title={diagram.nombre}
            heightClassName="h-[calc(100vh-220px)] min-h-[680px]"
            className="h-full rounded-sm"
            initialZoom={0.85}
            onStats={setStats}
          />
        </section>

        {showDetails && (
          <aside className="relative rounded-sm border border-slate-200 bg-white p-5 xl:max-h-[calc(100vh-132px)] xl:overflow-y-auto">
            <CornerTicks className="text-slate-200" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Proceso</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{process?.nombre ?? diagram.nombre}</h2>
            {process?.area && <p className="mt-2 text-sm text-slate-500">Área: {process.area}</p>}
            {process?.descripcion && <p className="mt-4 text-sm leading-relaxed text-slate-600">{process.descripcion}</p>}

            <div className="mt-6">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Elementos del diagrama</p>
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Tareas" value={stats?.tareas} />
                <StatTile label="Compuertas" value={stats?.compuertas} />
                <StatTile label="Eventos" value={stats?.eventos} />
                <StatTile label="Flujos" value={stats?.flujos} />
              </div>
            </div>

            <div className="mt-6">
              <InfoRow label="Estado" value={process?.estado ?? "Publicado"} />
              <InfoRow label="Responsable Methodical" value={process?.responsable_methodical ?? "Methodical"} />
              <InfoRow label="Responsable cliente" value={process?.responsable_cliente ?? session.empresa} />
              <InfoRow label="Archivo" value={diagram.archivo_path ?? "BPMN publicado"} />
            </div>

            <div className="mt-6 rounded-sm border border-blue-900/40 bg-[#071330] p-4 text-white">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-200/70">Atajos</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-blue-50/70">
                + / −&nbsp; zoom · 0&nbsp; ajustar · F&nbsp; pantalla completa · arrastra para mover.
              </p>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
};

const findProcessForDiagram = (data: PortalData | null, diagram: PortalBpmn | null): PortalProcess | null => {
  if (!data || !diagram) return null;

  for (const project of data.proyectos ?? []) {
    for (const process of project.procesos ?? []) {
      if (process.bpmn?.some((item) => item.id === diagram.id)) return process;
    }
  }

  return null;
};

const StatTile = ({ label, value }: { label: string; value?: number }) => (
  <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2.5">
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900">{value ?? "—"}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
    <span className="text-right text-sm font-medium text-slate-800">{value.replace(/_/g, " ")}</span>
  </div>
);

const FullPageState = ({ text, action }: { text: string; action?: React.ReactNode }) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060f] p-6 text-white">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_60%,#0c2a78_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
    <div className="relative max-w-md rounded-sm border border-white/15 bg-white/[0.04] p-8 text-center backdrop-blur-sm">
      <CornerTicks className="text-white/20" />
      <img src="/logo-transparente.png" alt="Methodical" className="mx-auto h-10 w-auto object-contain brightness-0 invert" />
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-blue-200/60">— Visor BPMN</p>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight text-white">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  </main>
);

export default BpmnViewerPage;
