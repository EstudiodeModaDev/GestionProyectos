import * as React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import { toGraphDateTime } from "../../../utils/Date";
import { getProjectTaskProjectId } from "../../../utils/projectTasks";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import { useTasksRepository } from "./useTasksRepository";

/**
 * Centraliza las transiciones de estado ligadas al progreso de una tarea.
 * @param repo - Repositorio de tareas.
 * @returns Estado async y acciones para completar, abrir o devolver tareas.
 */
export function useTaskProgress(repo: ReturnType<typeof useTasksRepository>) {
  const status = useAsyncStatus();

  /**
   * Marca una tarea como completada y recalcula el porcentaje del proyecto.
   * @param task - Tarea a completar.
   * @returns Estado de la operacion, porcentaje actualizado y fecha de cierre.
   */
  const setComplete = React.useCallback(
    async (
      task: projectTasks
    ): Promise<{ ok: boolean; percent: number; completationDate?: string | null }> => {
      status.start();
      try {
        const updated = await repo.update(task.id!, {
          estado: "Completada",
          fecha_cierre: toGraphDateTime(new Date()),
        });

        const projectId = getProjectTaskProjectId(task);
        const finished = await repo.countByFilter({estado: "Completada", id_proyecto: Number(projectId)});
        const total = await repo.countByFilter({id_proyecto: Number(projectId)});
        const percent = total ? Math.round((finished / total) * 100) : 0;

        return { ok: true, percent, completationDate: updated.FechaCierre ?? updated.fecha_cierre };
      } catch (e) {
        status.fail(e, "Error completando tarea");
        return { ok: false, percent: 0 };
      } finally {
        status.stop();
      }
    },
    [repo, status]
  );

  /**
   * Define fecha de inicio, fecha de resolucion y estado de una tarea habilitada.
   * @param id - Identificador de la tarea.
   * @param date - Nueva fecha objetivo.
   */
  const setCompletationDateTask = React.useCallback(
    async (id: string, date: string | Date): Promise<void> => {
      status.start();
      try {
        if (!date) return;

        await repo.update(id, {
          fecha_inicio: toGraphDateTime(new Date()),
          fecha_resolucion: toGraphDateTime(date),
          estado: "Iniciado",
        });
      } catch (e) {
        status.fail(e, "Error abriendo tarea");
      } finally {
        status.stop();
      }
    },
    [repo, status]
  );

  /**
   * Devuelve una tarea al estado de correccion y recalcula el porcentaje del proyecto.
   * @param toReturn - Tarea que debe devolverse.
   * @returns Estado de la operacion y porcentaje actualizado.
   */
  const setReturned = React.useCallback(
    async (toReturn: projectTasks): Promise<{ ok: boolean; percent: number }> => {
      try {
        await repo.update(toReturn.id!, { estado: "Devuelta", fecha_cierre: null });

        const projectId = getProjectTaskProjectId(toReturn);
        const finished = await repo.countByFilter({estado: "Completada", id_proyecto: Number(projectId)});
        const total = await repo.countByFilter({id_proyecto: Number(projectId)});
        const percent = total ? Math.round((finished / total) * 100) : 0;

        return { ok: true, percent };
      } catch (e) {
        status.fail(e, "Error devolviendo tarea");
        return { ok: false, percent: 0 };
      }
    },
    [repo, status]
  );

  return { ...status, setComplete, setCompletationDateTask, setReturned };
}
