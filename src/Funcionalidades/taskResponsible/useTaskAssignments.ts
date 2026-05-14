import * as React from "react";
import type { projectTasks } from "../../models/AperturaTienda";
import { useAsyncStatus } from "../commons/useAsyncStatus";
import { useTasksRepository } from "../ProjectTasksHooks/useTasksRepository";
import { useAuth } from "../../auth/authProvider";
import type { useResponsableTareaRepository } from "./useResponsableTareaRepository";
import { useRepositories } from "../../repositories/repositoriesContext";

/**
 * Expone validaciones y métricas ligadas a asignación de responsables.
 * @param taskRepo - Repositorio de tareas.
 * @param responsableRepo - Repositorio de responsables por tarea.
 * @returns Estado async y utilidades de asignación.
 */
export function useTaskAssignments(taskRepo: ReturnType<typeof useTasksRepository>, responsableRepo: ReturnType<typeof useResponsableTareaRepository>) {
  const { account } = useAuth();
  const status = useAsyncStatus();
  const repositories = useRepositories()

  /**
   * Cuenta cuántas tareas de un proyecto no tienen responsables asignados.
   * @param projectId - Identificador del proyecto.
   * @returns Cantidad de tareas sin asignación.
   */
  const unassignedCount = React.useCallback(
    async (projectId: string) => {
      status.start();
      try {
        const tasks = await taskRepo.getAll({ id_proyecto: Number(projectId)});
        const taskIds = (tasks ?? [])
          .map((t) => String(t.id ?? "").trim())
          .filter(Boolean);

        if (taskIds.length === 0) return 0;

        const responsables = (await repositories.projectTaskReponsible?.loadResponsible());

        const taskIdSet = new Set(taskIds);
        const assignedSet = new Set<string>();

        for (const r of responsables ?? []) {
          const idT = String((r as any).IdTarea ?? "").trim();
          if (idT && taskIdSet.has(idT)) assignedSet.add(idT);
        }

        let count = 0;
        for (const id of taskIds) {
          if (!assignedSet.has(id)) count++;
        }

        return count;
      } catch (e) {
        status.fail(e, "Error consultando sin asignar");
        return 0;
      } finally {
        status.stop();
      }
    },
    [taskRepo, status,]
  );

  /**
   * Determina si el usuario autenticado puede completar una tarea.
   * @param task - Tarea a validar.
   * @returns `true` si el usuario es uno de los responsables asignados.
   */
  const canComplete = React.useCallback(async (task: projectTasks): Promise<boolean> => {
    try {
      if (!task?.id) return false;

      const responsables = await responsableRepo.getByTaskId(Number(task.id));

      if (!responsables?.length) return false;

      const userEmail = account?.username?.toLowerCase().trim();

      return responsables.some(
        (r) => r.correo?.toLowerCase().trim() === userEmail
      );
    } catch {
      return false;
    }
  }, [responsableRepo, account]);

  return { ...status, unassignedCount, canComplete };
}
