import * as React from "react";
import type { Archivo } from "../../../models/Files";
import type { InsumoProyecto } from "../../../models/Insumos";
import { useSupabaseApi } from "../../Supabase/useSupabaseApi";

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
  const api = useSupabaseApi();

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
        const filePath = String(item.file_path ?? "").trim();
        if (!filePath) continue;

        const signed = await api.call<{ signedUrl: string }>("taskInsumos.signedUrl", {
          file_path: filePath,
          expires_in: 600,
        });

        if (!signed?.signedUrl) continue;

        archivos.push({
          id: String(item.id ?? filePath),
          name: String(item.file_name ?? filePath.split("/").pop() ?? "archivo"),
          webUrl: signed.signedUrl,
          isFolder: false,
          mimeType: String(item.mime_type ?? "").trim() || undefined,
          path: filePath,
        });
      }
      return archivos;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Error cargando elementos de la carpeta.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  return { load };
}
