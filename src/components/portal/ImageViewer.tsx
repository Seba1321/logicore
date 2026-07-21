import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Expand, Minimize, Minus, MoveHorizontal, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type ImageViewerProps = {
  src?: string | null;
  title?: string;
  className?: string;
  heightClassName?: string;
  showHeader?: boolean;
};

const MIN_WIDTH = 50;
const MAX_WIDTH = 250;
const STEP = 20;

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

// Lector de páginas para las matrices HAMMER (imágenes tipo documento): la página
// encaja al ancho y se lee con scroll vertical, como un PDF. El zoom controla el
// ancho de la página, no un lienzo con pan.
export const ImageViewer = ({
  src,
  title,
  className,
  heightClassName = "h-[420px]",
  showHeader = true,
}: ImageViewerProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(src ? "loading" : "idle");
  const [widthPct, setWidthPct] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fitWidth = useCallback(() => {
    setWidthPct(100);
    scrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    setStatus(src ? "loading" : "idle");
    setWidthPct(100);
  }, [src]);

  const zoomBy = useCallback((delta: number) => {
    setWidthPct((current) => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, current + delta)));
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
      if (event.key === "+" || event.key === "=") zoomBy(STEP);
      else if (event.key === "-" || event.key === "_") zoomBy(-STEP);
      else if (event.key === "0") fitWidth();
      else if (event.key.toLowerCase() === "f") toggleFullscreen();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, zoomBy, fitWidth, toggleFullscreen]);

  // Ctrl/⌘ + rueda hace zoom de ancho; la rueda sola desplaza (scroll nativo).
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (status !== "ready" || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? STEP : -STEP);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [status, zoomBy]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex min-h-[340px] items-center justify-center rounded-sm border border-dashed border-border bg-secondary/60 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        No hay imagen publicada para visualizar.
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
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Documento</span>
            <span className="text-sm font-semibold text-slate-800">{title ?? "Visor"}</span>
          </div>
          <div className="flex items-center gap-1">
            <ToolButton label="Reducir" onClick={() => zoomBy(-STEP)}>
              <Minus size={15} />
            </ToolButton>
            <span className="w-12 text-center font-display text-xs tabular-nums text-slate-600">{widthPct}%</span>
            <ToolButton label="Ampliar" onClick={() => zoomBy(STEP)}>
              <Plus size={15} />
            </ToolButton>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolButton label="Ajustar al ancho (0)" onClick={fitWidth}>
              <MoveHorizontal size={15} />
            </ToolButton>
            <ToolButton label="Pantalla completa (F)" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={15} /> : <Expand size={15} />}
            </ToolButton>
          </div>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className={cn("h-full w-full overflow-auto bg-slate-100 px-4 py-5", heightClassName)}
        >
          <img
            src={src}
            alt={title ?? "Hallazgo"}
            draggable={false}
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("error")}
            style={{ width: `${widthPct}%` }}
            className={cn(
              "mx-auto block h-auto max-w-none rounded-sm bg-white shadow-[0_2px_20px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 transition-[width] duration-150 ease-out",
              status === "ready" ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/90">
            <div className="flex items-center gap-3 opacity-70">
              <span className="h-24 w-16 animate-pulse rounded-sm bg-slate-200" />
              <span className="h-24 w-16 animate-pulse rounded-sm bg-slate-200 [animation-delay:160ms]" />
            </div>
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Cargando documento
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
            <p className="max-w-sm text-sm text-destructive">
              No se pudo cargar la imagen. Revisa que la URL sea pública.
            </p>
          </div>
        )}

        {status === "ready" && (
          <span className="pointer-events-none absolute bottom-2 right-3 rounded-sm bg-white/80 px-2 py-0.5 font-display text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500 backdrop-blur-sm">
            rueda para desplazar · Ctrl + rueda para zoom
          </span>
        )}
      </div>
    </div>
  );
};
