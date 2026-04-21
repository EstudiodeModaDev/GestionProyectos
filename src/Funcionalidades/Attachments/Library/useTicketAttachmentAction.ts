import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import type { Archivo } from "../../../models/Files";

/**
 * Expone acciones de subida para adjuntos de biblioteca.
 * @returns Operaciones para cargar archivos a SharePoint.
 */
export function useExplorerActions() {
  const service = useGraphServices();

  /**
   * Sube un archivo a la biblioteca configurada.
   * @param path - Ruta destino relativa.
   * @param file - Archivo a subir.
   * @param name - Nombre opcional del archivo final.
   * @returns Archivo creado o `null` si ocurre un error.
   */
  const handleUploadClick = React.useCallback(async (path: string, file: File, name?: string): Promise<Archivo | null> => {
    if (!file) {
      alert("Debes seleccionar un archivo antes de subirlo");
      return null;
    }

    try {
      const createdAttachment = await service.taskFilesInsumos.uploadFile(path, file, name);
      return createdAttachment;
    } catch (e: any) {
      console.error(e);
      alert("Error subiendo archivo: " + e.message);
      return null;
    }
  }, [service.taskFilesInsumos]);

  return {
    handleUploadClick,
  };
}
