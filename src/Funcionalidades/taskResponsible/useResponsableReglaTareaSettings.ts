import * as React from "react";
import type { responsableReglaTarea } from "../../models/responsables";
import { useGraphServices } from "../../graph/graphContext";

const emptyState: responsableReglaTarea = { Title: "", Marca: "", Ciudad: "" };

/**
 * Administra el mantenimiento de reglas de responsables por tarea.
 * @returns Estado, formulario y operaciones CRUD de reglas.
 */
export function useResponsableReglaTareaSettings() {
  const graph = useGraphServices();
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

    setState({ Title: item.Title ?? "", Marca: item.Marca ?? "", Ciudad: item.Ciudad ?? "", Id: item.Id });
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
  const loadReglas = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = (await graph.responsableRegla.getAll({ top: 5000 })).items;
      setReglas(items);
      return items;
    } catch (e) {
      setError(e);
      setReglas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [graph.responsableRegla]);

  /**
   * Crea una regla nueva.
   * @param payload - Datos de la regla.
   * @returns Regla creada.
   */
  const createRegla = React.useCallback(async (payload: responsableReglaTarea): Promise<responsableReglaTarea | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await graph.responsableRegla.create(payload);
      setReglas((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableRegla]);

  /**
   * Edita una regla existente.
   * @param id - Identificador de la regla.
   * @param payload - Datos actualizados.
   * @returns Regla actualizada.
   */
  const editRegla = React.useCallback(async (id: string, payload: responsableReglaTarea) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await graph.responsableRegla.update(id, payload);
      setReglas((prev) => prev.map((item) => (String(item.Id) === String(id) ? updated : item)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableRegla]);

  /**
   * Elimina una regla existente.
   * @param id - Identificador de la regla.
   */
  const deleteRegla = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await graph.responsableRegla.delete(id);
      setReglas((prev) => prev.filter((item) => String(item.Id) !== String(id)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableRegla]);

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
