import * as React from "react";
import type { ReglasFlujoTareas } from "../../models/Insumos";
import { useRepositories } from "../../repositories/repositoriesContext";
import { showError } from "../../utils/toast";

/**
 * Administra el mantenimiento de reglas de flujo de tareas.
 * @returns Estado, colección y operaciones CRUD de reglas.
 */
export function useFlowRulesSettings() {
  const repositories = useRepositories()
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
      const items = (await repositories.reglasFlujo?.loadAllRules()) ?? [];
      setReglas(items);
      return items;
    } catch (e) {
      setError(e);
      setReglas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [repositories.reglasFlujo]);

  /**
   * Crea una nueva regla de flujo.
   * @param payload - Datos de la regla a crear.
   * @returns Regla creada.
   */
  const createRule = React.useCallback(async (payload: ReglasFlujoTareas) => {
    setLoading(true);
    setError(null);
    try {
      const created = await repositories.reglasFlujo?.createRule(payload);

      if(!created) {
        showError("No se pudo crear la regla, por favor intente de nuevo");
        throw new Error("No se pudo crear la regla");
      }

      setReglas((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.reglasFlujo]);

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
      const updated = await repositories.reglasFlujo?.updateRule(id, payload) as ReglasFlujoTareas;
      console.log(updated)

      if(!updated) {
        showError("No se pudo actualizar la regla, por favor intente de nuevo");
        throw new Error("No se pudo actualizar la regla");
      }

      setReglas((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.reglasFlujo]);

  /**
   * Elimina una regla de flujo.
   * @param id - Identificador de la regla a eliminar.
   */
  const deleteRule = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await repositories.reglasFlujo?.inactivateRule(id);
      await loadRules()
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [repositories.reglasFlujo]);

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
