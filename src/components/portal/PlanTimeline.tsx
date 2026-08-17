import { motion, useReducedMotion } from "framer-motion";

import { CornerTicks, CountUp } from "@/components/portal/technical";
import {
  DAY_MS,
  formatDate,
  formatDayMonth,
  getPlanCalendar,
  getPlanPhases,
  type PhaseStatus,
  type PlanPhase,
  type PlanRange,
} from "@/lib/portal-progress";
import type { PortalTask } from "@/lib/supabase";

const STATUS_META: Record<
  PhaseStatus,
  { label: string; marker: string; segment: string; node: string; dot: string; text: string }
> = {
  completada: {
    label: "Completada",
    marker: "✓",
    segment: "bg-emerald-400",
    node: "bg-emerald-400 text-[#04102b] shadow-[0_0_0_4px_rgba(5,16,38,0.9)]",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
  en_curso: {
    label: "En curso",
    marker: "▸",
    segment: "bg-sky-300",
    node: "bg-sky-300 text-[#04102b] shadow-[0_0_0_4px_rgba(5,16,38,0.9),0_0_18px_rgba(125,211,252,0.55)]",
    dot: "bg-sky-300",
    text: "text-sky-300",
  },
  proxima: {
    label: "Próxima",
    marker: "",
    // Hueco de verdad: el relleno es el mismo fondo del canal, así el chip lee
    // como un hito todavía sin cumplir y no como un disco apagado.
    segment: "bg-transparent",
    node: "bg-[#050f26] text-blue-100/45 ring-1 ring-inset ring-white/20 shadow-[0_0_0_4px_rgba(5,16,38,0.9)]",
    dot: "bg-white/40",
    text: "text-blue-100/50",
  },
};

const pct = (time: number, range: PlanRange) =>
  Math.max(0, Math.min(100, ((time - range.start) / (range.end - range.start)) * 100));

// Etiquetas de mes ubicadas proporcionalmente sobre el eje del plan.
const getMonthTicks = (range: PlanRange) => {
  const ticks: Array<{ label: string; pos: number }> = [];
  const start = new Date(range.start);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor.getTime() <= range.end) {
    if (cursor.getTime() >= range.start - 31 * DAY_MS) {
      const label = new Intl.DateTimeFormat("es-CL", { month: "short" })
        .format(cursor)
        .replace(".", "");
      ticks.push({ label, pos: pct(cursor.getTime(), range) });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
};

const edgeTranslate = (pos: number) =>
  pos < 6 ? "translate-x-0" : pos > 94 ? "-translate-x-full" : "-translate-x-1/2";

// El plan como cinta de tiempo panorámica arriba (proporcional, con marcador de
// "hoy") y una leyenda de fases en columnas parejas abajo (siempre legible).
export const PlanTimeline = ({
  tasks,
  today,
  progress,
}: {
  tasks: PortalTask[];
  today: number;
  progress: number;
}) => {
  const calendar = getPlanCalendar(tasks, today);
  const phases = getPlanPhases(tasks, today);

  return (
    <div className="relative rounded-sm border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm md:p-8">
      <CornerTicks className="text-white/20" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.14em] text-blue-100/70">
          Plan del levantamiento
        </p>
        {calendar && (
          <p className="flex items-baseline gap-3 font-display text-[11px] font-medium uppercase tracking-[0.08em] text-blue-100/50">
            <span>
              {formatDate(calendar.range.start)} — {formatDate(calendar.range.end - DAY_MS)}
            </span>
            {calendar.todayInRange && (
              <span className="inline-flex items-center gap-1.5 text-blue-50/80">
                <span className="h-1 w-1 rounded-full bg-red-400" />
                Hoy · {formatDayMonth(today)}
              </span>
            )}
          </p>
        )}
      </div>

      {/* El porcentaje es la lectura de la cápsula, así que va pegado a ella y
          no en una barra propia al pie del panel. */}
      <div className="mt-7 flex items-end gap-4">
        <p className="font-display text-6xl font-semibold leading-none tabular-nums text-white">
          <CountUp value={progress} suffix="%" />
        </p>
        <div className="pb-1">
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-100/70">
            Avance según plan
          </p>
          {calendar?.todayInRange && (
            <p className="mt-1 font-display text-[11px] font-medium uppercase tracking-[0.08em] text-blue-100/55">
              Día {calendar.dayIndex} de {calendar.totalDays}
            </p>
          )}
        </div>
      </div>

      {calendar && phases.length > 0 && (
        <>
          <Ribbon range={calendar.range} phases={phases} todayPosition={calendar.todayPosition} />
          <PhaseLegend phases={phases} />
        </>
      )}
    </div>
  );
};

// La cinta es una cápsula hundida: el riel vive en un canal más oscuro que el
// panel, los tramos cumplidos lo rellenan y cada fase se marca con un chip que
// se sienta encima. Los chips van al centro de su porcentaje, así que la
// cápsula lleva padding lateral igual a su radio para que el primero y el
// último no se salgan del canal.
const NODE_RADIUS = "0.875rem"; // la mitad de un chip de 28px

// Como SVG y no como carácter "✓": el glifo depende de las métricas de la
// fuente —y de si la fuente lo tiene— así que nunca queda centrado igual.
const CheckMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
    {/* Subido un cuarto de unidad: el vértice inferior es un punto, así que la
        marca centrada por caja se lee baja dentro del círculo. */}
    <path d="M5 11.75 L9.75 16.5 L19 6.5" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Ribbon = ({
  range,
  phases,
  todayPosition,
}: {
  range: PlanRange;
  phases: PlanPhase[];
  todayPosition: number | null;
}) => {
  const ticks = getMonthTicks(range);
  const reduce = useReducedMotion();

  return (
    <div className="mt-8" style={{ paddingInline: NODE_RADIUS }}>
      {/* Ticks de meses, alineados al mismo eje que los chips */}
      <div className="relative mb-3 h-3">
        {ticks.map((tick) => (
          <span
            key={`${tick.label}-${tick.pos}`}
            className={`absolute font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100/40 ${edgeTranslate(tick.pos)}`}
            style={{ left: `${tick.pos}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      <div
        className="relative rounded-full bg-[#050f26] py-4 ring-1 ring-inset ring-white/[0.07]"
        style={{ marginInline: `-${NODE_RADIUS}`, paddingInline: NODE_RADIUS }}
      >
        <div className="relative h-3.5">
          {/* Canal vacío */}
          <div className="absolute inset-x-0 top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-white/[0.06]" />

          {/* Tramos cumplidos */}
          {phases.map((phase, index) => {
            const startPos = pct(phase.start, range);
            const trackEnd = index < phases.length - 1 ? pct(phases[index + 1].start, range) : 100;
            // La fase en curso se rellena solo hasta hoy: llenarla hasta el
            // inicio de la siguiente declararía un avance que aún no ocurre.
            const endPos =
              phase.status === "en_curso" && todayPosition !== null
                ? Math.min(trackEnd, Math.max(startPos, todayPosition))
                : trackEnd;
            const width = Math.max(0, endPos - startPos);
            const meta = STATUS_META[phase.status];

            if (phase.status === "proxima") return null;

            return (
              <motion.div
                key={phase.fase}
                className={`absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full ${meta.segment}`}
                style={{ left: `${startPos}%` }}
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${width}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.09, ease: "easeOut" }}
              >
                {/* Cabeza brillante solo en el tramo que efectivamente llega a
                    hoy. Cuando dos fases se traslapan, la que corta antes
                    termina en un límite de fase, no en el avance real. */}
                {phase.status === "en_curso" &&
                  todayPosition !== null &&
                  todayPosition <= trackEnd && (
                    <span className="absolute right-0 top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  )}
              </motion.div>
            );
          })}

          {/* Chips de fase. El centrado vive en el contenedor y la animación en
              el chip: framer-motion escribe `transform` en línea, así que si
              ambos compartieran elemento la escala borraría el translate que
              centra el chip sobre su fecha. */}
          {phases.map((phase, index) => {
            const meta = STATUS_META[phase.status];
            return (
              <div
                key={`node-${phase.fase}`}
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct(phase.start, range)}%` }}
              >
                <motion.span
                  aria-hidden
                  // Achicados en pantallas angostas: dos fases que empiezan con
                  // pocos días de diferencia quedan a milímetros en el eje.
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-[10px] font-bold leading-none sm:h-7 sm:w-7 sm:text-xs ${meta.node}`}
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.12 + index * 0.09, ease: "backOut" }}
                >
                  {phase.status === "completada" ? (
                    <CheckMark />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </motion.span>
              </div>
            );
          })}

          {/* "Hoy" se marca sobre el canal, no cruzándolo: dentro del canal ese
              punto ya lo señala la cabeza brillante del tramo en curso. */}
          {todayPosition !== null && (
            <div
              className="absolute bottom-full z-20 mb-1 h-3 w-px -translate-x-px bg-red-400/60"
              style={{ left: `${todayPosition}%` }}
            >
              <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Leyenda de fases en columnas parejas: no depende de las posiciones del eje, así
// que nunca se encabalga por más juntas que empiecen las fases.
const PhaseLegend = ({ phases }: { phases: PlanPhase[] }) => (
  <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
    {phases.map((phase, index) => {
      const meta = STATUS_META[phase.status];
      return (
        <div key={`legend-${phase.fase}`} className="border-t border-white/10 pt-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.1em] text-blue-100/40">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          </div>
          <p className="mt-2 font-display text-sm font-semibold leading-snug text-white">{phase.fase}</p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-blue-100/45">
            {formatDayMonth(phase.start)} — {formatDayMonth(phase.end)}
          </p>
          <p className={`mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] ${meta.text}`}>
            {meta.marker && <span className="mr-1">{meta.marker}</span>}
            {meta.label}
          </p>
        </div>
      );
    })}
  </div>
);
