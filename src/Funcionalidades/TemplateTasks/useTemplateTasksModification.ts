import type { TemplateTasks } from "../../models/AperturaTienda";
import type { TemplateTaskRepository } from "../../repositories/templateTaskRepository/templateTaskRepository";
import { showError, showSuccess } from "../../utils/toast";

/**
 * Centraliza las operaciones de escritura sobre tareas plantilla.
 * @param templateTasksSvc - Servicio de acceso a tareas plantilla.
 * @returns Operaciones de creación, edición y eliminación.
 */
export function useTemplateTasksModification(templateTasksSvc: TemplateTaskRepository) {
  /**
   * Crea una tarea plantilla.
   * @param payload - Datos de la tarea a crear.
   */
  const handleSubmit = async (payload: TemplateTasks) => {
    try {
      await templateTasksSvc.createTask(payload);
      showSuccess("Se ha creado el registro con éxito");
    } catch {
      showError("Ha sucedido un error, por favor inténtelo de nuevo");
      return;
    }
  };

  /**
   * Edita una tarea plantilla existente.
   * @param Id - Identificador de la tarea.
   * @param payload - Datos actualizados.
   */
  const handleEdit = async (Id: string, payload: TemplateTasks) => {
    try {
      await templateTasksSvc.updateTask(Id, payload);
      showSuccess("Se ha editado el registro con éxito");
    } catch {
      showError("Ha ocurrido un error, por favor inténtelo nuevamente");
      return;
    }
  };

  /**
   * Elimina una tarea plantilla.
   * @param Id - Identificador de la tarea a eliminar.
   */
  const handleDelete = async (Id: string) => {
    try {
      await templateTasksSvc.inactivateTask(Id);
      showSuccess("Se ha eliminado el registro con éxito");
    } catch {
      showError("Ha ocurrido un error, por favor inténtelo nuevamente");
      return;
    }
  };

  return { handleSubmit, handleEdit, handleDelete };
}
