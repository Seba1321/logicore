import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/portal/technical";
import { ProcessStagePill } from "@/components/portal/ui";
import { deriveProcessStage } from "@/lib/portal-progress";
import { cn, withVersion } from "@/lib/utils";
import type { PortalProcess } from "@/lib/supabase";

type TabKey = "bpmn" | "hammer" | "informe";

const TAB_LABEL: Record<TabKey, string> = {
  bpmn: "BPMN",
  hammer: "HAMMER",
  informe: "Informe",
};

// Cada pestaña se reduce a lo mismo: una lista de piezas con título, bajada y
// una forma de abrirlas. Así el panel no necesita tres ramas de render.
type Entry = {
  id: number;
  titulo: string;
  descripcion: string | null;
  /** Miniatura, solo para las matrices HAMMER. Los BPMN no tienen preview. */
  imagen: string | null;
  /** Ruta interna del visor, o null si la pieza se abre como archivo externo. */
  ruta: string | null;
  /** URL directa del archivo, solo para los informes en PDF. */
  archivo: string | null;
};

export const ProcesoPanel = ({ process, index }: { process: PortalProcess; index: number }) => {
  const entries = useMemo<Record<TabKey, Entry[]>>(
    () => ({
      bpmn: (process.bpmn ?? []).map((diagram) => ({
        id: diagram.id,
        titulo: diagram.nombre,
        descripcion: diagram.descripcion,
        imagen: null,
        ruta: `/portal/bpmn/${diagram.id}`,
        archivo: null,
      })),
      hammer: (process.hallazgos ?? []).map((finding) => ({
        id: finding.id,
        titulo: finding.titulo,
        descripcion: finding.descripcion,
        imagen: withVersion(finding.archivo_url, finding.id),
        ruta: `/portal/hallazgo/${finding.id}`,
        archivo: null,
      })),
      informe: (process.informes ?? []).map((informe) => ({
        id: informe.id,
        titulo: informe.nombre,
        descripcion: informe.descripcion,
        imagen: null,
        ruta: null,
        archivo: withVersion(informe.archivo_url, informe.updated_at ?? informe.id),
      })),
    }),
    [process]
  );

  const tabs: TabKey[] = ["bpmn", "hammer", "informe"];
  const firstWithContent = tabs.find((tab) => entries[tab].length) ?? "bpmn";

  const [activeTab, setActiveTab] = useState<TabKey>(firstWithContent);
  // Una selección por pestaña: cambiar de pestaña no debe perder lo elegido en la otra.
  const [selectedByTab, setSelectedByTab] = useState<Partial<Record<TabKey, number>>>({});

  const activeEntries = entries[activeTab];
  const selected =
    activeEntries.find((entry) => entry.id === selectedByTab[activeTab]) ?? activeEntries[0] ?? null;

  const stage = deriveProcessStage(process);
  const subtitle = [process.area, process.responsable_cliente].filter(Boolean).join(" · ");

  return (
    <section className="relative overflow-hidden rounded-sm border border-slate-200 bg-white">
      <CornerTicks className="text-slate-200" />

      <header className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-start md:justify-between md:p-8">
        <div>
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
            Proceso {String(index).padStart(2, "0")}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-slate-950 md:text-3xl">
            {process.nombre}
          </h3>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        </div>
        <ProcessStagePill stage={stage} />
      </header>

      <div className="p-6 md:p-8">
        <div role="tablist" aria-label={`Entregables de ${process.nombre}`} className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count = entries[tab].length;
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={!count}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-slate-900",
                  !count && "cursor-not-allowed border-dashed text-slate-400 hover:border-slate-200 hover:text-slate-400"
                )}
              >
                {TAB_LABEL[tab]}
                <span className={cn("tabular-nums", isActive ? "text-blue-100" : "text-slate-400")}>
                  {count || "—"}
                </span>
              </button>
            );
          })}
        </div>

        {selected ? (
          <div className="mt-6">
            {/* Con una sola pieza el selector sobra: el título ya la identifica. */}
            {activeEntries.length > 1 && (
              <label className="block">
                <span className="sr-only">Seleccionar {TAB_LABEL[activeTab]} de {process.nombre}</span>
                <select
                  value={selected.id}
                  onChange={(event) =>
                    setSelectedByTab((current) => ({ ...current, [activeTab]: Number(event.target.value) }))
                  }
                  className="w-full rounded-sm border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {activeEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.titulo}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
              {selected.imagen && (
                <Link
                  to={selected.ruta ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-50 transition hover:border-blue-300 sm:w-64"
                >
                  <img
                    src={selected.imagen}
                    alt={selected.titulo}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover object-top"
                  />
                </Link>
              )}

              <div className="flex-1">
                <p className="font-display text-lg font-semibold leading-tight text-slate-950">{selected.titulo}</p>
                {selected.descripcion && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.descripcion}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {selected.ruta && (
                    <Button asChild>
                      <Link to={selected.ruta} target="_blank" rel="noreferrer">
                        Ver pantalla completa
                      </Link>
                    </Button>
                  )}
                  {selected.archivo && (
                    <>
                      <Button asChild>
                        <a href={selected.archivo} target="_blank" rel="noreferrer">
                          Ver PDF
                        </a>
                      </Button>
                      <Button asChild variant="secondary">
                        <a href={selected.archivo} download>
                          Descargar
                        </a>
                      </Button>
                    </>
                  )}
                  {!selected.ruta && !selected.archivo && (
                    <p className="text-sm text-slate-500">Archivo no disponible.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">
            Este proceso todavía no tiene entregables publicados.
          </p>
        )}
      </div>
    </section>
  );
};
