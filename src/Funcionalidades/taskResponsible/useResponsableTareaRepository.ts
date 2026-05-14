import * as React from "react";
import type { taskResponsible } from "../../models/AperturaTienda";
import { useGraphServices } from "../../graph/graphContext";
import { useRepositories } from "../../repositories/repositoriesContext";

/**
 * Repositorio de acceso a datos para responsables asignados a tareas.
 * @returns Operaciones CRUD básicas sobre responsables de tarea.
 */
export function useResponsableTareaRepository() {
  const graph = useGraphServices();
  const repositories = useRepositories()

  /**
   * Obtiene los responsables asignados a una tarea.
   * @param taskId - Identificador de la tarea.
   * @returns Responsables asignados.
   */
  const getByTaskId = React.useCallback(async (taskId: number) => {
    if (!taskId) return [];
    const task = await repositories.projectTaskReponsible?.loadResponsible({ tarea_id: taskId})
    return task
  }, [graph]);

  /**
   * Crea múltiples responsables para una tarea.
   * @param taskId - Identificador de la tarea.
   * @param rows - Responsables a crear.
   * @returns Responsables creados.
   */
  const createMany = React.useCallback(async (taskId: string, rows: Omit<taskResponsible, "id" | "tarea_id">[]) => {
      if (!taskId || !rows?.length) return [];
      const created: taskResponsible[] = [];
      for (const r of rows) {
        const one = await repositories.projectTaskReponsible?.createResponsible({
          tarea_id: taskId,
          correo: r.correo,
          nombre: r.nombre,
        });

        if(!one) continue

        created.push(one);
      }
      return created;
    },
    [graph]
  );

  return { getByTaskId, createMany,};
}
