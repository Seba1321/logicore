import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { BpmnViewer } from "@/components/portal/BpmnViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
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

  return {
    start,
    end: end === start ? start + DAY_MS : end,
  };
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

  if (["en_desarrollo", "en progreso", "en_progreso", "desarrollo"].includes(normalized)) {
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

const isClosedStatus = (status: string) =>
  ["aprobado", "aprobada", "cerrado", "cerrada", "completada", "finalizada", "validado", "validada", "done"].includes(
    status.toLowerCase()
  );

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
      toast({
        title: "No se pudo cargar el portal",
        description: "Ejecuta el SQL actualizado del portal en Supabase e intenta nuevamente.",
        variant: "destructive",
      });
      return null;
    }

    const nextPortalData = data as PortalData;
    setPortalData(nextPortalData);
    return nextPortalData;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Supabase no configurado",
        description:
          "Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu archivo .env.",
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

    if (!empresa) {
      setIsSubmitting(false);
      toast({
        title: "Credenciales inválidas",
        description: "La empresa, el usuario o la contraseña no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (!empresa.session_token) {
      setIsSubmitting(false);
      toast({
        title: "Portal pendiente de actualizar",
        description: "Ejecuta el SQL actualizado para habilitar sesiones y dashboard.",
        variant: "destructive",
      });
      return;
    }

    const nextSession = empresa as EmpresaLogin;
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
      await supabase.rpc("logout_empresa", {
        p_session_token: empresaSession.session_token,
      });
    }

    setEmpresaSession(null);
    setPortalData(null);
  };

  const projects = portalData?.proyectos ?? [];
  const processes = projects.flatMap((project) => project.procesos ?? []);
  const bpmnCount = projects.reduce((total, project) => total + (project.bpmn?.length ?? 0), 0);
  const pendingCount = processes.reduce(
    (total, process) => total + (process.pendientes ?? []).filter((pending) => !isClosedStatus(pending.estado)).length,
    0
  );
  const findingsCount = processes.reduce((total, process) => total + (process.hallazgos?.length ?? 0), 0);
  const validatedProcesses = processes.filter((process) => isClosedStatus(process.estado)).length;
  const overallProgress = getOverallProgress(projects);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white">
      <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container-tight relative z-10 flex min-h-screen flex-col py-6 md:py-8">
        <nav className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Volver al inicio de Methodical">
            <img
              src="/logo-transparente.png"
              alt="Methodical"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            Volver al sitio
          </Link>
        </nav>

        {empresaSession ? (
          <section className="flex-1 py-10 md:py-14">
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100/70">Portal de cliente</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {empresaSession.empresa}
                </h1>
                <p className="mt-2 text-sm text-blue-50/70">
                  Sesión iniciada como {empresaSession.usuario}
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>

            {isLoadingPortal ? (
              <div className="rounded-2xl bg-white p-8 text-center text-foreground shadow-2xl">
                Cargando información del portal...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl bg-white p-5 text-foreground shadow-xl">
                    <p className="text-sm font-medium text-muted-foreground">Avance total</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">{overallProgress}%</p>
                    <div className="mt-4 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5 text-foreground shadow-xl">
                    <p className="text-sm font-medium text-muted-foreground">Procesos identificados</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">{processes.length}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{validatedProcesses} validados</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 text-foreground shadow-xl">
                    <p className="text-sm font-medium text-muted-foreground">BPMN disponibles</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">{bpmnCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 text-foreground shadow-xl">
                    <p className="text-sm font-medium text-muted-foreground">Pendientes cliente</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">{pendingCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 text-foreground shadow-xl">
                    <p className="text-sm font-medium text-muted-foreground">Hallazgos</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">{findingsCount}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Versionados en Git y publicados al portal.
                    </p>
                  </div>
                </div>

                {projects.length ? (
                  projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="rounded-2xl bg-white p-8 text-center text-foreground shadow-2xl">
                    <h2 className="text-2xl font-semibold tracking-tight">Sin proyectos publicados</h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Cuando publiques datos desde la organización Git del cliente, aparecerán aquí.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_430px] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-50 backdrop-blur-sm">
                Portal privado para clientes
              </p>
              <h1 className="heading-display mb-6">
                Acceso para empresas que trabajan con Methodical
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-blue-50/75">
                Ingresa con las credenciales entregadas por nuestro equipo para acceder a tu espacio de trabajo y seguimiento.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white p-6 text-foreground shadow-2xl md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight">Ingresar al portal</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Usa el nombre de tu empresa o tu usuario asignado.
                  </p>
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
                  Si todavía no tienes credenciales, solicítalas a tu contacto Methodical o escribe a contacto@methodical.cl.
                </p>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

const ProjectCard = ({ project }: { project: PortalProject }) => {
  const progress = getProjectProgress(project);
  const processes = project.procesos ?? [];
  const diagrams = project.bpmn ?? [];
  const openPendings = processes.flatMap((process) => process.pendientes ?? []).filter((pending) => !isClosedStatus(pending.estado));
  const findings = processes.flatMap((process) => process.hallazgos ?? []);
  const [selectedDiagramId, setSelectedDiagramId] = useState<number | null>(diagrams[0]?.id ?? null);
  const selectedDiagram = diagrams.find((diagram) => diagram.id === selectedDiagramId) ?? diagrams[0] ?? null;

  return (
    <article className="overflow-hidden rounded-2xl bg-white text-foreground shadow-2xl">
      <div className="border-b border-border p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Levantamiento de procesos</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{project.nombre}</h2>
            {project.descripcion && (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{project.descripcion}</p>
            )}
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClassName(
              project.estado
            )}`}
          >
            {formatStatus(project.estado)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <ProjectStat label="Avance" value={`${progress}%`} />
          <ProjectStat label="Procesos" value={processes.length.toString()} />
          <ProjectStat label="BPMN" value={diagrams.length.toString()} />
          <ProjectStat label="Pendientes" value={openPendings.length.toString()} />
          <ProjectStat label="Cierre estimado" value={formatDate(project.fecha_fin)} small />
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[360px_1fr]">
        <aside className="border-b border-border p-6 md:p-8 xl:border-b-0 xl:border-r">
          <ProcessMap processes={processes} />
          <PendingList pendings={openPendings} />
          <FindingList findings={findings} />
        </aside>

        <div className="space-y-0">
          <BpmnSection
            diagrams={diagrams}
            selectedDiagram={selectedDiagram}
            onSelectDiagram={setSelectedDiagramId}
          />
          <GanttSection tasks={project.tareas ?? []} />
        </div>
      </div>
    </article>
  );
};

const ProjectStat = ({ label, value, small = false }: { label: string; value: string; small?: boolean }) => (
  <div className="rounded-xl bg-secondary p-4">
    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className={`mt-2 font-bold ${small ? "text-lg" : "text-3xl"}`}>{value}</p>
  </div>
);

const ProcessMap = ({ processes }: { processes: PortalProcess[] }) => (
  <section>
    <h3 className="text-lg font-semibold tracking-tight">Mapa de procesos</h3>
    <p className="mt-1 text-sm text-muted-foreground">Estado de cada proceso identificado en el levantamiento.</p>

    {processes.length ? (
      <div className="mt-5 space-y-3">
        {processes.map((process) => (
          <div key={process.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{process.nombre}</p>
                {process.area && <p className="mt-1 text-xs text-muted-foreground">{process.area}</p>}
              </div>
              <span
                className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(
                  process.estado
                )}`}
              >
                {formatStatus(process.estado)}
              </span>
            </div>
            {process.descripcion && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{process.descripcion}</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <EmptyBlock text="Sin procesos publicados todavía." />
    )}
  </section>
);

const PendingList = ({ pendings }: { pendings: PortalPending[] }) => (
  <section className="mt-8">
    <h3 className="text-lg font-semibold tracking-tight">Pendientes del cliente</h3>
    <p className="mt-1 text-sm text-muted-foreground">Validaciones o información necesaria para avanzar.</p>

    {pendings.length ? (
      <div className="mt-5 space-y-3">
        {pendings.slice(0, 4).map((pending) => (
          <div key={pending.id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{pending.titulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">Vence: {formatDate(pending.fecha_limite)}</p>
            {pending.descripcion && <p className="mt-2 text-sm text-muted-foreground">{pending.descripcion}</p>}
          </div>
        ))}
      </div>
    ) : (
      <EmptyBlock text="No hay pendientes abiertos." />
    )}
  </section>
);

const FindingList = ({ findings }: { findings: PortalFinding[] }) => (
  <section className="mt-8">
    <h3 className="text-lg font-semibold tracking-tight">Hallazgos</h3>
    <p className="mt-1 text-sm text-muted-foreground">Oportunidades o riesgos detectados en los procesos.</p>

    {findings.length ? (
      <div className="mt-5 space-y-3">
        {findings.slice(0, 4).map((finding) => (
          <div key={finding.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{finding.titulo}</p>
              <span
                className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClassName(
                  finding.prioridad
                )}`}
              >
                {formatStatus(finding.prioridad)}
              </span>
            </div>
            {finding.impacto && <p className="mt-2 text-sm text-muted-foreground">Impacto: {finding.impacto}</p>}
          </div>
        ))}
      </div>
    ) : (
      <EmptyBlock text="Sin hallazgos publicados todavía." />
    )}
  </section>
);

const BpmnSection = ({
  diagrams,
  selectedDiagram,
  onSelectDiagram,
}: {
  diagrams: PortalBpmn[];
  selectedDiagram: PortalBpmn | null;
  onSelectDiagram: (id: number) => void;
}) => (
  <section className="border-b border-border p-6 md:p-8">
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Visualizador BPMN</h3>
        <p className="mt-1 text-sm text-muted-foreground">Selecciona un proceso publicado para revisar su diagrama.</p>
      </div>
      {diagrams.length > 0 && (
        <select
          value={selectedDiagram?.id ?? ""}
          onChange={(event) => onSelectDiagram(Number(event.target.value))}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
        >
          {diagrams.map((diagram) => (
            <option key={diagram.id} value={diagram.id}>
              {diagram.nombre}
            </option>
          ))}
        </select>
      )}
    </div>

    {selectedDiagram ? (
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="rounded-xl border border-border p-4">
          <p className="font-medium">{selectedDiagram.nombre}</p>
          {selectedDiagram.descripcion && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedDiagram.descripcion}</p>
          )}
          {selectedDiagram.archivo_path && (
            <p className="mt-3 rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
              {selectedDiagram.archivo_path}
            </p>
          )}
          {selectedDiagram.archivo_url && (
            <a
              href={selectedDiagram.archivo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Abrir archivo fuente
            </a>
          )}
        </div>
        <BpmnViewer xmlUrl={selectedDiagram.archivo_url} title={selectedDiagram.nombre} />
      </div>
    ) : (
      <EmptyBlock text="Sin BPMN publicados todavía." />
    )}
  </section>
);

const GanttSection = ({ tasks }: { tasks: PortalTask[] }) => {
  const range = getGanttRange(tasks);

  return (
    <section className="p-6 md:p-8">
      <div className="mb-5">
        <h3 className="text-lg font-semibold tracking-tight">Carta Gantt</h3>
        <p className="mt-1 text-sm text-muted-foreground">Hitos y tareas publicados para este levantamiento.</p>
      </div>

      {tasks.length ? (
        <div className="space-y-4">
          {tasks.map((task) => {
            const position = range ? getGanttPosition(task, range) : { left: 0, width: getTaskProgress(task) };

            return (
              <div key={task.id} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{task.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.fase ? `${task.fase} · ` : ""}
                      {formatDate(task.fecha_inicio)} - {formatDate(task.fecha_fin)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(
                      task.estado
                    )}`}
                  >
                    {formatStatus(task.estado)} · {getTaskProgress(task)}%
                  </span>
                </div>

                <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="absolute inset-y-0 rounded-full bg-primary"
                    style={{ left: `${position.left}%`, width: `${position.width}%` }}
                  />
                </div>

                {task.descripcion && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{task.descripcion}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyBlock text="Sin tareas publicadas todavía." />
      )}
    </section>
  );
};

const EmptyBlock = ({ text }: { text: string }) => (
  <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
    {text}
  </div>
);

export default Portal;
