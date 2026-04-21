import * as React from "react";
import type { taskResponsible } from "../../models/AperturaTienda";
import { useGraphServices } from "../../graph/graphContext";

/**
 * Repositorio de acceso a datos para responsables asignados a tareas.
 * @returns Operaciones CRUD básicas sobre responsables de tarea.
 */
export function useResponsableTareaRepository() {
  const graph = useGraphServices();

  /**
   * Obtiene los responsables asignados a una tarea.
   * @param taskId - Identificador de la tarea.
   * @returns Responsables asignados.
   */
  const getByTaskId = React.useCallback(async (taskId: string) => {
    if (!taskId) return [];
    return await graph.responsableProyecto.getAll({ filter: `fields/IdTarea eq '${taskId}'` });
  }, [graph]);

  /**
   * Crea múltiples responsables para una tarea.
   * @param taskId - Identificador de la tarea.
   * @param rows - Responsables a crear.
   * @returns Responsables creados.
   */
  const createMany = React.useCallback(
    async (taskId: string, rows: Omit<taskResponsible, "Id" | "IdTarea" | "reglaId">[]) => {
      if (!taskId || !rows?.length) return [];
      const created: taskResponsible[] = [];
      for (const r of rows) {
        const one = await graph.responsableProyecto.create({
          IdTarea: taskId,
          Title: r.Title,
          Correo: r.Correo,
        });
        created.push(one);
      }
      return created;
    },
    [graph]
  );

  /**
   * Elimina un responsable por su identificador.
   * @param id - Identificador del responsable.
   */
  const deleteById = React.useCallback(async (id: string) => {
    if (!id) return;
    await graph.responsableProyecto.delete(id);
  }, [graph]);

  /**
   * Elimina todos los responsables asignados a una tarea.
   * @param taskId - Identificador de la tarea.
   */
  const deleteAllByTaskId = React.useCallback(async (taskId: string) => {
    if (!taskId) return;
    const current = await graph.responsableProyecto.getAll({ filter: `fields/IdTarea eq '${taskId}'` });
    for (const r of current) {
      if (r.Id) await graph.responsableProyecto.delete(r.Id);
    }
  }, [graph]);

  return { getByTaskId, createMany, deleteById, deleteAllByTaskId };
}
