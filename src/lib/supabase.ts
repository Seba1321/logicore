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
  orden: number;
};

export type PortalPending = {
  id: number;
  titulo: string;
  descripcion: string | null;
  responsable: string | null;
  fecha_limite: string | null;
  estado: string;
  orden: number;
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
  pendientes: PortalPending[];
};

export type PortalProject = {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  updated_at: string | null;
  tareas: PortalTask[];
  procesos: PortalProcess[];
  bpmn: PortalBpmn[];
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
