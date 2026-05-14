import React from "react";
import type { plantillaTareaInsumo } from "../../../models/Insumos";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { createInitialPlantillaTareaInsumoState } from "./utils";

export function useTareaPlantillaInsumo() {
  const repositories = useRepositories();
  const [insumos, setInsumos] = React.useState<plantillaTareaInsumo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<plantillaTareaInsumo>(createInitialPlantillaTareaInsumoState());

  const setField = <K extends keyof plantillaTareaInsumo>(k: K, v: plantillaTareaInsumo[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const loadTareaInsumosPlantilla = React.useCallback(async (proceso: string): Promise<plantillaTareaInsumo[]> => {
    setLoading(true);
    setError(null);
    try {
      const items = await repositories.plantillaTareaInsumo?.loadTempateTaskInsumo({ proceso });
      setInsumos(items ?? []);
      return items ?? [];
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setInsumos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [repositories.plantillaTareaInsumo]);

  const handleSubmit = React.useCallback(
    async (
      proceso: string,
      idTareaPlantilla: string,
      idInsumo: string,
      tipoInsumo: "Entrada" | "Salida"
    ) => {
      setLoading(true);
      setError(null);
      try {
        await repositories.plantillaTareaInsumo?.createRelation({
          proceso,
          id_tarea_plantilla: String(idTareaPlantilla ?? "").trim(),
          id_insumo: String(idInsumo ?? "").trim(),
          tipo_insumo: String(tipoInsumo ?? "").trim(),
        });
        await loadTareaInsumosPlantilla(proceso);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [loadTareaInsumosPlantilla, repositories.plantillaTareaInsumo]
  );

  const deleteLink = React.useCallback(async (id: string, proceso: string) => {
    setLoading(true);
    setError(null);
    try {
      await repositories.plantillaTareaInsumo?.deleteRelation(id);
      await loadTareaInsumosPlantilla(proceso);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [loadTareaInsumosPlantilla, repositories.plantillaTareaInsumo]);

  return {
    loading,
    error,
    state,
    insumos,
    setField,
    loadTareaInsumosPlantilla,
    handleSubmit,
    deleteLink,
  };
}
