import { CornerTicks, CountUp } from "@/components/portal/technical";
import type { ProcessStage, TaskTiming } from "@/lib/portal-progress";

// Vocabulario visual del portal. Solo tres estados de tarea de cara al cliente:
// nada se muestra como atrasado.
export const TIMING_META: Record<TaskTiming, { label: string; bar: string; pill: string; dot: string }> = {
  en_curso: { label: "En curso", bar: "bg-blue-600", pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  completada: { label: "Completada", bar: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  pendiente: { label: "Pendiente", bar: "bg-slate-300", pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

export const PROCESS_STAGE_META: Record<ProcessStage, { label: string; pill: string; dot: string }> = {
  por_levantar: { label: "Por levantar", pill: "bg-slate-50 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  construyendo_bpmn: { label: "Construyendo BPMN", pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  analisis_hammer: { label: "Análisis HAMMER", pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  informe_final: { label: "Informe final", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
};

export const TimingPill = ({ timing }: { timing: TaskTiming }) => {
  const meta = TIMING_META[timing];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export const ProcessStagePill = ({ stage }: { stage: ProcessStage }) => {
  const meta = PROCESS_STAGE_META[stage];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ring-1 ${meta.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export type Metric = { label: string; value: number; helper: string };

const METRIC_STRIP_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

// Las métricas viven en una sola banda dividida por hairlines, como el resumen
// de cifras de un informe — no como tarjetas sueltas de admin. Vive en la zona
// navy del dashboard, por eso sus superficies son oscuras.
export const MetricStrip = ({ metrics }: { metrics: Metric[] }) => (
  <div className="relative rounded-sm border border-white/10 bg-white/15">
    <CornerTicks className="text-white/25" />
    <div className={`grid grid-cols-2 gap-px overflow-hidden rounded-sm ${METRIC_STRIP_COLS[metrics.length] ?? "lg:grid-cols-6"}`}>
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-[#0A1A3D] p-5 md:p-6">
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-blue-100/70">{metric.label}</p>
          <p className="mt-3 font-display text-[2.6rem] font-semibold leading-none tabular-nums text-white">
            <CountUp value={metric.value} />
          </p>
          <p className="mt-2.5 text-xs text-blue-100/60">{metric.helper}</p>
        </div>
      ))}
    </div>
  </div>
);

export const EmptyPanel = ({ title, text, compact = false }: { title: string; text: string; compact?: boolean }) => (
  <div className={`relative rounded-sm border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? "p-5" : "p-10"}`}>
    <CornerTicks className="text-slate-300" />
    <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">— Sin datos</p>
    <p className="mt-3 font-display text-lg font-semibold tracking-tight text-slate-800">{title}</p>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
  </div>
);

// Los vacíos de cara al cliente se cuentan como lo que viene, no como lo que falta.
export const NextMilestone = ({ text }: { text: string }) => (
  <div className="rounded-sm border-l-2 border-blue-400 bg-blue-50/50 py-3 pl-4 pr-4">
    <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-blue-500">Próximo hito</p>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
  </div>
);
