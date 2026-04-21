import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { GetAllOpts } from "../../../models/commons";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import { useTasksRepository } from "./useTasksRepository";

/**
 * Resuelve la lista de tareas críticas de un proyecto.
 * @param repo - Repositorio de tareas.
 * @param buildFilter - Constructor del filtro base del proyecto.
 * @returns Estado async y operación para obtener los códigos críticos.
 */
export function useTaskCriticalPaths(
  repo: ReturnType<typeof useTasksRepository>,
  buildFilter: (projectId: string) => GetAllOpts
) {
  const status = useAsyncStatus();

  /**
   * Obtiene los códigos de las tareas marcadas como críticas.
   * @param projectId - Identificador del proyecto.
   * @returns Lista de códigos de tareas críticas.
   */
  const getCriticalCodes = React.useCallback(
    async (projectId: string): Promise<string[]> => {
      status.start();
      try {
        const items = await repo.getAll(buildFilter(projectId));
        return items
          .filter((task: TemplateTasks) => (task.TipoTarea ?? "") === "Crítica" && task.Codigo)
          .map((task) => task.Codigo as string);
      } catch (e) {
        status.fail(e, "Error cargando critical path");
        return [];
      } finally {
        status.stop();
      }
    },
    [repo, buildFilter, status]
  );

  return { ...status, getCriticalCodes };
}
