import * as React from "react";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import type { zonas } from "../../../models/generalConfigs";
import { useZonasModification } from "./useZonasModifications";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { useZonasRepository } from "./useZonasRepository";


/**
 * Orquesta la gestión de zonas.
 * @param generalConfigSvc - Servicio de acceso a zonas.
 * @returns Estado, formulario y operaciones principales del módulo.
 */
export function useZonas() {
  const repositories = useRepositories()
  const repo = useZonasRepository(repositories.zonas!);
  const listStatus = useAsyncStatus();
  const status = useAsyncStatus();
  const [zones, setZones] = React.useState<zonas[]>([]);
  const modification = useZonasModification(repositories.zonas!);

  /**
   * Carga todas las zonas.
   */
  const loadZones = React.useCallback(async (): Promise<zonas[]> => {
    status.start();
    try {
      const zones = await repo.loadZonas();
      console.log("Zonas cargadas:", zones);
      setZones(zones);
      return zones;
    } catch (e) {
      status.fail(e, "Error cargando zonas");
      return [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  /**
   * Crea una zona con los valores actuales del formulario.
   */
  const createZones = React.useCallback(async (value: string): Promise<void> => {
    listStatus.start();
    try {
      const payload: zonas = {
        zonas: value,
        IsActive: true,
      };
      await modification.handleSubmit(payload);
      const nextZones = await repo.loadZonas();
      setZones(nextZones);
    } catch (e) {
      listStatus.fail(e, "Error creando la zona, por favor intentelo de nuevo");
    } finally {
      listStatus.stop();
    }
  }, [listStatus, modification, repo]);

  return {
    zones,
    status,
    loadZones,
    createZones,
    ...repo,
    loading: listStatus.loading,
    loadError: status.error,
    error: listStatus.error,
  };
}


