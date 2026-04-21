import type { GetAllOpts } from "../../../models/commons";

/**
 * Estado de filtros aplicados sobre la lista de tareas.
 */
export type TaskFiltersState = {
  search: string;
  responsable: string;
  soloIncompletas: boolean;
};

/**
 * Construye el filtro de Graph para consultar tareas de un proyecto.
 * @param filters - Estado actual de filtros.
 * @param projectId - Identificador del proyecto.
 * @returns Opciones de consulta listas para el repositorio.
 */
export function buildTaskFilter(
  filters: TaskFiltersState,
  projectId: string
): GetAllOpts {
  const parts: string[] = [`fields/IdProyecto eq '${projectId}'`];

  if (filters.search) {
    parts.push(`startswith(fields/Title, '${filters.search}')`);
  }

  if (filters.soloIncompletas) {
    parts.push(
      "(fields/Estado eq 'Iniciada' or fields/Estado eq 'Bloqueada' or fields/Estado eq 'Iniciado' or fields/Estado eq 'Devuelta' or fields/Estado eq 'UserBlocked')"
    );
  }

  return { filter: parts.join(" and "), top: 20000 };
}
