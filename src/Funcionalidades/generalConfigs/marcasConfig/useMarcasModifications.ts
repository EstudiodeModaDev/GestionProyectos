import type { marcas } from "../../../models/generalConfigs";
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import { showError, showSuccess } from "../../../utils/toast";

/**
 * Centraliza las operaciones de escritura sobre marcas.
 * @param generalConfigSvc - Servicio de acceso a configuraciones generales.
 * @returns Operaciones de creación.
 */
export function useMarcasModification(generalConfigSvc: GeneralConfigRepository) {
  /**
   * Crea una marca.
   * @param payload - Datos de la marca a crear.
   */
  const handleSubmit = async (payload: marcas) => {
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
