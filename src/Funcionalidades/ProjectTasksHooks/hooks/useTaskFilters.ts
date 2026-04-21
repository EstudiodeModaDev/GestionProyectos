import * as React from "react";
import { buildTaskFilter, type TaskFiltersState } from "../utils/taskFilters";

/**
 * Administra el estado de filtros de tareas y expone un builder de consultas.
 * @returns Estado de filtros y helper para construir la consulta al repositorio.
 */
export function useTaskFilters() {
  const [filters, setFilters] = React.useState<TaskFiltersState>({
    search: "",
    responsable: "all",
    soloIncompletas: true,
  });

  /**
   * Construye el filtro de consulta para un proyecto.
   * @param projectId - Identificador del proyecto.
   * @returns Opciones de consulta para Graph.
   */
  const buildFilter = React.useCallback(
    (projectId: string) => buildTaskFilter(filters, projectId),
    [filters]
  );

  return { filters, setFilters, buildFilter };
}
