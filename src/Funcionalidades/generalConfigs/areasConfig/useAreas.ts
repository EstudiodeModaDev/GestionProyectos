import * as React from "react";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import type { areas } from "../../../models/generalConfigs";
import { useAreasModifications } from "./useAreasModifications";
import { useAreasRepository } from "./useAreasConfigRepository";


/**
 * Orquesta la gestión de areas.
 * @param generalConfigSvc - Servicio de acceso a areas.
 * @returns Estado, formulario y operaciones principales del módulo.
 */
export function useAreas() {
  const repositories = useRepositories()
  const repo = useAreasRepository(repositories.areas!);
  const listStatus = useAsyncStatus();
  const status = useAsyncStatus();
  const [areas, setAreas] = React.useState<areas[]>([]);
  const modification = useAreasModifications(repositories.areas!);

  /**
   * Carga todas las areas.
   */
  const loadAreasBD = React.useCallback(async (): Promise<areas[]> => {
    status.start();
    try {
      const areas = await repo.loadAreas();
      console.log("Areas cargadas:", areas);
      setAreas(areas);
      return areas;
    } catch (e) {
      status.fail(e, "Error cargando zonas");
      return [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  /**
   * Crea una area con los valores actuales del formulario.
   */
  const createAreas = React.useCallback(async (value: string): Promise<void> => {
    listStatus.start();
    try {
      const payload: areas = {
        nombre_area: value,
      };
      await modification.handleSubmit(payload);
      const nextAreas = await repo.loadAreas();
      setAreas(nextAreas);
    } catch (e) {
      listStatus.fail(e, "Error creando la marca, por favor intentelo de nuevo");
    } finally {
      listStatus.stop();
    }
  }, [listStatus, modification, repo]);

  return {
    areas,
    status,
    loadAreasBD,
    createAreas,
    loading: listStatus.loading,
    loadError: status.error,
    error: listStatus.error,
  };
}

