import { motion } from "framer-motion";

import { CornerTicks, CountUp } from "@/components/portal/technical";
import {
  DAY_MS,
  formatDate,
  formatDayMonth,
  getPlanCalendar,
  getPlanPhases,
  type PhaseStatus,
} from "@/lib/portal-progress";
import type { PortalTask } from "@/lib/supabase";

const PHASE_STATUS_META: Record<PhaseStatus, { label: string; marker: string; chip: string }> = {
  completada: { label: "Completada", marker: "✓", chip: "text-emerald-300" },
  en_curso: { label: "En curso", marker: "▸", chip: "text-sky-300" },
  proxima: { label: "Próxima", marker: "", chip: "text-blue-100/45" },
};

// El plan del proyecto como stepper: las fases son una secuencia real, así que se
// numeran y se muestran como bloques sólidos — sin ejes ni barras flotantes.
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
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-100/70">Plan del levantamiento</p>
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

      <div className="mt-6 grid gap-x-8 gap-y-6 lg:grid-cols-[220px_1fr]">
        <div>
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-100/70">Avance según plan</p>
          <p className="mt-2 font-display text-6xl font-semibold leading-none tabular-nums">
            <CountUp value={progress} suffix="%" />
          </p>
          <div className="mt-4 h-2 rounded-sm bg-white/15">
            <motion.div
              className="h-2 rounded-sm bg-blue-400"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          {calendar && calendar.todayInRange && (
            <p className="mt-3 font-display text-[11px] font-medium uppercase tracking-[0.08em] text-blue-100/60">
              Día {calendar.dayIndex} de {calendar.totalDays}
            </p>
          )}
        </div>

        {phases.length > 0 && (
          <div className="lg:border-l lg:border-white/10 lg:pl-8">
            <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {phases.map((phase, index) => {
                const meta = PHASE_STATUS_META[phase.status];
                const isActive = phase.status === "en_curso";
                const isUpcoming = phase.status === "proxima";
                return (
                  <li
                    key={phase.fase}
                    className={`rounded-sm border p-3.5 ${
                      isActive
                        ? "border-sky-300/40 bg-white/10 ring-1 ring-sky-300/40"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <p className={`font-display text-[11px] tracking-[0.1em] ${isActive ? "text-sky-300/80" : "text-blue-100/40"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p
                      className={`mt-2 min-h-10 text-sm font-semibold leading-snug ${
                        isUpcoming ? "text-blue-100/60" : "text-white"
                      }`}
                    >
                      {phase.fase}
                    </p>
                    <p className="mt-1.5 font-display text-[11px] font-medium uppercase tracking-[0.1em] text-blue-100/50">
                      {formatDayMonth(phase.start)} — {formatDayMonth(phase.end)}
                    </p>
                    <p className={`mt-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] ${meta.chip}`}>
                      {meta.marker && <span className="mr-1">{meta.marker}</span>}
                      {meta.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
