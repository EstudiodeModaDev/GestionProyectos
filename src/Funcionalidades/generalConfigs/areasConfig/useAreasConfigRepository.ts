import * as React from "react";;
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import type { areas, } from "../../../models/generalConfigs";
/**
 * Provee acceso de lectura a areas.
 * @param areasSvc - Servicio de acceso a areas responsables.
 * @returns Operaciones de consulta del módulo.
 */
export function useAreasRepository(areasSvc: GeneralConfigRepository) {
  /**
   * Carga todas las areas disponibles.
   * @returns Lista de areas.
   */
  const loadAreas = React.useCallback(async (): Promise<areas[]> => {
    try {
      const items = await areasSvc.loadConfigs();
      return items;
    } catch (e: any) {
      return [];
    }
  }, [areasSvc]);

  return { loadAreas };
}
