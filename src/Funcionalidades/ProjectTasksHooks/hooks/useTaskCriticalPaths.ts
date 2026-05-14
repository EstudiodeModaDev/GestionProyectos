import * as React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import type { GetAllOpts } from "../../../models/commons";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import { useTasksRepository } from "./useTasksRepository";

/**
 * Resuelve la lista de tareas criticas de un proyecto.
 * @param repo - Repositorio de tareas.
 * @param buildFilter - Constructor del filtro base del proyecto.
 * @returns Estado async y operacion para obtener los codigos criticos.
 */
export function useTaskCriticalPaths(
  repo: ReturnType<typeof useTasksRepository>,
  buildFilter: (projectId: string) => GetAllOpts
) {
  const status = useAsyncStatus();
  const normalize = (value?: string | null) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  /**
   * Obtiene los codigos de las tareas marcadas como criticas.
   * @param projectId - Identificador del proyecto.
   * @returns Lista de codigos de tareas criticas.
   */
  const getCriticalCodes = React.useCallback(
    async (projectId: string): Promise<string[]> => {
      status.start();
      try {
        const items = await repo.getAll({id_proyecto: Number(projectId)});
        return items
          .filter((task: projectTasks) => normalize(task.tipo_tarea) === "critica" && task.codigo)
          .map((task) => task.codigo as string);
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
