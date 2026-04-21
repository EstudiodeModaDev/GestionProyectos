import * as React from "react";
import type { ReglasFlujoTareas } from "../../models/Insumos";
import { useGraphServices } from "../../graph/graphContext";

/**
 * Administra el mantenimiento de reglas de flujo de tareas.
 * @returns Estado, colección y operaciones CRUD de reglas.
 */
export function useFlowRulesSettings() {
  const graph = useGraphServices();
  const [reglas, setReglas] = React.useState<ReglasFlujoTareas[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  /**
   * Carga todas las reglas disponibles.
   * @returns Reglas recuperadas desde SharePoint.
   */
  const loadRules = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = (await graph.reglasFlujo.getAll({ top: 5000 })).items;
      setReglas(items);
      return items;
    } catch (e) {
      setError(e);
      setReglas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [graph.reglasFlujo]);

  /**
   * Crea una nueva regla de flujo.
   * @param payload - Datos de la regla a crear.
   * @returns Regla creada.
   */
  const createRule = React.useCallback(async (payload: ReglasFlujoTareas) => {
    setLoading(true);
    setError(null);
    try {
      const created = await graph.reglasFlujo.create(payload);
      setReglas((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.reglasFlujo]);

  /**
   * Actualiza una regla existente.
   * @param id - Identificador de la regla.
   * @param payload - Datos actualizados.
   * @returns Regla actualizada.
   */
  const editRule = React.useCallback(async (id: string, payload: ReglasFlujoTareas) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await graph.reglasFlujo.update(id, payload);
      setReglas((prev) => prev.map((r) => (String(r.Id) === String(id) ? updated : r)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.reglasFlujo]);

  /**
   * Elimina una regla de flujo.
   * @param id - Identificador de la regla a eliminar.
   */
  const deleteRule = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await graph.reglasFlujo.delete(id);
      setReglas((prev) => prev.filter((r) => String(r.Id) !== String(id)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [graph.reglasFlujo]);

  return {
    reglas,
    loading,
    error,
    loadRules,
    createRule,
    editRule,
    deleteRule,
  };
}
