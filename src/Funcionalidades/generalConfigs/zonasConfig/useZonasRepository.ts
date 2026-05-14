import * as React from "react";;
import type { GeneralConfigRepository } from "../../../repositories/generalConfigRepository/generalConfigReposity";
import type { zonas } from "../../../models/generalConfigs";
/**
 * Provee acceso de lectura a marcas.
 * @param zonasSvc - Servicio de acceso a marcas.
 * @returns Operaciones de consulta del módulo.
 */
export function useZonasRepository(zonasSvc: GeneralConfigRepository) {
  /**
   * Carga todas las zonas disponibles.
   * @returns Lista de zonas.
   */
  const loadZonas = React.useCallback(async (): Promise<zonas[]> => {
    try {
      const items = await zonasSvc.loadConfigs();
      return items;
    } catch (e: any) {
      return [];
    }
  }, [zonasSvc]);

  return { loadZonas };
}
