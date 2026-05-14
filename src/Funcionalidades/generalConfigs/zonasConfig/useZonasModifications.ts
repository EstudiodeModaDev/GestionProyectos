import type { zonas } from "../../../models/generalConfigs";
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import { showError, showSuccess } from "../../../utils/toast";

/**
 * Centraliza las operaciones de escritura sobre tareas plantilla.
 * @param generalConfigSvc - Servicio de acceso a configuraciones generales.
 * @returns Operaciones de creación, edición y eliminación.
 */
export function useZonasModification(generalConfigSvc: GeneralConfigRepository) {
  /**
   * Crea una tarea zona.
   * @param payload - Datos de la tarea a crear.
   */
  const handleSubmit = async (payload: zonas) => {
    try {
      await generalConfigSvc.createConfig(payload);
      showSuccess("Se ha creado el registro con éxito");
    } catch {
      showError("Ha sucedido un error, por favor inténtelo de nuevo");
      return;
    }
  };

  return { handleSubmit };
}
