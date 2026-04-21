import * as React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import type { GetAllOpts } from "../../../models/commons";
import type { TareasProyectosService } from "../../../services/ProjectTasks.service";

/**
 * Repositorio de acceso a datos para tareas de proyecto.
 * @param tasksSvc - Servicio SharePoint de tareas.
 * @returns Operaciones de lectura y escritura de tareas.
 */
export function useTasksRepository(tasksSvc: TareasProyectosService) {
  const getAll = React.useCallback(
    async (opts: GetAllOpts) => {
      return await tasksSvc.getAllPlain(opts);
    },
    [tasksSvc]
  );

  const listByProject = React.useCallback(
    (projectId: string, opts?: Partial<GetAllOpts>) =>
      tasksSvc.getAllPlain({
        top: 20000,
        filter: `fields/IdProyecto eq '${projectId}'`,
        ...(opts ?? {}),
      }),
    [tasksSvc]
  );

  const create = React.useCallback((payload: projectTasks) => tasksSvc.create(payload), [tasksSvc]);
  const update = React.useCallback((id: string, patch: Partial<projectTasks>) => tasksSvc.update(id, patch), [tasksSvc]);
  const remove = React.useCallback((id: string) => tasksSvc.delete(id), [tasksSvc]);

  const getPredecessorByCodigo = React.useCallback(
    async (codigoDep: string, proyecto: string): Promise<projectTasks | null> => {
      const items = await tasksSvc.getAllPlain({
        filter: `fields/Codigo eq '${codigoDep}' and fields/IdProyecto eq '${proyecto}'`,
        top: 1,
      });
      return items[0] ?? null;
    },
    [tasksSvc]
  );

  const getSuccessorsByCodigo = React.useCallback(
    async (codigo: string, proyecto: string): Promise<projectTasks[]> => {
      return tasksSvc.getAllPlain({
        filter: `fields/Dependencia eq '${codigo}' and fields/IdProyecto eq '${proyecto}'`,
        top: 20000,
      });
    },
    [tasksSvc]
  );

  const countByFilter = React.useCallback(
    async (filter: string) => (await tasksSvc.getAllPlain({ filter, top: 20000 })).length,
    [tasksSvc]
  );

  return {
    getAll,
    listByProject,
    create,
    update,
    remove,
    getPredecessorByCodigo,
    getSuccessorsByCodigo,
    countByFilter,
  };
}
