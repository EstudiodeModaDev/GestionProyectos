import * as React from "react";
import type { responsableReglaTareaDetalle } from "../../models/responsables";
import { useGraphServices } from "../../graph/graphContext";

const emptyState: responsableReglaTareaDetalle = {
  Title: "",
  reglaId: 0,
  Nombre: "",
  Correo: "",
};

/**
 * Administra el mantenimiento de detalles asociados a una regla de responsables.
 * @returns Estado, formulario y operaciones CRUD de detalles.
 */
export function useResponsableReglaTareaDetalleSettings() {
  const graph = useGraphServices();
  const [detalles, setDetalles] = React.useState<responsableReglaTareaDetalle[]>([]);
  const [state, setState] = React.useState<responsableReglaTareaDetalle>(emptyState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  /**
   * Actualiza un campo del formulario.
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const setField = React.useCallback(<K extends keyof responsableReglaTareaDetalle>(key: K, value: responsableReglaTareaDetalle[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Carga un detalle en el formulario para edición.
   * @param item - Detalle a cargar o `null` para limpiar.
   */
  const setForm = React.useCallback((item: responsableReglaTareaDetalle | null) => {
    if (!item) {
      setState(emptyState);
      return;
    }

    setState({
      Title: item.Title ?? "",
      reglaId: item.reglaId ?? "",
      Nombre: item.Nombre ?? "",
      Correo: item.Correo ?? "",
      Id: item.Id,
    });
  }, []);

  /**
   * Limpia el formulario actual.
   */
  const cleanForm = React.useCallback(() => {
    setState(emptyState);
  }, []);

  /**
   * Carga los detalles de una regla específica o todos si no se indica una.
   * @param reglaId - Identificador opcional de la regla.
   * @returns Detalles recuperados.
   */
  const loadDetalles = React.useCallback(async (reglaId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let filter = "";

      if (reglaId) {
        filter = `fields/reglaId eq ${Number(reglaId)}`;
      }

      const items = await graph.responsableReglaDetalle.getAll({ filter, top: 5000 });

      setDetalles(items);
      return items;
    } catch (e) {
      setError(e);
      setDetalles([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [graph.responsableReglaDetalle]);

  /**
   * Crea un nuevo detalle para una regla.
   * @param reglaId - Identificador de la regla padre.
   * @param payload - Datos del detalle.
   * @returns Detalle creado.
   */
  const createDetalle = React.useCallback(async (reglaId: string, payload: responsableReglaTareaDetalle) => {
    setLoading(true);
    setError(null);
    try {
      const created = await graph.responsableReglaDetalle.create({
        ...payload,
        reglaId: Number(reglaId),
      });

      setDetalles((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableReglaDetalle]);

  /**
   * Edita un detalle existente.
   * @param id - Identificador del detalle.
   * @param payload - Datos actualizados.
   * @returns Detalle actualizado.
   */
  const editDetalle = React.useCallback(async (id: string, payload: responsableReglaTareaDetalle) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await graph.responsableReglaDetalle.update(id, payload);
      setDetalles((prev) => prev.map((item) => (String(item.Id) === String(id) ? updated : item)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableReglaDetalle]);

  /**
   * Elimina un detalle existente.
   * @param id - Identificador del detalle.
   */
  const deleteDetalle = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await graph.responsableReglaDetalle.delete(id);
      setDetalles((prev) => prev.filter((item) => String(item.Id) !== String(id)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.responsableReglaDetalle]);

  return {
    detalles,
    state,
    loading,
    error,
    setField,
    setForm,
    cleanForm,
    loadDetalles,
    createDetalle,
    editDetalle,
    deleteDetalle,
    setDetalles,
  };
}
