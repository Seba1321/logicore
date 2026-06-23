import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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

const formatDate = (value: string | null) => {
  if (!value) return "Por definir";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatStatus = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const clampProgress = (value: number) => Math.max(0, Math.min(100, value));
const getTaskProgress = (task: PortalTask) => clampProgress(Number(task.progreso) || 0);

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
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const getGanttRange = (tasks: PortalTask[]) => {
  const dates = tasks
    .flatMap((task) => [toTime(task.fecha_inicio), toTime(task.fecha_fin)])
    .filter((time): time is number => time !== null);

  if (!dates.length) return null;

  const start = Math.min(...dates);
  const end = Math.max(...dates);

  return { start, end: end === start ? start + DAY_MS : end };
};

const getGanttPosition = (task: PortalTask, range: { start: number; end: number }) => {
  const taskStart = toTime(task.fecha_inicio) ?? range.start;
  const taskEnd = toTime(task.fecha_fin) ?? taskStart + DAY_MS;
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
        description: "Revisa la conexión con Supabase e intenta nuevamente.",
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
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.2),transparent_30%)]" />
        <div className="container-tight relative z-10 flex min-h-screen flex-col py-6 md:py-8">
          <PortalPublicHeader />
          <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1fr_440px] lg:py-20">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-50 backdrop-blur-sm">
                Portal privado para clientes
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Seguimiento vivo del levantamiento de procesos
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-50/75">
                Revisa avance, procesos modelados, pendientes, hallazgos y BPMN publicados por Methodical en un solo lugar.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "Carta Gantt",
                  "BPMN interactivos",
                  "Hallazgos y pendientes",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-medium text-white/85 backdrop-blur-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white p-6 text-foreground shadow-2xl md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Acceso clientes</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">Ingresar al portal</h2>
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

                <Button type="submit" className="mt-7 w-full" disabled={isSubmitting}>
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
      className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur">
        <div className="container-tight flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="Volver al inicio de Methodical">
            <img src="/logo-transparente.png" alt="Methodical" className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75 md:flex">
            {session.empresa} · {session.usuario}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <section className="bg-slate-950 text-white">
        <div className="container-tight py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200/70">Portal de cliente</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{session.empresa}</h1>
              <p className="mt-4 max-w-2xl text-blue-50/70">
                Estado del levantamiento, BPMN publicados, hallazgos y pendientes para seguimiento ejecutivo.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm text-blue-50/70">Avance general</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-bold">{overallProgress}%</span>
                <span className="pb-2 text-sm text-blue-50/60">promedio ponderado</span>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/15">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-tight -mt-6 space-y-6 pb-16">
        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">Cargando información del portal...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <MetricCard label="Proyectos" value={projects.length} helper="activos" />
              <MetricCard label="Procesos" value={processes.length} helper={`${validatedProcesses} validados`} />
              <MetricCard label="BPMN" value={diagrams.length} helper="disponibles" />
              <MetricCard label="Pendientes" value={openPendings.length} helper="cliente" emphasis={openPendings.length > 0} />
              <MetricCard label="Hallazgos" value={findings.length} helper="detectados" />
              <MetricCard label="Tareas" value={tasks.length} helper="Gantt" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <ChartsPanel processes={processes} tasks={tasks} findings={findings} progress={overallProgress} />
              <BpmnLibrary projects={projects} diagrams={diagrams} />
            </div>

            {projects.length ? (
              projects.map((project) => <ProjectSection key={project.id} project={project} />)
            ) : (
              <EmptyPanel title="Sin proyectos publicados" text="Cuando el sync de Git suba datos del cliente, aparecerán aquí." />
            )}
          </>
        )}
      </div>
    </main>
  );
};

const MetricCard = ({ label, value, helper, emphasis = false }: { label: string; value: number | string; helper: string; emphasis?: boolean }) => (
  <div className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ${emphasis ? "ring-amber-200" : "ring-slate-200"}`}>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);

const ChartsPanel = ({
  processes,
  tasks,
  findings,
  progress,
}: {
  processes: PortalProcess[];
  tasks: PortalTask[];
  findings: PortalFinding[];
  progress: number;
}) => {
  const processStatusData = countBy(processes, (process) => process.estado);
  const taskPhaseData = countBy(tasks, (task) => task.fase);
  const findingPriorityData = countBy(findings, (finding) => finding.prioridad);
  const donutData = [
    { name: "Completado", value: progress },
    { name: "Pendiente", value: Math.max(0, 100 - progress) },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Analítica</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pulso del levantamiento</h2>
        </div>
        <p className="text-sm text-slate-500">Datos sincronizados desde Git y Supabase</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={64} outerRadius={88} strokeWidth={0}>
                  <Cell fill="#2563eb" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="-mt-32 text-center text-4xl font-bold">{progress}%</p>
          <p className="mt-24 text-center text-sm text-slate-500">avance ponderado</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MiniBarChart title="Procesos por estado" data={processStatusData} />
          <MiniBarChart title="Tareas por fase" data={taskPhaseData} />
          <MiniBarChart title="Hallazgos por prioridad" data={findingPriorityData} />
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-blue-100/70">Siguiente foco</p>
            <p className="mt-3 text-xl font-semibold">Validar BPMN y cerrar pendientes críticos</p>
            <p className="mt-2 text-sm leading-relaxed text-blue-50/65">
              El avance sube actualizando `progreso` en `gantt.json` y haciendo push al repo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const MiniBarChart = ({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
    {data.length ? (
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="flex h-44 items-center justify-center text-center text-sm text-slate-400">Sin datos publicados</div>
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
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">BPMN</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Biblioteca de procesos</h2>
        <p className="mt-2 text-sm text-slate-500">Abre cada diagrama en una pantalla amplia para revisarlo con comodidad.</p>
      </div>
      {diagrams.length ? (
        <div className="space-y-3">
          {diagrams.map((diagram) => {
            const process = processByDiagram.get(diagram.id);
            return (
              <div key={diagram.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{diagram.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500">{process?.area ?? "Proceso"} · {process ? formatStatus(process.estado) : "Publicado"}</p>
                  </div>
                  <Button asChild size="sm">
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
        <EmptyPanel title="Sin BPMN publicados" text="Cuando subas BPMN por Git, aparecerán en esta biblioteca." compact />
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
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Proyecto</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{project.nombre}</h2>
            {project.descripcion && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{project.descripcion}</p>}
          </div>
          <div className="rounded-2xl bg-slate-950 p-5 text-white lg:min-w-56">
            <p className="text-sm text-blue-100/70">Avance proyecto</p>
            <p className="mt-2 text-4xl font-bold">{progress}%</p>
            <div className="mt-4 h-2 rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-blue-400" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[360px_1fr]">
        <aside className="border-b border-slate-200 p-6 md:p-8 xl:border-b-0 xl:border-r">
          <ProcessList processes={project.procesos ?? []} />
          <PendingList pendings={openPendings} />
          <FindingList findings={findings} />
        </aside>
        <div>
          <PortalGantt tasks={project.tareas ?? []} />
        </div>
      </div>
    </section>
  );
};

const ProcessList = ({ processes }: { processes: PortalProcess[] }) => (
  <section>
    <h3 className="text-lg font-semibold tracking-tight">Procesos levantados</h3>
    <div className="mt-4 space-y-3">
      {processes.length ? (
        processes.map((process) => (
          <div key={process.id} className="rounded-2xl border border-slate-200 p-4">
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
  <section className="mt-8">
    <h3 className="text-lg font-semibold tracking-tight">Pendientes cliente</h3>
    <div className="mt-4 space-y-3">
      {pendings.length ? (
        pendings.slice(0, 5).map((pending) => (
          <div key={pending.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
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
  <section className="mt-8">
    <h3 className="text-lg font-semibold tracking-tight">Hallazgos</h3>
    <div className="mt-4 space-y-3">
      {findings.length ? (
        findings.slice(0, 5).map((finding) => (
          <div key={finding.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{finding.titulo}</p>
              <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClassName(finding.prioridad)}`}>
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
  const today = Date.now();
  const todayPosition = range && today >= range.start && today <= range.end ? ((today - range.start) / (range.end - range.start)) * 100 : null;
  const groupedTasks = tasks.reduce<Record<string, PortalTask[]>>((groups, task) => {
    const phase = task.fase || "General";
    groups[phase] = [...(groups[phase] ?? []), task];
    return groups;
  }, {});

  return (
    <section className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Carta Gantt</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Plan de trabajo</h3>
        </div>
        {range && (
          <p className="text-sm text-slate-500">
            {formatDate(new Date(range.start).toISOString())} - {formatDate(new Date(range.end).toISOString())}
          </p>
        )}
      </div>

      {tasks.length && range ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <div className="min-w-[920px] bg-white">
            <div className="grid grid-cols-[260px_1fr] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <div className="p-4">Tarea</div>
              <div className="relative p-4">
                <div className="flex justify-between">
                  <span>{formatDate(new Date(range.start).toISOString())}</span>
                  <span>{formatDate(new Date(range.end).toISOString())}</span>
                </div>
              </div>
            </div>
            {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="border-b border-slate-200 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
                  {phase}
                </div>
                {phaseTasks.map((task) => {
                  const position = getGanttPosition(task, range);
                  return (
                    <div key={task.id} className="grid grid-cols-[260px_1fr] border-b border-slate-100 last:border-b-0">
                      <div className="p-4">
                        <p className="font-semibold text-slate-950">{task.titulo}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(task.fecha_inicio)} - {formatDate(task.fecha_fin)}
                        </p>
                      </div>
                      <div className="relative p-4">
                        {todayPosition !== null && (
                          <div className="absolute inset-y-0 w-px bg-red-400" style={{ left: `${todayPosition}%` }} />
                        )}
                        <div className="relative h-9 rounded-full bg-slate-100">
                          <div
                            className="absolute inset-y-1 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-sm"
                            style={{ left: `${position.left}%`, width: `${position.width}%` }}
                          >
                            <div className="h-full bg-white/20" style={{ width: `${getTaskProgress(task)}%` }} />
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
  <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(status)}`}>
    {formatStatus(status)}
  </span>
);

const EmptyPanel = ({ title, text, compact = false }: { title: string; text: string; compact?: boolean }) => (
  <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? "p-4" : "p-8"}`}>
    <p className="font-semibold text-slate-700">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{text}</p>
  </div>
);

export default Portal;
