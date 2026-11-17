import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export type EmpresaLogin = {
  id: number;
  empresa: string;
  usuario: string;
  session_token: string;
  expires_at: string;
};

export type PortalTask = {
  id: number;
  id_git: string | null;
  fase: string | null;
  titulo: string;
  descripcion: string | null;
  estado: string;
  responsable: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  progreso: number;
  peso: number;
  orden: number;
  dependencias: string[];
};

export type PortalBpmn = {
  id: number;
  nombre: string;
  descripcion: string | null;
  archivo_path: string | null;
  archivo_url: string | null;
  /** Miniatura SVG del diagrama. Opcional: sin ella el portal muestra una tarjeta de texto. */
  preview_path: string | null;
  preview_url: string | null;
  proceso_id?: number | null;
  updated_at: string | null;
};

export type PortalFinding = {
  id: number;
  titulo: string;
  descripcion: string | null;
  impacto: string | null;
  recomendacion: string | null;
  prioridad: string;
  estado: string;
  archivo_path: string | null;
  archivo_url: string | null;
  orden: number;
};

export type PortalInforme = {
  id: number;
  nombre: string;
  descripcion: string | null;
  archivo_path: string | null;
  archivo_url: string | null;
  orden: number;
  updated_at: string | null;
};

export type PortalProcess = {
  id: number;
  slug: string | null;
  nombre: string;
  area: string | null;
  estado: string;
  responsable_methodical: string | null;
  responsable_cliente: string | null;
  descripcion: string | null;
  orden: number;
  updated_at: string | null;
  bpmn: PortalBpmn[];
  hallazgos: PortalFinding[];
  informes: PortalInforme[];
};

export type ModuloEtapa = "por_desarrollar" | "en_desarrollo" | "en_pruebas" | "entregado";

export type PortalModulo = {
  id: number;
  slug: string | null;
  nombre: string;
  grupo: string | null;
  descripcion: string | null;
  etapa: ModuloEtapa;
  /** Ventana del plan en que se trabaja el módulo. Con ella, la etapa se deriva del calendario. */
  fecha_inicio: string | null;
  fecha_fin: string | null;
  orden: number;
};

export type PortalDocumento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  archivo_path: string | null;
  archivo_url: string | null;
  orden: number;
  updated_at: string | null;
};

/** El levantamiento de procesos y el desarrollo de software se muestran en vistas separadas. */
export type ProjectTipo = "levantamiento" | "desarrollo";

export type PortalProject = {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  tipo: ProjectTipo;
  /** Enlace al sistema desplegado; solo proyectos de desarrollo. */
  sistema_url: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  updated_at: string | null;
  tareas: PortalTask[];
  procesos: PortalProcess[];
  bpmn: PortalBpmn[];
  modulos: PortalModulo[];
  documentos: PortalDocumento[];
};

export type PortalData = {
  empresa: {
    id: number;
    empresa: string;
    usuario: string;
  };
  proyectos: PortalProject[];
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export type VitrinaTipo = "web" | "demo" | "video" | "imagen" | "documento";
export type VitrinaEstado = "en_diseno" | "en_desarrollo" | "en_revision" | "listo";

export type VitrinaItem = {
  id: number;
  grupo: string | null;
  tipo: VitrinaTipo;
  titulo: string;
  descripcion: string | null;
  estado: VitrinaEstado | null;
  url: string | null;
  captura_url: string | null;
  /** Falso cuando el sitio bloquea iframes: solo se ofrece abrir en pestaña nueva. */
  embeber: boolean;
  nota: string | null;
  fecha: string | null;
};

/** Página pública sin login (/ver/:token) con avances, demos y diseños. */
export type Vitrina = {
  cliente: string | null;
  titulo: string;
  mensaje: string | null;
  updated_at: string | null;
  items: VitrinaItem[];
};
