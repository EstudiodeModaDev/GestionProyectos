import * as React from "react";
import type { responsableReglaTareaDetalle } from "../../models/responsables";
import { useRepositories } from "../../repositories/repositoriesContext";
import type { filterResponsibleDetail } from "../../repositories/ResponsibleDetailReposiitory/responsibleDetailRespository";

const emptyState: responsableReglaTareaDetalle = {
  regla_id: "",
  nombre: "",
  correo: "",
};

/**
 * Administra el mantenimiento de detalles asociados a una regla de responsables.
 * @returns Estado, formulario y operaciones CRUD de detalles.
 */
export function useResponsableReglaTareaDetalleSettings() {
  const repositories = useRepositories();
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
      regla_id: item.regla_id ?? "",
      nombre: item.nombre ?? "",
      correo: item.correo ?? "",
      id: item.id,
    });
  }, []);

  /**
   * Limpia el formulario actual.
   */
  const cleanForm = React.useCallback(() => {
    setState(emptyState);
  }, []);

  /**
   * Carga los detalles de una regla específica.
   * @param reglaId - Identificador de la regla.
   * @returns Detalles recuperados.
   */
  const loadDetalles = React.useCallback(async (filter?: filterResponsibleDetail) => {
    if (!filter?.reglaId) {
      setDetalles([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const items = (await repositories.responsablesDetalles?.loadDetail(filter)) ?? [];

      setDetalles(items);
      return items;
    } catch (e) {
      setError(e);
      setDetalles([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesDetalles]);

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
      const created = await repositories.responsablesDetalles?.createDetail({
        ...payload,
        regla_id: reglaId,
      });

      if (!created) {
        throw new Error("No fue posible crear el detalle.");
      }

      setDetalles((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesDetalles]);

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
      const updated = await repositories.responsablesDetalles?.updateDetail(id, payload);
      if (!updated) {
        throw new Error("No fue posible actualizar el detalle.");
      }
      setDetalles((prev) => prev.map((item) => (String(item.id) === String(id) ? updated : item)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesDetalles]);

  /**
   * Elimina un detalle existente.
   * @param id - Identificador del detalle.
   */
  const deleteDetalle = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await repositories.responsablesDetalles?.deleteDetail(Number(id));
      setDetalles((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.responsablesDetalles]);

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
