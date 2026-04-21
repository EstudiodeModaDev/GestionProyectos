import { useGraphServices } from "../../graph/graphContext";
import type { ReglasFlujoTareas } from "../../models/Insumos";

/**
 * Expone consultas rápidas sobre reglas de flujo entre tareas.
 * @returns API para obtener reglas asociadas a una tarea plantilla.
 */
export function useReglasFlujo() {
  const graph = useGraphServices();

  /**
   * Obtiene las reglas configuradas para una tarea origen.
   * @param templateTaskId - Código o identificador de la tarea origen.
   * @returns Reglas de flujo asociadas a la tarea.
   */
  const getRulesByTask = async (templateTaskId: string): Promise<ReglasFlujoTareas[]> => {
    const reglas = await graph.reglasFlujo.getAll({
      filter: `fields/IdTemplateTaskOrigen eq '${templateTaskId}'`,
      top: 500,
    });

    return reglas;
  };

  return {
    getRulesByTask,
  };
}
