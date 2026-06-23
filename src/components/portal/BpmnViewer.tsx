import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Expand, Minimize, Minus, Plus, Scan } from "lucide-react";

import { cn } from "@/lib/utils";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

type BpmnViewerInstance = import("bpmn-js/lib/NavigatedViewer").default;

export type BpmnStats = {
  tareas: number;
  compuertas: number;
  eventos: number;
  flujos: number;
  total: number;
};

type BpmnViewerProps = {
  xmlUrl?: string | null;
  title?: string;
  className?: string;
  heightClassName?: string;
  showHeader?: boolean;
  initialZoom?: "fit-viewport" | number;
  onStats?: (stats: BpmnStats) => void;
};

const ToolButton = ({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
  >
    {children}
  </button>
);

export const BpmnViewer = ({
  xmlUrl,
  title,
  className,
  heightClassName = "h-[420px]",
  showHeader = true,
  initialZoom = "fit-viewport",
  onStats,
}: BpmnViewerProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<BpmnViewerInstance | null>(null);
  const hoverRef = useRef(false);
  const onStatsRef = useRef(onStats);
  onStatsRef.current = onStats;

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    xmlUrl ? "loading" : "idle"
  );
  const [zoomPct, setZoomPct] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!xmlUrl || !containerRef.current) {
      setStatus("idle");
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;
    viewerRef.current?.destroy();
    viewerRef.current = null;
    setStatus("loading");

    Promise.all([
      import("bpmn-js/lib/NavigatedViewer"),
      fetch(xmlUrl, { signal: abortController.signal }).then((response) => {
        if (!response.ok) throw new Error("No se pudo descargar el BPMN");
        return response.text();
      }),
    ])
      .then(([viewerModule, xml]) => {
        if (!containerRef.current || !isMounted) return null;
        viewerRef.current = new viewerModule.default({ container: containerRef.current });
        return viewerRef.current.importXML(xml);
      })
      .then(() => {
        const viewer = viewerRef.current;
        if (!viewer || !isMounted) return;

        const canvas = viewer.get("canvas");
        canvas.zoom(initialZoom, "auto");
        setZoomPct(Math.round(canvas.zoom() * 100));

        const stats: BpmnStats = { tareas: 0, compuertas: 0, eventos: 0, flujos: 0, total: 0 };
        for (const element of viewer.get("elementRegistry").getAll()) {
          if (element.type === "label") continue;
          const type = element.businessObject?.$type ?? element.type ?? "";
          if (type.includes("Gateway")) stats.compuertas++;
          else if (type.includes("Task") || type.endsWith("SubProcess")) stats.tareas++;
          else if (type.includes("Event")) stats.eventos++;
          else if (type.includes("SequenceFlow")) stats.flujos++;
        }
        stats.total = stats.tareas + stats.compuertas + stats.eventos;
        onStatsRef.current?.(stats);

        setStatus("ready");
      })
      .catch((error) => {
        if (abortController.signal.aborted || !isMounted) return;
        console.error(error);
        setStatus("error");
      });

    return () => {
      isMounted = false;
      abortController.abort();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [initialZoom, xmlUrl]);

  const fit = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const canvas = viewer.get("canvas");
    canvas.zoom("fit-viewport", "auto");
    setZoomPct(Math.round(canvas.zoom() * 100));
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const canvas = viewer.get("canvas");
    const next = Math.max(0.2, Math.min(4, canvas.zoom() * factor));
    canvas.zoom(next);
    setZoomPct(Math.round(canvas.zoom() * 100));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (status !== "ready" || !hoverRef.current) return;
      if (event.key === "+" || event.key === "=") zoomBy(1.2);
      else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.2);
      else if (event.key === "0") fit();
      else if (event.key.toLowerCase() === "f") toggleFullscreen();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, zoomBy, fit, toggleFullscreen]);

  if (!xmlUrl) {
    return (
      <div
        className={cn(
          "flex min-h-[340px] items-center justify-center rounded-sm border border-dashed border-border bg-secondary/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Selecciona un BPMN publicado con URL para visualizarlo aquí.
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      className={cn("relative flex flex-col overflow-hidden rounded-sm border border-border bg-white", className)}
    >
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">BPMN</span>
            <span className="text-sm font-semibold text-slate-800">{title ?? "Visor"}</span>
          </div>
          <div className="flex items-center gap-1">
            <ToolButton label="Alejar" onClick={() => zoomBy(1 / 1.2)}>
              <Minus size={15} />
            </ToolButton>
            <span className="w-12 text-center font-mono text-xs tabular-nums text-slate-600">{zoomPct}%</span>
            <ToolButton label="Acercar" onClick={() => zoomBy(1.2)}>
              <Plus size={15} />
            </ToolButton>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolButton label="Ajustar (0)" onClick={fit}>
              <Scan size={15} />
            </ToolButton>
            <ToolButton label="Pantalla completa (F)" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={15} /> : <Expand size={15} />}
            </ToolButton>
          </div>
        </div>
      )}

      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div
          ref={containerRef}
          className={cn(
            "relative w-full transition-opacity duration-500",
            heightClassName,
            status === "ready" ? "opacity-100" : "opacity-0"
          )}
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/90">
            <div className="flex items-center gap-3 opacity-70">
              <span className="h-10 w-20 animate-pulse rounded-sm bg-slate-200" />
              <span className="h-px w-8 bg-slate-300" />
              <span className="h-10 w-20 animate-pulse rounded-sm bg-slate-200 [animation-delay:160ms]" />
              <span className="h-px w-8 bg-slate-300" />
              <span className="h-9 w-9 rotate-45 animate-pulse bg-slate-200 [animation-delay:320ms]" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Cargando diagrama
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
            <p className="max-w-sm text-sm text-destructive">
              No se pudo cargar el archivo BPMN. Revisa que la URL sea pública o que tenga CORS
              habilitado.
            </p>
          </div>
        )}

        {status === "ready" && (
          <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            arrastra para mover · rueda para zoom
          </span>
        )}
      </div>
    </div>
  );
};
