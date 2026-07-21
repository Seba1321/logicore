import { Button } from "@/components/ui/button";
import { withVersion } from "@/lib/utils";
import type { PortalInforme, PortalProcess } from "@/lib/supabase";

export const InformeLibrary = ({
  entries,
}: {
  entries: Array<{ process: PortalProcess; informe: PortalInforme }>;
}) => (
  <section className="rounded-sm border border-slate-200 bg-white p-6">
    <div className="mb-6">
      <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Informes</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Informes por proceso</h2>
      <p className="mt-2 text-sm text-slate-600">Descarga o visualiza el informe final en PDF de cada proceso.</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {entries.map(({ process, informe }, index) => {
        const informeUrl = withVersion(informe.archivo_url, informe.updated_at ?? informe.id);
        return (
        <div key={informe.id} className="rounded-sm border border-slate-200 p-5 transition hover:border-blue-300">
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <p className="font-display text-[11px] tracking-[0.1em] text-slate-500">R-{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-display text-xl font-semibold leading-tight text-slate-950">{informe.nombre}</p>
              <p className="mt-2 text-sm text-slate-600">
                {process.nombre} · {process.area ?? "Proceso"}
              </p>
              {informe.descripcion && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{informe.descripcion}</p>
              )}
            </div>
            {informeUrl ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild className="w-full sm:w-fit">
                  <a href={informeUrl} target="_blank" rel="noreferrer">
                    Ver PDF
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-fit">
                  <a href={informeUrl} download>
                    Descargar
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">PDF no disponible.</p>
            )}
          </div>
        </div>
        );
      })}
    </div>
  </section>
);
