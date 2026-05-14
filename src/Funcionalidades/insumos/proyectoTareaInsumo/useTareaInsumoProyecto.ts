import React from "react";
import type { InsumoProyecto, plantillaTareaInsumo, tareaInsumoProyecto } from "../../../models/Insumos";
import type { TareaInsumoProyectoRepository } from "../../../repositories/TareaInsumoProyectoRepository/TareaInsumoProyectoRepository";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { normalize } from "../../../utils/commons";
import { showWarning } from "../../../utils/toast";
import {
  INPUT_LINK_RETRY_COUNT,
  INPUT_LINK_RETRY_DELAY_MS,
  TASK_INPUT_LINK_CREATION_CONCURRENCY,
} from "../shared/constants";
import { getProjectInsumoId } from "../shared/utils";
import { createInitialProjectTaskInsumoState } from "./utils";

export function useTareaInsumoProyecto(tareaInsumoProyectoSvc: TareaInsumoProyectoRepository) {
  const repositories = useRepositories();
  const [rows, setRows] = React.useState<tareaInsumoProyecto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<tareaInsumoProyecto>(createInitialProjectTaskInsumoState());

  const wait = React.useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const setField = <K extends keyof tareaInsumoProyecto>(k: K, v: tareaInsumoProyecto[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await tareaInsumoProyectoSvc.loadRelation();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tareaInsumoProyectoSvc]);

  const createAllInsumosTareaFromTemplate = async (
    e: React.FormEvent,
    templateInsumos: plantillaTareaInsumo[],
    mapPlantillaToCreado: Record<string, string>,
    mapTemplateTaskToProjectTask: Record<string, string>,
    proyectoId: string
  ) => {
    e.preventDefault();

    if (!templateInsumos?.length) {
      showWarning("No hay insumos plantillaTareaInsumo definidos");
      return { ok: false, data: [] as any[] };
    }

    setLoading(true);

    try {
      for (let i = 0; i < templateInsumos.length; i += TASK_INPUT_LINK_CREATION_CONCURRENCY) {
        const batch = templateInsumos.slice(i, i + TASK_INPUT_LINK_CREATION_CONCURRENCY);

        await Promise.all(
          batch.map(async (item) => {
            const plantillaInsumoId = String(item.id_insumo ?? "").trim();
            const templateTaskId = String(item.id_tarea_plantilla ?? "").trim();
            const idRealInsumoProyecto = mapPlantillaToCreado[plantillaInsumoId];
            const projectTaskId = mapTemplateTaskToProjectTask[templateTaskId];

            if (!idRealInsumoProyecto) {
              console.warn("No hay Id real de InsumoProyecto para este insumo de plantilla:", {
                plantillaInsumoId,
                item,
                mapPlantillaToCreado,
              });
              return;
            }

            if (!projectTaskId) {
              console.warn("No hay Id real de tarea_proyecto para esta tarea plantilla:", {
                templateTaskId,
                item,
                mapTemplateTaskToProjectTask,
              });
              return;
            }

            await tareaInsumoProyectoSvc.createRelation({
              id_insumo_proyecto: idRealInsumoProyecto,
              tipo_uso: item.tipo_insumo,
              id_tarea: projectTaskId,
              proyecto_id: proyectoId,
            });
          })
        );
      }

      return { ok: true };
    } catch (err) {
      console.error("Error creando vínculos tarea-insumo", err);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  type FaseInsumo = "Entrada" | "Salida" | "Ambas";

  const getInsumosParaSubir = async (
    proyectoId: string,
    taskId: string,
    fase: FaseInsumo = "Ambas"
  ): Promise<InsumoProyecto[]> => {
    for (let attempt = 0; attempt < INPUT_LINK_RETRY_COUNT; attempt++) {
      let relaciones =
        (await repositories.proyectoTareaInsumo?.loadRelation({
          id_tarea: Number(taskId),
          proyecto_id: Number(proyectoId),
        })) ?? [];

      if (!relaciones.length) return [];

      if (fase !== "Ambas") {
        relaciones = relaciones.filter((rel) => normalize(rel.tipo_uso) === normalize(fase));
      }

      if (relaciones.length > 0) {
        const insumoIds = relaciones
          .map((rel) => String(rel.id_insumo_proyecto ?? "").trim())
          .filter(Boolean);

        const result = (await repositories.projectInsumo?.listInsumos({ ids: insumoIds })) ?? [];
        const uniq = new Map<string, InsumoProyecto>();
        for (const item of result) {
          const id = getProjectInsumoId(item);
          if (id && !uniq.has(id)) uniq.set(id, item);
        }

        const uniqueItems = [...uniq.values()];
        if (uniqueItems.length > 0) return uniqueItems;
      }

      if (attempt < INPUT_LINK_RETRY_COUNT - 1) {
        await wait(INPUT_LINK_RETRY_DELAY_MS);
      }
    }

    return [];
  };

  return {
    rows,
    loading,
    error,
    state,
    setField,
    loadFirstPage,
    createAllInsumosTareaFromTemplate,
    getInsumosParaSubir,
  };
}
