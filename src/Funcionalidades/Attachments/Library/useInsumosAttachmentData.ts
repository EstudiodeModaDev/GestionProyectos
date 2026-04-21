import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import type { Archivo } from "../../../models/Files";
import type { InsumoProyecto } from "../../../models/Insumos";

type UseTicketDataParams = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

/**
 * Resuelve los archivos asociados a un conjunto de insumos.
 * @param params - Setters para exponer estado de carga y error al hook padre.
 * @returns Operación de carga de adjuntos.
 */
export function useInsumosAttachmentData({ setLoading, setError }: UseTicketDataParams) {
  const graph = useGraphServices();

  /**
   * Carga los archivos asociados a los insumos recibidos.
   * @param items - Insumos cuyos adjuntos deben recuperarse.
   * @returns Archivos encontrados para los insumos indicados.
   */
  const load = React.useCallback(async (items: InsumoProyecto[]): Promise<Archivo[]> => {
    setLoading(true);
    setError(null);

    try {
      const archivos: Archivo[] = [];
      for (const item of items) {
        console.log(item);
        const file = await graph.taskFilesInsumos.getFileById(item.insumoId);
        if (file) {
          archivos.push(file);
        }
      }
      return archivos;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Error cargando elementos de la carpeta.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return { load };
}
