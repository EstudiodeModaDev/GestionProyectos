import * as React from "react";
import type { jefeZona } from "../../models/responsables";
import { useAsyncStatus } from "../commons/useAsyncStatus";
import { useResponsableRulesRepository } from "./useResponsableRulesRepository";

type JefeZonaForm = {
  marcaId: string;
  zonaId: string;
  jefeNombre: string;
  jefeCorreo: string;
};

const EMPTY_FORM: JefeZonaForm = {
  marcaId: "",
  zonaId: "",
  jefeNombre: "",
  jefeCorreo: "",
};

/**
 * Orquesta la configuracion CRUD de jefes de zona reutilizando el repositorio de reglas.
 * @returns Estado del listado, formulario activo y acciones de persistencia.
 */
export function useJefesZonaSettings() {
  const repo = useResponsableRulesRepository();
  const status = useAsyncStatus();
  const mutationStatus = useAsyncStatus();
  const [items, setItems] = React.useState<jefeZona[]>([]);

  const loadJefesZona = React.useCallback(async (): Promise<jefeZona[]> => {
    status.start();
    try {
      const next = await repo.listJefesZona();
      setItems(next);
      return next;
    } catch (e) {
      status.fail(e, "Error cargando jefes de zona");
      return [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  const createJefeZona = React.useCallback(async (form: JefeZonaForm) => {
    mutationStatus.start();
    try {
      await repo.createJefeZona({
        id_marca: form.marcaId,
        id_zona: form.zonaId,
        jefe_nombre: form.jefeNombre.trim(),
        jefe_correo: form.jefeCorreo.trim(),
      });
      await loadJefesZona();
    } catch (e) {
      mutationStatus.fail(e, "Error creando jefe de zona");
      throw e;
    } finally {
      mutationStatus.stop();
    }
  }, [loadJefesZona, mutationStatus, repo]);

  const updateJefeZona = React.useCallback(async (id: string, form: JefeZonaForm) => {
    mutationStatus.start();
    try {
      await repo.updateJefeZona(id, {
        id_marca: form.marcaId,
        id_zona: form.zonaId,
        jefe_nombre: form.jefeNombre.trim(),
        jefe_correo: form.jefeCorreo.trim(),
      });
      await loadJefesZona();
    } catch (e) {
      mutationStatus.fail(e, "Error actualizando jefe de zona");
      throw e;
    } finally {
      mutationStatus.stop();
    }
  }, [loadJefesZona, mutationStatus, repo]);

  const deleteJefeZona = React.useCallback(async (id: string) => {
    mutationStatus.start();
    try {
      await repo.deleteJefeZona(id);
      await loadJefesZona();
    } catch (e) {
      mutationStatus.fail(e, "Error eliminando jefe de zona");
      throw e;
    } finally {
      mutationStatus.stop();
    }
  }, [loadJefesZona, mutationStatus, repo]);

  return {
    items,
    emptyForm: EMPTY_FORM,
    loadJefesZona,
    createJefeZona,
    updateJefeZona,
    deleteJefeZona,
    loading: status.loading,
    error: status.error,
    saving: mutationStatus.loading,
    mutationError: mutationStatus.error,
  };
}
