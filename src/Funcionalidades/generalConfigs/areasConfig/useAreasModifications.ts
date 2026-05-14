import type { areas } from "../../../models/generalConfigs";
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import { showError, showSuccess } from "../../../utils/toast";

/**
 * Centraliza las operaciones de escritura sobre las áreas definidas.
 * @param generalConfigSvc - Servicio de acceso a configuraciones generales.
 * @returns Operaciones de creación y eliminación.
 */
export function useAreasModifications(generalConfigSvc: GeneralConfigRepository) {
  /**
   * Crea un área.
   * @param payload - Datos del área a crear.
   */
  const handleSubmit = async (payload: areas) => {
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
