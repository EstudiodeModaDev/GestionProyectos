import * as React from "react";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { useMarcasRepository } from "./useMarcasRepository";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import type { marcas } from "../../../models/generalConfigs";
import { useMarcasModification } from "./useMarcasModifications";


/**
 * Orquesta la gestión de marcas.
 * @param generalConfigSvc - Servicio de acceso a marcas.
 * @returns Estado, formulario y operaciones principales del módulo.
 */
export function useMarcas() {
  const repositories = useRepositories()
  const repo = useMarcasRepository(repositories.marcas!);
  const listStatus = useAsyncStatus();
  const status = useAsyncStatus();
  const [marcas, setMarcas] = React.useState<marcas[]>([]);
  const modification = useMarcasModification(repositories.marcas!);

  /**
   * Carga todas las marcas.
   */
  const loadMarcasBD = React.useCallback(async (): Promise<marcas[]> => {
    status.start();
    try {
      const marcas = await repo.loadMarcas();
      console.log("Marcas cargadas:", marcas);
      setMarcas(marcas);
      return marcas;
    } catch (e) {
      status.fail(e, "Error cargando zonas");
      return [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  /**
   * Crea una marca con los valores actuales del formulario.
   */
  const createMarcas = React.useCallback(async (value: string): Promise<void> => {
    listStatus.start();
    try {
      const payload: marcas = {
        nombre_marca: value,
        IsActive: true,
      };
      await modification.handleSubmit(payload);
      const nextMarcas = await repo.loadMarcas();
      setMarcas(nextMarcas);
    } catch (e) {
      listStatus.fail(e, "Error creando la marca, por favor intentelo de nuevo");
    } finally {
      listStatus.stop();
    }
  }, [listStatus, modification, repo]);

  return {
    marcas,
    status,
    loadMarcasBD,
    createMarcas,
    loading: listStatus.loading,
    loadError: status.error,
    error: listStatus.error,
  };
}
