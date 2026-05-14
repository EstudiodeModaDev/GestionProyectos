import React from "react";
import type { Archivo } from "../../../models/Files";
import type { InsumoProyecto, plantillaInsumos } from "../../../models/Insumos";
import type { InsumosProyectosRepository } from "../../../repositories/insumosProyectoRepository/insumosProyectoRepository";
import { showError, showSuccess, showWarning } from "../../../utils/toast";
import { useInsumosAttachment } from "../../Attachments/Library/useInsumosAttachments";
import type { SalidaFiles } from "../shared/types";
import { getProjectInsumoId } from "../shared/utils";
import { buildCreateProjectInsumoPayload, createInitialProjectInsumoState } from "./utils";

export function useInsumosProyecto(insumosProyectoSvc: InsumosProyectosRepository) {
  const insumosAttachments = useInsumosAttachment();
  const [rows, setRows] = React.useState<InsumoProyecto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<InsumoProyecto>(createInitialProjectInsumoState());

  const setField = <K extends keyof InsumoProyecto>(k: K, v: InsumoProyecto[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await insumosProyectoSvc.listInsumos({});
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando insumos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [insumosProyectoSvc]);

  const applyRange = React.useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const reloadAll = applyRange;

  const saveInsumo = async (e: React.FormEvent, id: string, texto: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await insumosProyectoSvc.updateInsumoProyecto(id, { texto });
      showSuccess("Se ha actualizado el registro con éxito");
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const createAllInsumosFromTemplate = async (
    e: React.FormEvent,
    plantillaInsumosArr: plantillaInsumos[],
    proyectoId: string
  ) => {
    e.preventDefault();

    if (!plantillaInsumosArr?.length) {
      showWarning("No hay plantillaInsumos definidos");
      return { ok: false, data: {} as Record<string, string> };
    }

    setLoading(true);
    const map: Record<string, string> = {};

    try {
      for (const plantilla of plantillaInsumosArr) {
        const creado = await insumosProyectoSvc.createInsumoProyecto(
          buildCreateProjectInsumoPayload(plantilla, proyectoId)
        );

        const plantillaId = String(plantilla.id ?? "").trim();
        const creadoId = getProjectInsumoId(creado);

        if (!plantillaId || !creadoId) {
          console.warn("No pude mapear insumo plantilla -> creado", { plantilla, creado });
          continue;
        }

        map[plantillaId] = creadoId;
      }

      return { ok: true, data: map };
    } catch (err) {
      console.error("Error creando InsumoProyecto desde plantilla", err);
      return { ok: false, data: {} as Record<string, string> };
    } finally {
      setLoading(false);
    }
  };

  const saveInsumoFiles = async (filesByInsumo: SalidaFiles) => {
    setLoading(true);
    try {
      const entries = Object.entries(filesByInsumo).filter(([, file]) => !!file) as [string, File][];

      if (!entries.length) {
        return { ok: false, message: "No hay archivos para enviar" };
      }

      const uploadedFiles = await Promise.all(
        entries.map(async ([insumoId, file]) => {
          const insumo = (await insumosProyectoSvc.listInsumos({ id: insumoId }))[0];
          const projectId = String(insumo?.id_proyecto ?? "").trim();
          if (!projectId) {
            throw new Error(`No se encontro id_proyecto para el insumo ${insumoId}.`);
          }

          const uploaded = await insumosAttachments.handleUploadClick(
            `${projectId}/${insumoId}`,
            file,
            `${file.name}(Insumo de la tarea ${insumoId})`
          );

          await insumosProyectoSvc.updateInsumoProyecto(insumoId, {
            texto: file.name,
            file_name: file.name,
            file_path: uploaded.path,
            mime_type: file.type || null,
          });

          return { insumoId, uploaded };
        })
      );

      return { ok: true, uploadedFiles };
    } catch (e: any) {
      console.error(e);
      showError(e?.message ?? "Ha ocurrido un error subiendo los archivos, por favor vuelva a intentarlo");
      return { ok: false, message: e?.message ?? "Error desconocido" };
    } finally {
      setLoading(false);
    }
  };

  const saveInsumoText = async (idInsumo: string, text: string) => {
    setLoading(true);
    try {
      await insumosProyectoSvc.updateInsumoProyecto(idInsumo, { texto: text });
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  const loadInsumosFiles = async (insumoId: string): Promise<Archivo[]> => {
    try {
      const insumo = (await insumosProyectoSvc.listInsumos({ id: insumoId }))[0];
      if (!insumo) return [];
      return (await insumosAttachments.reload([insumo])) ?? [];
    } catch (e: any) {
      console.error(e);
      showError("Error cargando archivos de insumos: " + e.message);
      return [];
    }
  };

  const saveInsumoFile = async (insumoId: string, file: File) => saveInsumoFiles({ [insumoId]: file });

  return {
    saveInsumoText,
    rows,
    loading,
    error,
    state,
    setField,
    loadFirstPage,
    applyRange,
    reloadAll,
    saveInsumo,
    createAllInsumosFromTemplate,
    saveInsumoFiles,
    saveInsumoFile,
    loadInsumosFiles,
  };
}
