import * as React from "react";
import type { projectTasks, TemplateTasks } from "../../../models/AperturaTienda";
import { useRepositories } from "../../../repositories/repositoriesContext";
import {
  getProjectTaskProjectId,
  getProjectTaskTemplateId,
  hydrateProjectTask,
  hydrateProjectTasks,
} from "../../../utils/projectTasks";
import type { ProjectTasksFilters, ProjectTasksRepository } from "../../../repositories/ProjectTasksRepository/ProjectTasksRepository";

/**
 * Repositorio de acceso a datos para tareas de proyecto.
 * @param tasksSvc - Servicio de tareas.
 * @returns Operaciones de lectura y escritura de tareas.
 */
export function useTasksRepository(tasksSvc: ProjectTasksRepository) {
  const repositories = useRepositories();

  const loadTemplateMap = React.useCallback(async () => {
    const templates = (await repositories.templateTask?.loadTasks()) ?? [];
    return new Map<string, TemplateTasks>(
      templates.map((template) => [String(template.id ?? ""), template])
    );
  }, [repositories.templateTask]);

  const getAll = React.useCallback(
    async (opts: ProjectTasksFilters) => {
      const [items, templateMap] = await Promise.all([tasksSvc.loadTasks(opts), loadTemplateMap()]);
      return hydrateProjectTasks(items, templateMap);
    },
    [tasksSvc, loadTemplateMap]
  );

  const listByProject = React.useCallback(
    async (projectId: string, opts?: ProjectTasksFilters) => {
      const [items, templateMap] = await Promise.all([
        tasksSvc.loadTasks({
          id_proyecto: Number(projectId),
          ...opts
        }),
        loadTemplateMap(),
      ]);

      return hydrateProjectTasks(items, templateMap);
    },
    [tasksSvc, loadTemplateMap]
  );

  const create = React.useCallback(
    async (payload: projectTasks) => {
      const created = await tasksSvc.createTasks(payload);
      const templateMap = await loadTemplateMap();
      return hydrateProjectTask(created, templateMap);
    },
    [tasksSvc, loadTemplateMap]
  );

  const update = React.useCallback(
    async (id: string, patch: Partial<projectTasks>) => {
      const updated = await tasksSvc.editTasks(id, patch);
      const templateMap = await loadTemplateMap();
      return hydrateProjectTask(updated, templateMap);
    },
    [tasksSvc, loadTemplateMap]
  );

  const getPredecessorByCodigo = React.useCallback(
    async (codigoDep: number, proyecto: string): Promise<projectTasks | null> => {
      if (!codigoDep || !proyecto) return null;

      const items = await listByProject(proyecto);
      return (
        items.find(
          (task) =>
            getProjectTaskProjectId(task) === String(proyecto) &&
            Number(getProjectTaskTemplateId(task)) === Number(codigoDep)
        ) ?? null
      );
    },
    [listByProject]
  );

  const getSuccessorsByCodigo = React.useCallback(
    async (codigo: string | number, proyecto: string): Promise<projectTasks[]> => {
      if (!codigo || !proyecto) return [];

      const items = await listByProject(proyecto);
      return items.filter(
        (task) =>
          getProjectTaskProjectId(task) === String(proyecto) &&
          Number(task.dependencia ?? 0) === Number(codigo)
      );
    },
    [listByProject]
  );

  const countByFilter = React.useCallback(
    async (filter: ProjectTasksFilters) => (await tasksSvc.loadTasks(filter)).length,
    [tasksSvc]
  );

  return {
    getAll,
    listByProject,
    create,
    update,
    getPredecessorByCodigo,
    getSuccessorsByCodigo,
    countByFilter,
  };
}
