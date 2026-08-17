import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/portal/technical";
import { ProcessStagePill } from "@/components/portal/ui";
import { deriveProcessStage } from "@/lib/portal-progress";
import { withVersion } from "@/lib/utils";
import type { PortalProcess } from "@/lib/supabase";

// El panel muestra todo lo publicado de un proceso a la vez, agrupado por tipo.
// El orden de los grupos es el del embudo (PROCESS_STAGE_ORDER), que es el
// orden real del trabajo: primero se modela, después se diagnostica, al final
// se entrega el informe.

const contar = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;

const GroupHeader = ({ label, meta }: { label: string; meta: string }) => (
  <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
    {label} <span className="text-slate-400">· {meta}</span>
  </p>
);

// Un grupo sin publicar no desaparece: deja explícito qué falta todavía.
const EmptyGroup = ({ label }: { label: string }) => (
  <GroupHeader label={label} meta="en preparación" />
);

export const ProcesoPanel = ({ process, index }: { process: PortalProcess; index: number }) => {
  const diagrams = process.bpmn ?? [];
  const findings = process.hallazgos ?? [];
  const informes = process.informes ?? [];

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
        <ProcessStagePill stage={deriveProcessStage(process)} />
      </header>

      <div className="space-y-8 p-6 md:p-8">
        <section>
          {diagrams.length ? (
            <>
              <GroupHeader label="BPMN" meta={contar(diagrams.length, "diagrama", "diagramas")} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {diagrams.map((diagram) => (
                  <DiagramCard
                    key={diagram.id}
                    to={`/portal/bpmn/${diagram.id}`}
                    titulo={diagram.nombre}
                    descripcion={diagram.descripcion}
                    preview={withVersion(diagram.preview_url, diagram.updated_at ?? diagram.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyGroup label="BPMN" />
          )}
        </section>

        <section>
          {findings.length ? (
            <>
              <GroupHeader
                label="Análisis HAMMER"
                meta={contar(findings.length, "matriz", "matrices")}
              />
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {findings.map((finding) => (
                  <MatrixCard
                    key={finding.id}
                    to={`/portal/hallazgo/${finding.id}`}
                    titulo={finding.titulo}
                    imagen={withVersion(finding.archivo_url, finding.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyGroup label="Análisis HAMMER" />
          )}
        </section>

        <section>
          {informes.length ? (
            <>
              <GroupHeader
                label="Informe final"
                meta={contar(informes.length, "documento", "documentos")}
              />
              <div className="mt-4 space-y-3">
                {informes.map((informe) => (
                  <InformeRow
                    key={informe.id}
                    titulo={informe.nombre}
                    descripcion={informe.descripcion}
                    archivo={withVersion(informe.archivo_url, informe.updated_at ?? informe.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyGroup label="Informe final" />
          )}
        </section>
      </div>
    </section>
  );
};

// El diagrama es apaisado y muy ancho, así que la miniatura va completa: la
// gracia es reconocer la forma del flujo antes de abrirlo.
const DiagramCard = ({
  to,
  titulo,
  descripcion,
  preview,
}: {
  to: string;
  titulo: string;
  descripcion: string | null;
  preview: string | null;
}) => (
  <Link
    to={to}
    target="_blank"
    rel="noreferrer"
    className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 transition hover:border-blue-300"
  >
    {/* Proporción fija para que el diagrama llene el ancho de la tarjeta: los
        BPMN van de 1.8:1 a 3.9:1, y con una altura fija los más anchos
        quedaban diminutos. */}
    {preview ? (
      <div className="aspect-[2/1] border-b border-slate-200 bg-slate-50 p-3">
        <img
          src={preview}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
        />
      </div>
    ) : (
      <div className="flex aspect-[2/1] items-center justify-center border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
        Sin vista previa
      </div>
    )}
    <div className="flex flex-1 flex-col p-4">
      <p className="font-display text-base font-semibold leading-snug text-slate-950">{titulo}</p>
      {descripcion && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{descripcion}</p>}
      <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-600">
        Ver diagrama →
      </p>
    </div>
  </Link>
);

// La matriz es un documento vertical: se recorta desde arriba, donde está la
// banda de título que la identifica.
const MatrixCard = ({
  to,
  titulo,
  imagen,
}: {
  to: string;
  titulo: string;
  imagen: string | null;
}) => (
  <Link
    to={to}
    target="_blank"
    rel="noreferrer"
    className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 transition hover:border-blue-300"
  >
    <div className="aspect-[4/3] overflow-hidden border-b border-slate-200 bg-slate-50">
      {imagen ? (
        <img
          src={imagen}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-slate-500">
          Sin imagen
        </div>
      )}
    </div>
    <p className="p-3 font-display text-xs font-semibold leading-snug text-slate-950">{titulo}</p>
  </Link>
);

const InformeRow = ({
  titulo,
  descripcion,
  archivo,
}: {
  titulo: string;
  descripcion: string | null;
  archivo: string | null;
}) => (
  <div className="flex flex-col gap-4 rounded-sm border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-display text-base font-semibold leading-snug text-slate-950">{titulo}</p>
      {descripcion && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{descripcion}</p>}
    </div>
    {archivo ? (
      <div className="flex shrink-0 flex-wrap gap-3">
        <Button asChild>
          <a href={archivo} target="_blank" rel="noreferrer">
            Ver PDF
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={archivo} download>
            Descargar
          </a>
        </Button>
      </div>
    ) : (
      <p className="text-sm text-slate-500">PDF no disponible.</p>
    )}
  </div>
);
