import * as React from "react";
import type { responsableReglaTarea } from "../../models/responsables";
import { useRepositories } from "../../repositories/repositoriesContext";
import type { filterTemplateTaskResponsible } from "../../repositories/TemplateTaskResponsibleRepository/templateTaskResponsibleRepository";
import { showError } from "../../utils/toast";

const emptyState: responsableReglaTarea = { template_task_id: null, id_marca: null, id_zona: null };

/**
 * Administra el mantenimiento de reglas de responsables por tarea.
 * @returns Estado, formulario y operaciones CRUD de reglas.
 */
export function useResponsableReglaTareaSettings() {
  const repositories = useRepositories()
  const [reglas, setReglas] = React.useState<responsableReglaTarea[]>([]);
  const [state, setState] = React.useState<responsableReglaTarea>(emptyState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  /**
   * Actualiza un campo del formulario.
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const setField = React.useCallback(<K extends keyof responsableReglaTarea>(key: K, value: responsableReglaTarea[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Carga un elemento en el formulario para edición.
   * @param item - Regla a editar o `null` para limpiar.
   */
  const setForm = React.useCallback((item: responsableReglaTarea | null) => {
    if (!item) {
      setState(emptyState);
      return;
    }

    setState(item);
  }, []);

  /**
   * Limpia el formulario actual.
   */
  const cleanForm = React.useCallback(() => {
    setState(emptyState);
  }, []);

  /**
   * Carga todas las reglas configuradas.
   * @returns Reglas recuperadas.
   */
  const loadReglas = React.useCallback(async (filter?: filterTemplateTaskResponsible) => {
    setLoading(true);
    setError(null);
    try {
      const items = (await repositories.responsablesPlantilla?.loadResponsible(filter));
      
      setReglas(items ?? []);
      return items;
    } catch (e) {
      setError(e);
      setReglas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesPlantilla]);

  /**
   * Crea una regla nueva.
   * @param payload - Datos de la regla.
   * @returns Regla creada.
   */
  const createRegla = React.useCallback(async (payload: responsableReglaTarea): Promise<responsableReglaTarea | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await repositories.responsablesPlantilla?.createResponsible(payload);

      if(!created){
        showError("No se ha podido crear")
        return null
      }

      setReglas((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesPlantilla]);

  /**
   * Edita una regla existente.
   * @param id - Identificador de la regla.
   * @param payload - Datos actualizados.
   * @returns Regla actualizada.
   */
  const editRegla = React.useCallback(async (id: string, payload: responsableReglaTarea): Promise<responsableReglaTarea | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await repositories.responsablesPlantilla?.updateResponsible(id, payload);
      
      if(!updated){
        showError("No se ha podido actualizar")
        return null
      }

      setReglas((prev) => prev.map((item) => (String(item.id) === String(id) ? updated : item)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesPlantilla]);

  /**
   * Elimina una regla existente.
   * @param id - Identificador de la regla.
   */
  const deleteRegla = React.useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await repositories.responsablesPlantilla?.deleteResponsible(id);
      setReglas((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesPlantilla]);

  return {
    reglas,
    state,
    loading,
    error,
    setField,
    setForm,
    cleanForm,
    loadReglas,
    createRegla,
    editRegla,
    deleteRegla,
    setReglas,
  };
}
