import { motion } from "framer-motion";

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
  { label: string; marker: string; segment: string; node: string; text: string }
> = {
  completada: {
    label: "Completada",
    marker: "✓",
    segment: "bg-emerald-400",
    node: "border-emerald-300 bg-emerald-400",
    text: "text-emerald-300",
  },
  en_curso: {
    label: "En curso",
    marker: "▸",
    segment: "bg-sky-300",
    node: "border-sky-200 bg-sky-300 ring-4 ring-sky-300/25",
    text: "text-sky-300",
  },
  proxima: {
    label: "Próxima",
    marker: "",
    segment: "bg-white/15",
    node: "border-white/40 bg-transparent",
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

// Traslación horizontal para que las etiquetas no se corten en los bordes.
const edgeTranslate = (pos: number) =>
  pos < 8 ? "translate-x-0" : pos > 92 ? "-translate-x-full" : "-translate-x-1/2";

// El plan como una cinta de tiempo panorámica: las fases son segmentos
// proporcionales a su duración, unidos por nodos, con un marcador de "hoy".
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
    <div className="relative rounded-sm border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm md:p-7">
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

      {calendar && phases.length > 0 && (
        <div className="mt-8 overflow-x-auto pb-1">
          <Ribbon range={calendar.range} phases={phases} todayPosition={calendar.todayPosition} />
        </div>
      )}

      <div className="mt-7 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
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
        <div className="h-2 w-full rounded-sm bg-white/15 sm:max-w-xs">
          <motion.div
            className="h-2 rounded-sm bg-blue-400"
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

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

  return (
    <div className="min-w-[560px]">
      {/* Ticks de meses */}
      <div className="relative h-4">
        {ticks.map((tick) => (
          <span
            key={`${tick.label}-${tick.pos}`}
            className={`absolute font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100/40 ${edgeTranslate(tick.pos)}`}
            style={{ left: `${tick.pos}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      {/* Cinta: baseline + segmentos + nodos + marcador de hoy */}
      <div className="relative mx-1 h-8">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />

        {phases.map((phase, index) => {
          const startPos = pct(phase.start, range);
          const endPos = index < phases.length - 1 ? pct(phases[index + 1].start, range) : 100;
          const meta = STATUS_META[phase.status];
          const dashed = phase.status === "proxima";
          return (
            <div
              key={phase.fase}
              className={`absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full ${meta.segment} ${dashed ? "opacity-60" : ""}`}
              style={{ left: `${startPos}%`, width: `${Math.max(0, endPos - startPos)}%` }}
            />
          );
        })}

        {phases.map((phase) => {
          const meta = STATUS_META[phase.status];
          return (
            <span
              key={`node-${phase.fase}`}
              className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${meta.node}`}
              style={{ left: `${pct(phase.start, range)}%` }}
            />
          );
        })}

        {/* Nodo terminal (fin del plan) */}
        <span className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white/40 bg-transparent" />

        {todayPosition !== null && (
          <div className="absolute inset-y-0 z-10" style={{ left: `${todayPosition}%` }}>
            <div className="h-full w-px bg-red-400" />
            <span className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-red-400 ring-2 ring-red-400/30" />
          </div>
        )}
      </div>

      {/* Etiquetas de fase */}
      <div className="relative mt-3 h-14">
        {phases.map((phase) => {
          const pos = pct(phase.start, range);
          const meta = STATUS_META[phase.status];
          return (
            <div
              key={`label-${phase.fase}`}
              className={`absolute w-[130px] ${edgeTranslate(pos)} ${pos > 92 ? "text-right" : ""}`}
              style={{ left: `${pos}%` }}
            >
              <p className="truncate font-display text-xs font-semibold text-white" title={phase.fase}>
                {phase.fase}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-blue-100/45">
                {formatDayMonth(phase.start)} — {formatDayMonth(phase.end)}
              </p>
              <p className={`mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.08em] ${meta.text}`}>
                {meta.marker && <span className="mr-1">{meta.marker}</span>}
                {meta.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
