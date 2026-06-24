import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const clientesDir = path.join(rootDir, "clientes");
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BPMN_BUCKET ?? "bpmn";

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL. Add it as a GitHub secret or pass it as a local environment variable.");
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Add the Supabase service_role key as a GitHub secret. Never expose it in frontend code."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const readJson = async (filePath, fallback = null) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
};

const ensureBucket = async () => {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) throw listError;

  const existingBucket = buckets?.find((bucket) => bucket.name === bucketName);

  if (!existingBucket) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });
    if (error) throw error;
    return;
  }

  if (!existingBucket.public) {
    const { error } = await supabase.storage.updateBucket(bucketName, {
      public: true,
    });
    if (error) throw error;
  }
};

const listClientSlugs = async () => {
  const entries = await fs.readdir(clientesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("_"));
};

const getContentType = (filePath) => {
  if (filePath.endsWith(".bpmn") || filePath.endsWith(".xml")) return "application/xml";
  if (filePath.endsWith(".pdf")) return "application/pdf";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
};

const uploadFile = async (clientSlug, clientDir, archivoPath) => {
  const localPath = path.join(clientDir, archivoPath);
  const storagePath = `${clientSlug}/${archivoPath}`.replaceAll("\\", "/");
  const fileBuffer = await fs.readFile(localPath);

  const { error } = await supabase.storage.from(bucketName).upload(storagePath, fileBuffer, {
    contentType: getContentType(archivoPath),
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  return data.publicUrl;
};

const findEmpresa = async (empresaName) => {
  const { data, error } = await supabase
    .from("empresas")
    .select("id, empresa, usuario")
    .ilike("empresa", empresaName)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Empresa not found in Supabase: ${empresaName}`);
  return data;
};

const insertRows = async (table, rows) => {
  if (!rows.length) return [];

  const { data, error } = await supabase.from(table).insert(rows).select("*");
  if (error) throw error;
  return data ?? [];
};

const syncClient = async (clientSlug) => {
  const clientDir = path.join(clientesDir, clientSlug);
  const projectConfig = await readJson(path.join(clientDir, "project.json"));
  const ganttConfig = await readJson(path.join(clientDir, "gantt.json"), { tareas: [] });
  const procesosConfig = await readJson(path.join(clientDir, "procesos.json"), { procesos: [] });
  const hallazgosConfig = await readJson(path.join(clientDir, "hallazgos.json"), { hallazgos: [] });

  if (!projectConfig.empresa || !projectConfig.proyecto?.nombre) {
    throw new Error(`Invalid project.json for ${clientSlug}`);
  }

  const empresa = await findEmpresa(projectConfig.empresa);
  const proyecto = projectConfig.proyecto;

  const { error: deleteError } = await supabase
    .from("proyectos")
    .delete()
    .eq("empresa_id", empresa.id)
    .eq("nombre", proyecto.nombre);

  if (deleteError) throw deleteError;

  const { data: insertedProject, error: projectError } = await supabase
    .from("proyectos")
    .insert({
      empresa_id: empresa.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? null,
      estado: proyecto.estado ?? "planificacion",
      fecha_inicio: proyecto.fecha_inicio ?? null,
      fecha_fin: proyecto.fecha_fin ?? null,
    })
    .select("id")
    .single();

  if (projectError) throw projectError;

  const proyectoId = insertedProject.id;

  await insertRows(
    "proyecto_tareas",
    (ganttConfig.tareas ?? []).map((task) => ({
      proyecto_id: proyectoId,
      id_git: task.id_git ?? null,
      fase: task.fase ?? null,
      titulo: task.titulo,
      descripcion: task.descripcion ?? null,
      estado: task.estado ?? "pendiente",
      responsable: task.responsable ?? null,
      fecha_inicio: task.fecha_inicio ?? null,
      fecha_fin: task.fecha_fin ?? null,
      progreso: task.progreso ?? 0,
      peso: task.peso ?? 1,
      orden: task.orden ?? 0,
      dependencias: task.dependencias ?? [],
    }))
  );

  const processMap = new Map();

  for (const processConfig of procesosConfig.procesos ?? []) {
    const { data: insertedProcess, error: processError } = await supabase
      .from("procesos")
      .insert({
        proyecto_id: proyectoId,
        slug: processConfig.slug ?? null,
        nombre: processConfig.nombre,
        area: processConfig.area ?? null,
        estado: processConfig.estado ?? "identificado",
        responsable_methodical: processConfig.responsable_methodical ?? null,
        responsable_cliente: processConfig.responsable_cliente ?? null,
        descripcion: processConfig.descripcion ?? null,
        orden: processConfig.orden ?? 0,
      })
      .select("id, slug")
      .single();

    if (processError) throw processError;

    if (processConfig.slug) processMap.set(processConfig.slug, insertedProcess.id);

    for (const bpmn of processConfig.bpmn ?? []) {
      const archivoUrl = bpmn.archivo_path
        ? await uploadFile(clientSlug, clientDir, bpmn.archivo_path)
        : bpmn.archivo_url ?? null;

      await insertRows("proyecto_bpmn", [
        {
          proyecto_id: proyectoId,
          proceso_id: insertedProcess.id,
          nombre: bpmn.nombre,
          descripcion: bpmn.descripcion ?? null,
          archivo_path: bpmn.archivo_path ?? null,
          archivo_url: archivoUrl,
        },
      ]);
    }

    for (const [index, informe] of (processConfig.informes ?? []).entries()) {
      const archivoUrl = informe.archivo_path
        ? await uploadFile(clientSlug, clientDir, informe.archivo_path)
        : informe.archivo_url ?? null;

      await insertRows("proceso_informes", [
        {
          proceso_id: insertedProcess.id,
          nombre: informe.nombre ?? "Informe final",
          descripcion: informe.descripcion ?? null,
          archivo_path: informe.archivo_path ?? null,
          archivo_url: archivoUrl,
          orden: informe.orden ?? index,
        },
      ]);
    }
  }

  const hallazgoRows = [];
  for (const finding of hallazgosConfig.hallazgos ?? []) {
    const procesoId = processMap.get(finding.proceso_slug);
    if (!procesoId) throw new Error(`Unknown proceso_slug in hallazgos.json: ${finding.proceso_slug}`);

    const archivoUrl = finding.archivo_path
      ? await uploadFile(clientSlug, clientDir, finding.archivo_path)
      : finding.archivo_url ?? null;

    hallazgoRows.push({
      proceso_id: procesoId,
      titulo: finding.titulo,
      descripcion: finding.descripcion ?? null,
      impacto: finding.impacto ?? null,
      recomendacion: finding.recomendacion ?? null,
      prioridad: finding.prioridad ?? "media",
      estado: finding.estado ?? "abierto",
      archivo_path: finding.archivo_path ?? null,
      archivo_url: archivoUrl,
      orden: finding.orden ?? 0,
    });
  }

  await insertRows("proceso_hallazgos", hallazgoRows);

  console.log(`Synced ${clientSlug}: ${proyecto.nombre}`);
};

await ensureBucket();

const requestedClients = process.argv.slice(2);
const clientSlugs = requestedClients.length ? requestedClients : await listClientSlugs();

for (const clientSlug of clientSlugs) {
  await syncClient(clientSlug);
}
