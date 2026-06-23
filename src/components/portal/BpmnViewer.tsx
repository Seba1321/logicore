import { useEffect, useRef, useState } from "react";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

type BpmnViewerInstance = import("bpmn-js/lib/Viewer").default;

type BpmnViewerProps = {
  xmlUrl?: string | null;
  title?: string;
};

export const BpmnViewer = ({ xmlUrl, title }: BpmnViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    xmlUrl ? "loading" : "idle"
  );

  useEffect(() => {
    if (!xmlUrl || !containerRef.current) {
      setStatus("idle");
      return;
    }

    const abortController = new AbortController();
    let viewer: BpmnViewerInstance | null = null;
    let isMounted = true;

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
        viewer = new viewerModule.default({ container: containerRef.current });
        return viewer.importXML(xml);
      })
      .then(() => {
        if (!viewer || !isMounted) return;
        viewer.get("canvas").zoom("fit-viewport");
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
      viewer?.destroy();
    };
  }, [xmlUrl]);

  if (!xmlUrl) {
    return (
      <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/60 p-6 text-center text-sm text-muted-foreground">
        Selecciona un BPMN publicado con URL para visualizarlo aquí.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">{title ?? "Visor BPMN"}</p>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {status === "loading" && "Cargando"}
          {status === "ready" && "Listo"}
          {status === "error" && "Error"}
          {status === "idle" && "Sin archivo"}
        </span>
      </div>
      <div ref={containerRef} className="h-[420px] w-full" />
      {status === "error" && (
        <p className="border-t border-border px-4 py-3 text-sm text-destructive">
          No se pudo cargar el archivo BPMN. Revisa que la URL sea pública o que tenga CORS habilitado.
        </p>
      )}
    </div>
  );
};
