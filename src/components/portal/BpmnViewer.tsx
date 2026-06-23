import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

type BpmnViewerInstance = import("bpmn-js/lib/Viewer").default;

type BpmnViewerProps = {
  xmlUrl?: string | null;
  title?: string;
  className?: string;
  heightClassName?: string;
  showHeader?: boolean;
  initialZoom?: "fit-viewport" | number;
};

export const BpmnViewer = ({
  xmlUrl,
  title,
  className,
  heightClassName = "h-[420px]",
  showHeader = true,
  initialZoom = "fit-viewport",
}: BpmnViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<BpmnViewerInstance | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    xmlUrl ? "loading" : "idle"
  );

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
      import("bpmn-js/lib/Viewer"),
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
        if (!viewerRef.current || !isMounted) return;
        viewerRef.current.get("canvas").zoom(initialZoom, "auto");
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

  const zoom = (value: "fit-viewport" | number) => {
    viewerRef.current?.get("canvas").zoom(value);
  };

  if (!xmlUrl) {
    return (
      <div className={cn("flex min-h-[340px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/60 p-6 text-center text-sm text-muted-foreground", className)}>
        Selecciona un BPMN publicado con URL para visualizarlo aquí.
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white", className)}>
      {showHeader && (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{title ?? "Visor BPMN"}</p>
            <p className="text-xs text-muted-foreground">
              {status === "loading" && "Cargando diagrama"}
              {status === "ready" && "Diagrama listo"}
              {status === "error" && "Error al cargar"}
              {status === "idle" && "Sin archivo"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => zoom("fit-viewport")}>
              Ajustar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => zoom(0.5)}>
              50%
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => zoom(0.8)}>
              80%
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => zoom(1)}>
              100%
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => zoom(1.15)}>
              115%
            </Button>
          </div>
        </div>
      )}
      <div ref={containerRef} className={cn("w-full", heightClassName)} />
      {status === "error" && (
        <p className="border-t border-border px-4 py-3 text-sm text-destructive">
          No se pudo cargar el archivo BPMN. Revisa que la URL sea pública o que tenga CORS habilitado.
        </p>
      )}
    </div>
  );
};
