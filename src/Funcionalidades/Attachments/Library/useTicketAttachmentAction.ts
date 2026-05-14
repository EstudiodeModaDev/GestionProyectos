import * as React from "react";
import type { Archivo } from "../../../models/Files";
import { useAuth } from "../../../auth/authProvider";
import { showWarning } from "../../../utils/toast";

const uploadInsumoUrlEnv = import.meta.env.VITE_SUPABASE_UPLOAD_INSUMO_URL ?? "";
const supabaseEdgeApiUrl = import.meta.env.VITE_SUPABASE_EDGE_API_URL ?? "";

function resolveUploadInsumoUrl() {
  if (uploadInsumoUrlEnv) return uploadInsumoUrlEnv;
  if (supabaseEdgeApiUrl.endsWith("/api")) {
    return `${supabaseEdgeApiUrl.slice(0, -4)}/upload-insumo`;
  }

  throw new Error(
    "No se ha configurado VITE_SUPABASE_UPLOAD_INSUMO_URL y no fue posible derivarla desde VITE_SUPABASE_EDGE_API_URL."
  );
}

/**
 * Expone acciones de subida para adjuntos de biblioteca.
 * @returns Operaciones para cargar archivos a SharePoint.
 */
export function useExplorerActions() {
  const { getApiToken } = useAuth();

  /**
   * Sube un archivo a la biblioteca configurada.
   * @param path - Ruta destino relativa.
   * @param file - Archivo a subir.
   * @param name - Nombre opcional del archivo final.
   * @returns Archivo creado o `null` si ocurre un error.
   */
  const handleUploadClick = React.useCallback(async (path: string, file: File, name?: string): Promise<Archivo> => {
    if (!file) {
      showWarning("Debes seleccionar un archivo antes de subirlo");
      throw new Error("Debes seleccionar un archivo antes de subirlo");
    }

    const token = await getApiToken();
    const url = resolveUploadInsumoUrl();

    const segments = String(path ?? "")
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const projectId = segments[0] ?? "";
    const insumoId = segments[1] ?? "";

    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);
    form.append("insumoId", insumoId);
    form.append("fileName", name ?? file.name);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const body = (await response.json().catch(() => null)) as
      | { data?: { path: string; fileName: string }; error?: string }
      | null;

    if (!response.ok) {
      const detail = body?.error ?? `Error subiendo archivo (${response.status}).`;
      console.error("[upload-insumo] fallo en upload", {
        url,
        projectId,
        insumoId,
        status: response.status,
        detail,
      });
      throw new Error(detail);
    }

    const uploaded = body?.data;
    if (!uploaded?.path) {
      throw new Error("La respuesta de upload-insumo no incluyo la ruta del archivo.");
    }

    return {
      id: uploaded.path,
      name: uploaded.fileName ?? name ?? file.name,
      webUrl: "",
      isFolder: false,
      path: uploaded.path,
    };
  }, [getApiToken]);

  return {
    handleUploadClick,
  };
}
