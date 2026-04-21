import * as React from "react";
import type { AperturaTiendaService } from "../../services/TemplateTasks.service";
import type { TemplateTasks } from "../../models/AperturaTienda";

/**
 * Provee acceso de lectura a tareas plantilla.
 * @param templateTasksSvc - Servicio de acceso a tareas plantilla.
 * @returns Operaciones de consulta del módulo.
 */
export function useTemplateTasksRepository(templateTasksSvc: AperturaTiendaService) {
  /**
   * Carga todas las tareas plantilla disponibles.
   * @returns Lista de tareas plantilla.
   */
  const loadTasks = React.useCallback(async (): Promise<TemplateTasks[]> => {
    try {
      const items = await templateTasksSvc.getAll();
      return items;
    } catch (e: any) {
      return [];
    }
  }, [templateTasksSvc]);

  return { loadTasks };
}
