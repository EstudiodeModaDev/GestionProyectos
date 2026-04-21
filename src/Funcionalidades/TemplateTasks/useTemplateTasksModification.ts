
import type { TemplateTasks } from "../../models/AperturaTienda";
import type { TemplateTaskService } from "../../services/TemplateTasks.service";

/**
 * Centraliza las operaciones de escritura sobre tareas plantilla.
 * @param templateTasksSvc - Servicio de acceso a tareas plantilla.
 * @returns Operaciones de creación, edición y eliminación.
 */
export function useTemplateTasksModification(templateTasksSvc: TemplateTaskService) {
  /**
   * Crea una tarea plantilla.
   * @param payload - Datos de la tarea a crear.
   */
  const handleSubmit = async (payload: TemplateTasks) => {
    try {
      await templateTasksSvc.create(payload);
      alert("Se ha creado el registro con Ã©xito");
    } catch {
      alert("Ha sucedio un error, por favor intentelo de nuevo");
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
      await templateTasksSvc.update(Id, payload);
      alert("Se ha editado el registro con Ã©xito");
    } catch {
      alert("Ha ocurrido un error, por favor intenelo nuevamente");
      return;
    }
  };

  /**
   * Elimina una tarea plantilla.
   * @param Id - Identificador de la tarea a eliminar.
   */
  const handleDelete = async (Id: string) => {
    try {
      await templateTasksSvc.delete(Id);
      alert("Se ha eliminado el registro con Ã©xito");
    } catch {
      alert("Ha ocurrido un error, por favor intenelo nuevamente");
      return;
    }
  };

  return { handleSubmit, handleEdit, handleDelete };
}
