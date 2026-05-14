import * as React from "react";;
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import type { marcas, } from "../../../models/generalConfigs";
/**
 * Provee acceso de lectura a marcas.
 * @param marcasSvc - Servicio de acceso a marcas.
 * @returns Operaciones de consulta del módulo.
 */
export function useMarcasRepository(marcasSvc: GeneralConfigRepository) {
  /**
   * Carga todas las marcas disponibles.
   * @returns Lista de marcas.
   */
  const loadMarcas = React.useCallback(async (): Promise<marcas[]> => {
    try {
      const items = await marcasSvc.loadConfigs();
      return items;
    } catch (e: any) {
      return [];
    }
  }, [marcasSvc]);

  return { loadMarcas };
}
