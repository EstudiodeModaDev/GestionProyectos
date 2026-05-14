import React from "react";
import type { plantillaInsumos } from "../../../models/Insumos";
import type { PlantillaInsumosRepository } from "../../../repositories/plantillaInsumoRepository/PlantillaInsumosRepository";
import { buildPlantillaInsumoPayload, createInitialPlantillaInsumoState } from "./utils";

export function usePlantillaInsumos(insumosPlantillaRepo: PlantillaInsumosRepository) {
  const [insumos, setInsumos] = React.useState<plantillaInsumos[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<plantillaInsumos>(createInitialPlantillaInsumoState());

  const setField = <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const loadInsumosPlantilla = React.useCallback(async (proceso: string): Promise<plantillaInsumos[]> => {
    setLoading(true);
    setError(null);
    try {
      const items = await insumosPlantillaRepo.listByProceso(proceso);
      setInsumos(items);
      return items;
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setInsumos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [insumosPlantillaRepo]);

  const handleSubmit = React.useCallback(async (proceso: string) => {
    setLoading(true);
    setError(null);
    try {
      await insumosPlantillaRepo.create(buildPlantillaInsumoPayload(state));
      await loadInsumosPlantilla(proceso);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [insumosPlantillaRepo, loadInsumosPlantilla, state]);

  const handleEdit = React.useCallback(async (id: string, proceso: string) => {
    setLoading(true);
    setError(null);
    try {
      await insumosPlantillaRepo.update(id, buildPlantillaInsumoPayload(state));
      await loadInsumosPlantilla(proceso);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [insumosPlantillaRepo, loadInsumosPlantilla, state]);

  const deleteInsumo = React.useCallback(async (id: string, proceso: string) => {
    setLoading(true);
    setError(null);
    try {
      await insumosPlantillaRepo.inactivate(id);
      await loadInsumosPlantilla(proceso);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [insumosPlantillaRepo, loadInsumosPlantilla]);

  return {
    loading,
    error,
    state,
    insumos,
    setField,
    loadInsumosPlantilla,
    handleSubmit,
    handleEdit,
    deleteInsumo,
  };
}
