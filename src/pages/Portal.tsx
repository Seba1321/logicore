import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleNetwork } from "@/components/ui/ParticleNetwork";
import { CornerTicks, CountUp, Reveal } from "@/components/portal/technical";
import { toast } from "@/hooks/use-toast";
import { clearPortalSession, getPortalSession, savePortalSession } from "@/lib/portal-session";
import {
  isSupabaseConfigured,
  supabase,
  type EmpresaLogin,
  type PortalBpmn,
  type PortalData,
  type PortalFinding,
  type PortalPending,
  type PortalProcess,
  type PortalProject,
  type PortalTask,
} from "@/lib/supabase";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_COLORS = ["#0f172a", "#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#7c3aed"];

const parsePortalDate = (value: string | number | null) => {
  if (!value) return "Por definir";

  if (typeof value === "number") return new Date(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
};

const formatDate = (value: string | number | null) => {
  const date = parsePortalDate(value);
  if (date === "Por definir") return date;

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDayMonth = (value: number) =>
  new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" }).format(new Date(value));

const formatStatus = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const clampProgress = (value: number) => Math.max(0, Math.min(100, value));
// El avance crece solo con el tiempo: una tarea terminada cuenta 100, una futura 0,
// y una en curso avanza según los días transcurridos de su ventana.
const getTaskProgress = (task: PortalTask) => {
  if (isClosedStatus(task.estado)) return 100;
  return Math.round(getExpectedTaskProgress(task, getTodayTime()));
};

const isClosedStatus = (status: string) =>
  ["aprobado", "aprobada", "cerrado", "cerrada", "completada", "finalizada", "validado", "validada", "done"].includes(
    status.toLowerCase()
  );

const getProjectProgress = (project: PortalProject) => {
  const tasks = project.tareas ?? [];
  const totalWeight = tasks.reduce((total, task) => total + (Number(task.peso) || 1), 0);

  if (!tasks.length || !totalWeight) return 0;

  const weightedProgress = tasks.reduce(
    (total, task) => total + getTaskProgress(task) * (Number(task.peso) || 1),
    0
  );

  return Math.round(weightedProgress / totalWeight);
};

const getOverallProgress = (projects: PortalProject[]) => {
  if (!projects.length) return 0;
  const total = projects.reduce((sum, project) => sum + getProjectProgress(project), 0);
  return Math.round(total / projects.length);
};

const toTime = (value: string | null) => {
  if (!value) return null;
  const parsedDate = parsePortalDate(value);
  if (parsedDate === "Por definir") return null;
  const time = parsedDate.getTime();
  return Number.isNaN(time) ? null : time;
};

const getGanttRange = (tasks: PortalTask[]) => {
  const dates = tasks
    .flatMap((task) => [toTime(task.fecha_inicio), toTime(task.fecha_fin)])
    .filter((time): time is number => time !== null);

  if (!dates.length) return null;

  const start = Math.min(...dates);
  const end = Math.max(...dates) + DAY_MS;

  return { start, end: end === start ? start + DAY_MS : end };
};

const getGanttPosition = (task: PortalTask, range: { start: number; end: number }) => {
  const taskStart = toTime(task.fecha_inicio) ?? range.start;
  const taskEnd = (toTime(task.fecha_fin) ?? taskStart) + DAY_MS;
  const total = Math.max(range.end - range.start, DAY_MS);
  const left = clampProgress(((taskStart - range.start) / total) * 100);
  const width = Math.max(4, clampProgress(((taskEnd - taskStart) / total) * 100));

  return { left, width: Math.min(width, 100 - left) };
};

const getStatusClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (["aprobado", "aprobada", "completada", "finalizada", "validado", "validada", "done"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["en_desarrollo", "en progreso", "en_progreso", "desarrollo", "modelado"].includes(normalized)) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (["bloqueada", "bloqueado"].includes(normalized)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const getPriorityClassName = (priority: string) => {
  const normalized = priority.toLowerCase();
  if (normalized === "alta") return "bg-red-50 text-red-700 ring-red-200";
  if (normalized === "media") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const countBy = <T,>(items: T[], getKey: (item: T) => string | null | undefined) => {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item) || "Sin definir";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name: formatStatus(name), value }));
};

// Midnight of the real current day — drives all the date-aware visuals.
const getTodayTime = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

type TaskTiming = "completada" | "en_curso" | "proxima" | "atrasada";

const getTaskTiming = (task: PortalTask, today: number): TaskTiming => {
  if (isClosedStatus(task.estado) || getTaskProgress(task) >= 100) return "completada";
  const start = toTime(task.fecha_inicio);
  const end = toTime(task.fecha_fin);
  const endExclusive = end !== null ? end + DAY_MS : null;
  if (endExclusive !== null && today >= endExclusive) return "atrasada";
  if (start !== null && today < start) return "proxima";
  return "en_curso";
};

// How far a task "should" be today, based purely on its calendar window.
const getExpectedTaskProgress = (task: PortalTask, today: number) => {
  const start = toTime(task.fecha_inicio);
  const end = toTime(task.fecha_fin);
  if (start === null || end === null) return 0;
  const endExclusive = end + DAY_MS;
  if (today <= start) return 0;
  if (today >= endExclusive) return 100;
  return clampProgress(((today - start) / (endExclusive - start)) * 100);
};

const TIMING_META: Record<TaskTiming, { label: string; bar: string; pill: string; dot: string }> = {
  en_curso: { label: "En curso", bar: "bg-blue-600", pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  completada: { label: "Completada", bar: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  proxima: { label: "Próxima", bar: "bg-slate-300", pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  atrasada: { label: "Atrasada", bar: "bg-red-500", pill: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
};

const Portal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [empresaSession, setEmpresaSession] = useState<EmpresaLogin | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);

  const loadPortalData = async (sessionToken: string) => {
    if (!supabase) return null;

    setIsLoadingPortal(true);

    const { data, error } = await supabase.rpc("get_portal_empresa", {
      p_session_token: sessionToken,
    });

    setIsLoadingPortal(false);

    if (error || !data) {
      clearPortalSession();
      toast({
        title: "No se pudo cargar el portal",
        description: "La sesión expiró o falta ejecutar el SQL actualizado del portal.",
        variant: "destructive",
      });
      return null;
    }

    const nextPortalData = data as PortalData;
    setPortalData(nextPortalData);
    return nextPortalData;
  };

  useEffect(() => {
    const savedSession = getPortalSession();
    if (!savedSession) return;
    setEmpresaSession(savedSession);
    loadPortalData(savedSession.session_token);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Supabase no configurado",
        description: "Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu archivo .env.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.rpc("login_empresa", {
      p_usuario: username.trim(),
      p_password: password,
    });

    setPassword("");

    if (error) {
      setIsSubmitting(false);
      toast({
        title: "No se pudo ingresar",
        description: "Revisa tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    const empresa = Array.isArray(data) ? data[0] : null;

    if (!empresa?.session_token) {
      setIsSubmitting(false);
      toast({
        title: "Credenciales inválidas",
        description: "La empresa, el usuario o la contraseña no coinciden.",
        variant: "destructive",
      });
      return;
    }

    const nextSession = empresa as EmpresaLogin;
    savePortalSession(nextSession);
    setEmpresaSession(nextSession);
    await loadPortalData(nextSession.session_token);
    setIsSubmitting(false);

    toast({
      title: `Bienvenido, ${nextSession.empresa}`,
      description: "Acceso validado correctamente.",
    });
  };

  const handleLogout = async () => {
    if (supabase && empresaSession?.session_token) {
      await supabase.rpc("logout_empresa", { p_session_token: empresaSession.session_token });
    }

    clearPortalSession();
    setEmpresaSession(null);
    setPortalData(null);
  };

  if (!empresaSession) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#06112e_32%,#103183_70%,#1e50d6_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_40%,rgba(96,150,255,0.32),transparent_62%)]" />
        </div>
        <ParticleNetwork className="opacity-90" particleCount={110} speed={0.3} />
        <div className="container-tight relative z-10 flex min-h-screen flex-col py-6 md:py-8">
          <PortalPublicHeader />
          <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_430px] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-200/70">
                <span className="h-1 w-1 rounded-full bg-sky-300" />
                Portal privado para clientes
              </p>
              <h1 className="font-display text-[clamp(2.2rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
                Acceso para empresas que trabajan con Methodical
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100/65">
                Ingresa con las credenciales entregadas por nuestro equipo para revisar avance, BPMN, pendientes y hallazgos del levantamiento.
              </p>
            </div>

            <div className="rounded-sm border border-white/10 bg-white p-6 text-foreground md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Acceso clientes</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">Ingresar al portal</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Usa el nombre de tu empresa o tu usuario asignado.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="portal-usuario">Empresa o usuario</Label>
                    <Input
                      id="portal-usuario"
                      type="text"
                      autoComplete="username"
                      placeholder="Nombre de empresa o usuario"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portal-contrasena">Contraseña</Label>
                    <Input
                      id="portal-contrasena"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-7 w-full bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>
                  {isSubmitting ? "Validando..." : "Ingresar"}
                </Button>
                <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
                  Si todavía no tienes credenciales, solicítalas a tu contacto Methodical.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <PortalDashboard
      session={empresaSession}
      data={portalData}
      isLoading={isLoadingPortal}
      onLogout={handleLogout}
    />
  );
};

const PortalPublicHeader = () => (
  <nav className="flex items-center justify-between gap-4">
    <Link to="/" aria-label="Volver al inicio de Methodical">
      <img src="/logo-transparente.png" alt="Methodical" className="h-9 w-auto object-contain brightness-0 invert" />
    </Link>
    <Link
      to="/"
      className="rounded-sm border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      Volver al sitio
    </Link>
  </nav>
);

const PortalDashboard = ({
  session,
  data,
  isLoading,
  onLogout,
}: {
  session: EmpresaLogin;
  data: PortalData | null;
  isLoading: boolean;
  onLogout: () => void;
}) => {
  const projects = data?.proyectos ?? [];
  const processes = projects.flatMap((project) => project.procesos ?? []);
  const diagrams = projects.flatMap((project) => project.bpmn ?? []);
  const tasks = projects.flatMap((project) => project.tareas ?? []);
  const findings = processes.flatMap((process) => process.hallazgos ?? []);
  const pendings = processes.flatMap((process) => process.pendientes ?? []);
  const openPendings = pendings.filter((pending) => !isClosedStatus(pending.estado));
  const overallProgress = getOverallProgress(projects);
  const validatedProcesses = processes.filter((process) => isClosedStatus(process.estado)).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071330]/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Volver al inicio de Methodical">
            <img src="/logo-transparente.png" alt="Methodical" className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
          <div className="hidden items-center gap-2 rounded-sm border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75 md:flex">
            {session.empresa} · {session.usuario}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#071330_0%,#123a8a_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-[1500px] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue-200/70">Portal de cliente</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">{session.empresa}</h1>
              <p className="mt-4 max-w-2xl text-blue-50/70">
                Estado del levantamiento, BPMN publicados, hallazgos y pendientes para seguimiento ejecutivo.
              </p>
            </div>
            <div className="relative rounded-sm border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <CornerTicks className="text-white/20" />
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-50/70">Avance general</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="font-display text-5xl font-bold tabular-nums">
                  <CountUp value={overallProgress} suffix="%" />
                </span>
                <span className="pb-2 text-sm text-blue-50/60">promedio ponderado</span>
              </div>
              <div className="mt-5 h-2 rounded-sm bg-white/15">
                <motion.div
                  className="h-2 rounded-sm bg-blue-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${overallProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-[1500px] space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-sm border border-slate-200 bg-white p-8 text-center">Cargando información del portal...</div>
        ) : (
          <>
            <Reveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <MetricCard label="Proyectos" value={projects.length} helper="activos" />
              <MetricCard label="Procesos" value={processes.length} helper={`${validatedProcesses} validados`} />
              <MetricCard label="BPMN" value={diagrams.length} helper="disponibles" />
              <MetricCard label="Pendientes" value={openPendings.length} helper="cliente" emphasis={openPendings.length > 0} />
              <MetricCard label="Hallazgos" value={findings.length} helper="detectados" />
              <MetricCard label="Tareas" value={tasks.length} helper="Gantt" />
            </Reveal>

            <Reveal>
              <ChartsPanel processes={processes} tasks={tasks} progress={overallProgress} />
            </Reveal>
            <Reveal>
              <BpmnLibrary projects={projects} diagrams={diagrams} />
            </Reveal>

            {projects.length ? (
              projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 0.05}>
                  <ProjectSection project={project} />
                </Reveal>
              ))
            ) : (
              <EmptyPanel title="Sin proyectos publicados" text="Aquí verás tus proyectos en cuanto estén disponibles." />
            )}
          </>
        )}
      </div>
    </main>
  );
};

const MetricCard = ({ label, value, helper, emphasis = false }: { label: string; value: number | string; helper: string; emphasis?: boolean }) => (
  <div className={`relative rounded-sm border bg-white p-5 transition-colors hover:border-blue-300 ${emphasis ? "border-amber-300" : "border-slate-200"}`}>
    <CornerTicks className={emphasis ? "text-amber-300" : "text-slate-200"} />
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 font-display text-4xl font-semibold tracking-tight tabular-nums text-slate-950">
      {typeof value === "number" ? <CountUp value={value} /> : value}
    </p>
    <p className="mt-2 text-xs text-slate-500">{helper}</p>
  </div>
);

const ChartsPanel = ({
  processes,
  tasks,
  progress,
}: {
  processes: PortalProcess[];
  tasks: PortalTask[];
  progress: number;
}) => {
  const today = getTodayTime();
  const counts: Record<TaskTiming, number> = { en_curso: 0, proxima: 0, atrasada: 0, completada: 0 };
  tasks.forEach((task) => {
    counts[getTaskTiming(task, today)]++;
  });
  const activeTasks = tasks.filter((task) => getTaskTiming(task, today) === "en_curso");
  const processStatusData = countBy(processes, (process) => process.estado);
  const donutData = [
    { name: "Completado", value: progress },
    { name: "Pendiente", value: Math.max(0, 100 - progress) },
  ];

  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Analítica</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Pulso del levantamiento</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-6">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius="68%" outerRadius="88%" strokeWidth={0}>
                  <Cell fill="#2563eb" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-5xl font-bold tracking-tight tabular-nums">
                <CountUp value={progress} suffix="%" />
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">avance</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <PlanTile timing="en_curso" value={counts.en_curso} />
            <PlanTile timing="proxima" value={counts.proxima} />
            <PlanTile timing="completada" value={counts.completada} />
          </div>

          <MiniBarChart title="Procesos por estado" data={processStatusData} />

          <div className="rounded-sm border border-white/10 bg-[#071330] p-5 text-white">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-100/70">Foco actual</p>
            {activeTasks.length ? (
              <ul className="mt-3 space-y-2">
                {activeTasks.map((task) => (
                  <li key={task.id} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span className="font-medium">{task.titulo}</span>
                    {task.fase && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-200/60">{task.fase}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-blue-50/70">No hay tareas activas para hoy.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const PlanTile = ({ timing, value }: { timing: TaskTiming; value: number }) => {
  const meta = TIMING_META[timing];
  return (
    <div className="rounded-sm border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">{meta.label}</p>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-slate-900">
        <CountUp value={value} />
      </p>
    </div>
  );
};

const MiniBarChart = ({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) => (
  <div className="rounded-sm bg-slate-50 p-5">
    <p className="mb-4 text-sm font-semibold text-slate-700">{title}</p>
    {data.length ? (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#94a3b8" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#64748b" }} width={92} />
            <Tooltip cursor={{ fill: "rgba(37,99,235,0.06)" }} />
            <Bar dataKey="value" radius={[0, 2, 2, 0]} fill="#2563eb" barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="flex h-56 items-center justify-center text-center text-sm text-slate-400">Sin datos publicados</div>
    )}
  </div>
);

const BpmnLibrary = ({ projects, diagrams }: { projects: PortalProject[]; diagrams: PortalBpmn[] }) => {
  const processByDiagram = new Map<number, PortalProcess>();
  projects.forEach((project) => {
    project.procesos?.forEach((process) => {
      process.bpmn?.forEach((diagram) => processByDiagram.set(diagram.id, process));
    });
  });

  return (
    <section className="rounded-sm bg-white p-6 border border-slate-200">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">BPMN</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Biblioteca de procesos</h2>
        <p className="mt-2 text-sm text-slate-500">Abre cada diagrama en una pantalla amplia para revisarlo con comodidad.</p>
      </div>
      {diagrams.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {diagrams.map((diagram) => {
            const process = processByDiagram.get(diagram.id);
            return (
              <div key={diagram.id} className="rounded-sm border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/40">
                <div className="flex h-full flex-col justify-between gap-5">
                  <div>
                    <p className="text-lg font-semibold leading-tight text-slate-950">{diagram.nombre}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {process?.area ?? "Proceso"} · {process ? formatStatus(process.estado) : "Publicado"}
                    </p>
                    {diagram.descripcion && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-500">{diagram.descripcion}</p>
                    )}
                  </div>
                  <Button asChild className="w-full sm:w-fit">
                    <Link to={`/portal/bpmn/${diagram.id}`} target="_blank" rel="noreferrer">
                      Ver pantalla completa
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyPanel title="Sin BPMN publicados" text="Aquí verás los diagramas BPMN de tus procesos en cuanto estén disponibles." compact />
      )}
    </section>
  );
};

const ProjectSection = ({ project }: { project: PortalProject }) => {
  const progress = getProjectProgress(project);
  const openPendings = (project.procesos ?? [])
    .flatMap((process) => process.pendientes ?? [])
    .filter((pending) => !isClosedStatus(pending.estado));
  const findings = (project.procesos ?? []).flatMap((process) => process.hallazgos ?? []);

  return (
    <section className="overflow-hidden rounded-sm bg-white border border-slate-200">
      <div className="border-b border-slate-200 p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Proyecto</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{project.nombre}</h2>
            {project.descripcion && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{project.descripcion}</p>}
          </div>
          <div className="relative rounded-sm border border-white/10 bg-[#071330] p-5 text-white lg:min-w-56">
            <CornerTicks className="text-white/15" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-100/70">Avance proyecto</p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums">
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
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-3">
          <ProcessList processes={project.procesos ?? []} />
          <PendingList pendings={openPendings} />
          <FindingList findings={findings} />
        </div>
      </div>

      <PortalGantt tasks={project.tareas ?? []} />
    </section>
  );
};

const ProcessList = ({ processes }: { processes: PortalProcess[] }) => (
  <section>
    <h3 className="text-lg font-semibold tracking-tight">Procesos levantados</h3>
    <div className="mt-4 space-y-3">
      {processes.length ? (
        processes.map((process) => (
          <div key={process.id} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{process.nombre}</p>
                <p className="mt-1 text-xs text-slate-500">{process.area ?? "Sin área"}</p>
              </div>
              <StatusPill status={process.estado} />
            </div>
          </div>
        ))
      ) : (
        <EmptyPanel title="Sin procesos" text="No hay procesos publicados." compact />
      )}
    </div>
  </section>
);

const PendingList = ({ pendings }: { pendings: PortalPending[] }) => (
  <section>
    <h3 className="text-lg font-semibold tracking-tight">Pendientes cliente</h3>
    <div className="mt-4 space-y-3">
      {pendings.length ? (
        pendings.slice(0, 5).map((pending) => (
          <div key={pending.id} className="rounded-sm border border-amber-200 bg-amber-50/60 p-4">
            <p className="font-semibold text-amber-950">{pending.titulo}</p>
            <p className="mt-1 text-xs text-amber-700">Vence: {formatDate(pending.fecha_limite)}</p>
          </div>
        ))
      ) : (
        <EmptyPanel title="Sin pendientes" text="No hay acciones abiertas para el cliente." compact />
      )}
    </div>
  </section>
);

const FindingList = ({ findings }: { findings: PortalFinding[] }) => (
  <section>
    <h3 className="text-lg font-semibold tracking-tight">Hallazgos</h3>
    <div className="mt-4 space-y-3">
      {findings.length ? (
        findings.slice(0, 5).map((finding) => (
          <div key={finding.id} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{finding.titulo}</p>
              <span className={`inline-flex shrink-0 rounded-sm px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClassName(finding.prioridad)}`}>
                {formatStatus(finding.prioridad)}
              </span>
            </div>
            {finding.impacto && <p className="mt-2 text-sm text-slate-500">{finding.impacto}</p>}
          </div>
        ))
      ) : (
        <EmptyPanel title="Sin hallazgos" text="Todavía no hay hallazgos publicados." compact />
      )}
    </div>
  </section>
);

const PortalGantt = ({ tasks }: { tasks: PortalTask[] }) => {
  const range = getGanttRange(tasks);
  const today = getTodayTime();
  const todayPosition = range && today >= range.start && today <= range.end ? ((today - range.start) / (range.end - range.start)) * 100 : null;
  const totalDays = range ? Math.max(1, Math.round((range.end - range.start) / DAY_MS)) : 0;
  const dayIndex = range ? Math.min(totalDays, Math.max(1, Math.floor((today - range.start) / DAY_MS) + 1)) : 0;
  const dayLabel = range && today >= range.start && today < range.end ? `Día ${dayIndex} de ${totalDays}` : null;
  const groupedTasks = tasks.reduce<Record<string, PortalTask[]>>((groups, task) => {
    const phase = task.fase || "General";
    groups[phase] = [...(groups[phase] ?? []), task];
    return groups;
  }, {});

  return (
    <section className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Carta Gantt</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">Plan de trabajo</h3>
        </div>
        {range && (
          <div className="md:text-right">
            <p className="font-mono text-xs text-slate-500">
              {formatDate(range.start)} — {formatDate(range.end - DAY_MS)}
            </p>
            {dayLabel && (
              <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600">{dayLabel}</p>
            )}
          </div>
        )}
      </div>

      {tasks.length && range ? (
        <div className="overflow-x-auto rounded-sm border border-slate-200 bg-white">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[340px_1fr] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <div className="p-4">Tarea</div>
              <div className="relative px-4 pt-4 pb-9">
                <div className="flex justify-between pr-2">
                  <span>{formatDate(range.start)}</span>
                  <span>{formatDate(range.end - DAY_MS)}</span>
                </div>
                {todayPosition !== null && (
                  <span
                    className={`absolute bottom-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-sm bg-red-500 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm ${
                      todayPosition > 80 ? "-translate-x-full" : todayPosition < 8 ? "translate-x-0" : "-translate-x-1/2"
                    }`}
                    style={{ left: `${todayPosition}%` }}
                  >
                    <span className="h-1 w-1 rounded-full bg-white" />
                    Hoy · {formatDayMonth(today)}
                  </span>
                )}
              </div>
            </div>
            {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="border-b border-slate-200 bg-[#071330] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                  {phase}
                </div>
                {phaseTasks.map((task) => {
                  const position = getGanttPosition(task, range);
                  const progress = getTaskProgress(task);
                  const timing = getTaskTiming(task, today);
                  const meta = TIMING_META[timing];
                  return (
                    <div key={task.id} className="grid grid-cols-[340px_1fr] border-b border-slate-100 last:border-b-0">
                      <div className="p-4">
                        <p className="font-semibold text-slate-950">{task.titulo}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(task.fecha_inicio)} - {formatDate(task.fecha_fin)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <TimingPill timing={timing} />
                          <span className="text-xs font-medium text-slate-500">{progress}%</span>
                        </div>
                      </div>
                      <div className="relative p-4">
                        {todayPosition !== null && (
                          <div className="absolute inset-y-0 w-px bg-red-500" style={{ left: `${todayPosition}%` }} />
                        )}
                        <div className="relative h-10 rounded-sm bg-slate-50">
                          <div
                            className="absolute inset-y-1 overflow-hidden rounded-sm border border-slate-200 bg-slate-100"
                            style={{ left: `${position.left}%`, width: `${position.width}%` }}
                          >
                            {progress > 0 ? (
                              <motion.div
                                className={`h-full rounded-sm ${meta.bar}`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            ) : (
                              <div className={`h-full w-2 rounded-sm ${meta.dot}`} />
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
        <EmptyPanel title="Sin tareas" text="No hay tareas publicadas para esta Gantt." />
      )}
    </section>
  );
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={`inline-flex shrink-0 rounded-sm px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(status)}`}>
    {formatStatus(status)}
  </span>
);

const TimingPill = ({ timing }: { timing: TaskTiming }) => {
  const meta = TIMING_META[timing];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const EmptyPanel = ({ title, text, compact = false }: { title: string; text: string; compact?: boolean }) => (
  <div className={`relative rounded-sm border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? "p-5" : "p-10"}`}>
    <CornerTicks className="text-slate-300" />
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">— Sin datos</p>
    <p className="mt-3 font-display text-base font-semibold tracking-tight text-slate-800">{title}</p>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
  </div>
);

export default Portal;
