import * as React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import { toGraphDateTime } from "../../../utils/Date";
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
   * @returns Estado de la operación, porcentaje actualizado y fecha de cierre.
   */
  const setComplete = React.useCallback(
    async (
      task: projectTasks
    ): Promise<{ ok: boolean; percent: number; completationDate?: string | null }> => {
      status.start();
      try {
        const updated = await repo.update(task.Id!, {
          Estado: "Completada",
          FechaCierre: toGraphDateTime(new Date()),
        });

        const finished = await repo.countByFilter(
          `fields/IdProyecto eq '${task.IdProyecto}' and fields/Estado eq 'Completada'`
        );
        const total = await repo.countByFilter(`fields/IdProyecto eq '${task.IdProyecto}'`);
        const percent = total ? Math.round((finished / total) * 100) : 0;

        return { ok: true, percent, completationDate: updated.FechaCierre };
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
   * Define fecha de inicio, fecha de resolución y estado de una tarea habilitada.
   * @param id - Identificador de la tarea.
   * @param date - Nueva fecha objetivo.
   */
  const setCompletationDateTask = React.useCallback(
    async (id: string, date: string | Date): Promise<void> => {
      status.start();
      try {
        if (!date) return;

        await repo.update(id, {
          fechaInicio: toGraphDateTime(new Date()),
          FechaResolucion: toGraphDateTime(date),
          Estado: "Iniciado",
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
   * Devuelve una tarea al estado de corrección y recalcula el porcentaje del proyecto.
   * @param toReturn - Tarea que debe devolverse.
   * @returns Estado de la operación y porcentaje actualizado.
   */
  const setReturned = React.useCallback(
    async (toReturn: projectTasks): Promise<{ ok: boolean; percent: number }> => {
      try {
        await repo.update(toReturn.Id!, { Estado: "Devuelta", FechaCierre: null });

        const finished = await repo.countByFilter(
          `fields/IdProyecto eq '${toReturn.IdProyecto}' and fields/Estado eq 'Completada'`
        );
        const total = await repo.countByFilter(`fields/IdProyecto eq '${toReturn.IdProyecto}'`);
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
