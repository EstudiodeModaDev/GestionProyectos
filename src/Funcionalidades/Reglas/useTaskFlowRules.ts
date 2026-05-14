import type { ReglasFlujoTareas } from "../../models/Insumos";
import { useRepositories } from "../../repositories/repositoriesContext";

/**
 * Expone consultas rápidas sobre reglas de flujo entre tareas.
 * @returns API para obtener reglas asociadas a una tarea plantilla.
 */
export function useReglasFlujo() {
  const repositories = useRepositories()

  /**
   * Obtiene las reglas configuradas para una tarea origen.
   * @param templateTaskId - Código o identificador de la tarea origen.
   * @returns Reglas de flujo asociadas a la tarea.
   */
  const getRulesByTask = async (templateTaskId: string): Promise<ReglasFlujoTareas[]> => {
    const reglas = (await repositories.reglasFlujo?.loadFilterRules({id_template_task_origen: templateTaskId})) ?? [];

    return reglas;
  };

  return {
    getRulesByTask,
  };
}
