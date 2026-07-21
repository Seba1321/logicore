import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ImageViewer } from "@/components/portal/ImageViewer";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/portal/technical";
import { getPortalSession } from "@/lib/portal-session";
import { supabase, type EmpresaLogin, type PortalData, type PortalFinding, type PortalProcess } from "@/lib/supabase";
import { withVersion } from "@/lib/utils";

const HallazgoViewerPage = () => {
  const { findingId } = useParams();
  const [session, setSession] = useState<EmpresaLogin | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = getPortalSession();
    setSession(savedSession);

    if (!savedSession || !supabase) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase.rpc("get_portal_empresa", {
        p_session_token: savedSession.session_token,
      });
      if (data) setPortalData(data as PortalData);
      setIsLoading(false);
    };

    load();
  }, []);

  const finding = portalData?.proyectos
    ?.flatMap((project) => project.procesos ?? [])
    .flatMap((process) => process.hallazgos ?? [])
    .find((item) => String(item.id) === findingId) ?? null;
  const process = findProcessForFinding(portalData, finding);
  const findingUrl = finding ? withVersion(finding.archivo_url, finding.id) : null;

  if (isLoading) {
    return <FullPageState text="Cargando hallazgo..." />;
  }

  if (!session) {
    return (
      <FullPageState
        text="Tu sesión expiró. Ingresa nuevamente al portal."
        action={<Button asChild><Link to="/portal">Ir al portal</Link></Button>}
      />
    );
  }

  if (!finding) {
    return (
      <FullPageState
        text="No encontramos este hallazgo para tu sesión."
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
              <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{finding.titulo}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {findingUrl && (
              <Button asChild variant="secondary" size="sm">
                <a href={findingUrl} target="_blank" rel="noreferrer">Descargar imagen</a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/portal">Volver al portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-4 p-4 sm:p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-[calc(100vh-132px)] rounded-sm border border-slate-200 bg-white p-3">
          <ImageViewer
            src={findingUrl}
            title={finding.titulo}
            heightClassName="h-[calc(100vh-220px)] min-h-[680px]"
            className="h-full rounded-sm"
          />
        </section>

        <aside className="relative rounded-sm border border-slate-200 bg-white p-5 xl:max-h-[calc(100vh-132px)] xl:overflow-y-auto">
          <CornerTicks className="text-slate-200" />
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Proceso</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">{process?.nombre ?? finding.titulo}</h2>
          {process?.area && <p className="mt-2 text-sm text-slate-600">Área: {process.area}</p>}
          {process?.descripcion && <p className="mt-4 text-sm leading-relaxed text-slate-600">{process.descripcion}</p>}

          <div className="mt-6">
            <InfoRow label="Hallazgo" value={finding.titulo} />
            <InfoRow label="Responsable Methodical" value={process?.responsable_methodical ?? "Methodical"} />
            <InfoRow label="Responsable cliente" value={process?.responsable_cliente ?? session.empresa} />
          </div>

          <div className="mt-6 rounded-sm border border-blue-900/40 bg-[#071330] p-4 text-white">
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-200/70">Atajos</p>
            <p className="mt-2 font-display text-xs leading-relaxed text-blue-50/70">
              + / −&nbsp; zoom · 0&nbsp; ajustar al ancho · F&nbsp; pantalla completa · rueda para desplazar · Ctrl + rueda para zoom.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

const findProcessForFinding = (data: PortalData | null, finding: PortalFinding | null): PortalProcess | null => {
  if (!data || !finding) return null;

  for (const project of data.proyectos ?? []) {
    for (const process of project.procesos ?? []) {
      if (process.hallazgos?.some((item) => item.id === finding.id)) return process;
    }
  }

  return null;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
    <span className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">{label}</span>
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
      <p className="mt-6 font-display text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200/60">— Visor de hallazgos</p>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight text-white">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  </main>
);

export default HallazgoViewerPage;
