import type { projectTasks, TemplateTasks } from "../models/AperturaTienda";

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function toStringValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function toNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getProjectTaskTemplateId(task: Partial<projectTasks>): string {
  return toStringValue(task.id_tarea_plantilla);
}

export function getProjectTaskProjectId(task: Partial<projectTasks>): string {
  return toStringValue(task.id_proyecto ?? task.IdProyecto);
}

export function getProjectTaskStatus(task: Partial<projectTasks>): string {
  return toStringValue(task.estado ?? task.Estado);
}

export function hydrateProjectTask(
  task: Partial<projectTasks>,
  templateMap: Map<string, TemplateTasks>
): projectTasks {
  const templateId = getProjectTaskTemplateId(task);
  const template = templateMap.get(templateId) ?? null;
  const projectId = getProjectTaskProjectId(task);
  const estado = getProjectTaskStatus(task);
  const fechaCierre = toNullableString(task.fecha_cierre ?? task.FechaCierre);
  const fechaResolucion = toNullableString(task.fecha_resolucion ?? task.FechaResolucion);
  const fechaInicio = toNullableString(task.fecha_inicio ?? task.fechaInicio);
  const razonDevolucion = toStringValue(task.razon_devolucion ?? task.razonDevolucion);
  const razonBloqueo = toStringValue(task.razon_bloqueo ?? task.razonBloqueo);

  return {
    ...task,
    id: toStringValue(task.id),
    id_tarea_plantilla: templateId,
    id_proyecto: projectId,
    estado,
    fecha_cierre: fechaCierre,
    fecha_resolucion: fechaResolucion,
    razon_devolucion: razonDevolucion,
    razon_bloqueo: razonBloqueo,
    fecha_inicio: fechaInicio,
    templateTask: template,
    codigo: template?.codigo ?? task.codigo,
    nombre_tarea: template?.nombre_tarea ?? task.nombre_tarea,
    area_responsable: template?.area_responsable ?? task.area_responsable,
    fase: template?.fase ?? task.fase,
    tipo_tarea: template?.tipo_tarea ?? task.tipo_tarea,
    dias_para_resolver: template?.dias_para_resolver ?? task.dias_para_resolver,
    dependencia: template?.dependencia ?? toNullableNumber(task.dependencia),
    dias_habiles: template?.dias_habiles ?? task.dias_habiles ?? false,
    IdProyecto: projectId,
    Estado: estado,
    FechaCierre: fechaCierre,
    FechaResolucion: fechaResolucion,
    fechaInicio,
    razonDevolucion,
    razonBloqueo,
  };
}

export function hydrateProjectTasks(
  tasks: Array<Partial<projectTasks>>,
  templateMap: Map<string, TemplateTasks>
): projectTasks[] {
  return tasks.map((task) => hydrateProjectTask(task, templateMap));
}
