import type { LogTarea } from "../../models/LogTarea";
import type { taskLogRepository } from "../../repositories/taskLogRepository/TaskLogRepository";
import { toGraphDateTime } from "../../utils/Date";

/**
 * Registra una acción ejecutada sobre una tarea.
 * @param taskId - Identificador de la tarea.
 * @param userName - Nombre del usuario que ejecutó la acción.
 * @param service - Servicios Graph disponibles en la aplicación.
 * @param accion - Descripción de la acción realizada.
 * @returns Resultado de la operación de creación del log.
 */
export async function createTaskLog(
  taskId: string,
  userName: string,
  service: taskLogRepository,
  accion: string
): Promise<{ok: boolean, error: string | null}> {
  const today = new Date();
  const graphToday = toGraphDateTime(today) ?? "";

  try {
    await service.createLog({
      fecha_accion: graphToday,
      id_tarea: taskId,
      realizado_por: userName,
      accion,
    });
    return {
      ok: true,
      error: null
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error creando log de tarea";

    return {
      ok: false,
      error: message
    };
  }
}

/**
 * Carga el historial de acciones de una tarea.
 * @param taskId - Identificador de la tarea.
 * @param service - Servicios definidos en la interfaz taskLogRepository
 * @returns Logs asociados a la tarea y estado de error si aplica.
 */
export async function loadTaskLog(
  taskId: string,
  service: taskLogRepository,
): Promise<{data: LogTarea[], error: string | null}> {
  try {
    const logs = (await service.loadTaskLogs({ id_tarea: taskId }));
    return {
      data: logs,
      error: null
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error creando log de tarea";

    return {
      data: [],
      error: message
    };
  }
}
