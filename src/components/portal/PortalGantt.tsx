import { motion, useReducedMotion } from "framer-motion";

import { TIMING_META, TimingPill, EmptyPanel } from "@/components/portal/ui";
import {
  DAY_MS,
  formatDate,
  formatDayMonth,
  getGanttPosition,
  getPlanCalendar,
  getTaskProgress,
  getTaskTiming,
} from "@/lib/portal-progress";
import type { PortalTask } from "@/lib/supabase";

export const PortalGantt = ({ tasks, today }: { tasks: PortalTask[]; today: number }) => {
  const reduce = useReducedMotion();
  const calendar = getPlanCalendar(tasks, today);
  const groupedTasks = tasks.reduce<Record<string, PortalTask[]>>((groups, task) => {
    const phase = task.fase || "General";
    groups[phase] = [...(groups[phase] ?? []), task];
    return groups;
  }, {});

  return (
    <section className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Carta Gantt</p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">Plan de trabajo</h3>
          <p className="mt-2 text-sm text-slate-600">Avance calculado según el calendario del plan.</p>
        </div>
        {calendar && (
          <div className="md:text-right">
            <p className="font-display text-xs text-slate-600">
              {formatDate(calendar.range.start)} — {formatDate(calendar.range.end - DAY_MS)}
            </p>
            {calendar.todayInRange && (
              <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-600">
                Día {calendar.dayIndex} de {calendar.totalDays}
              </p>
            )}
          </div>
        )}
      </div>

      {tasks.length && calendar ? (
        <div className="overflow-x-auto rounded-sm border border-slate-200 bg-white">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[340px_1fr] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-600">
              <div className="p-4">Tarea</div>
              <div className="relative px-4 pt-4 pb-9">
                <div className="flex justify-between pr-2">
                  <span>{formatDate(calendar.range.start)}</span>
                  <span>{formatDate(calendar.range.end - DAY_MS)}</span>
                </div>
                {calendar.todayPosition !== null && (
                  <span
                    className={`absolute bottom-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-sm bg-red-500 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm ${
                      calendar.todayPosition > 80 ? "-translate-x-full" : calendar.todayPosition < 8 ? "translate-x-0" : "-translate-x-1/2"
                    }`}
                    style={{ left: `${calendar.todayPosition}%` }}
                  >
                    <span className="h-1 w-1 rounded-full bg-white" />
                    Hoy · {formatDayMonth(today)}
                  </span>
                )}
              </div>
            </div>
            {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="border-b border-slate-200 border-l-2 border-l-blue-600 bg-slate-50 px-4 py-2 font-display text-[11px] font-medium uppercase tracking-[0.1em] text-slate-600">
                  {phase}
                </div>
                {phaseTasks.map((task) => {
                  const position = getGanttPosition(task, calendar.range);
                  const progress = getTaskProgress(task, today);
                  const timing = getTaskTiming(task, today);
                  const meta = TIMING_META[timing];
                  return (
                    <div key={task.id} className="grid grid-cols-[340px_1fr] border-b border-slate-100 last:border-b-0">
                      <div className="p-4">
                        <p className="font-semibold text-slate-950">{task.titulo}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(task.fecha_inicio)} - {formatDate(task.fecha_fin)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <TimingPill timing={timing} />
                          <span className="text-xs font-medium text-slate-600">
                            {timing === "completada" ? "100%" : `${progress}% según plan`}
                          </span>
                        </div>
                      </div>
                      <div className="relative p-4">
                        {calendar.todayPosition !== null && (
                          <div className="absolute inset-y-0 w-px bg-red-500" style={{ left: `${calendar.todayPosition}%` }} />
                        )}
                        {/* Mismo instrumento que la cápsula del plan: canal
                            hundido y relleno redondeado. Sin la cabeza
                            brillante de la cápsula: sobre un canal casi blanco
                            no se vería, y el corte entre relleno y canal ya
                            marca dónde va el avance. */}
                        <div className="relative h-10">
                          <div
                            className="absolute inset-y-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80"
                            style={{ left: `${position.left}%`, width: `${position.width}%` }}
                          >
                            {progress > 0 ? (
                              <motion.div
                                className={`h-full rounded-full ${meta.bar}`}
                                initial={reduce ? false : { width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            ) : (
                              <div className={`h-full w-1.5 rounded-full ${meta.dot}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyPanel title="Sin tareas" text="El plan de trabajo se publicará aquí en cuanto esté disponible." />
      )}
    </section>
  );
};
