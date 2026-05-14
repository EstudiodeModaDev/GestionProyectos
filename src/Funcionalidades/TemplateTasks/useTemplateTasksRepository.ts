import * as React from "react";
import type { TemplateTasks } from "../../models/AperturaTienda";
import type { TemplateTaskRepository } from "../../repositories/templateTaskRepository/templateTaskRepository";
/**
 * Provee acceso de lectura a tareas plantilla.
 * @param templateTasksSvc - Servicio de acceso a tareas plantilla.
 * @returns Operaciones de consulta del módulo.
 */
export function useTemplateTasksRepository(templateTasksSvc: TemplateTaskRepository) {
  /**
   * Carga todas las tareas plantilla disponibles.
   * @returns Lista de tareas plantilla.
   */
  const loadTasks = React.useCallback(async (): Promise<TemplateTasks[]> => {
    try {
      const items = await templateTasksSvc.loadTasks();
      return items;
    } catch (e: any) {
      return [];
    }
  }, [templateTasksSvc]);

  return { loadTasks };
}
