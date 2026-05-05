import * as React from "react";

import { useGraphServices } from "../../graph/graphContext";
import type { jefeZona } from "../../models/responsables";

/**
 * Provee consultas base para resolver responsables por reglas.
 * @returns Operaciones de lectura sobre reglas, detalles y jefes de zona.
 */
export function useResponsableRulesRepository() {
  const graph = useGraphServices();

  /**
   * Obtiene las reglas aplicables para una combinación de marca y tarea.
   * @param marca - Marca asociada al proyecto.
   * @param codigoTarea - Código de la tarea.
   * @returns Reglas encontradas.
   */
  const getReglas = React.useCallback(async (marca: string, codigoTarea: string) => {
    if (!marca || !codigoTarea) return [];
    return (await graph.responsableRegla.getAll({
      filter: `fields/Marca eq '${marca}' and  fields/Title eq '${codigoTarea}'`
    })).items;
  }, [graph]);

  /**
   * Obtiene los detalles configurados para una regla.
   * @param reglaId - Identificador de la regla.
   * @returns Detalles asociados a la regla.
   */
  const getDetalles = React.useCallback(async (reglaId: string) => {
    if (!reglaId) return [];
    return (await graph.responsableReglaDetalle.getAll({ filter: `fields/Title eq '${reglaId}'` })).items;
  }, [graph]);

  /**
   * Obtiene el jefe de zona para una marca y zona específicas.
   * @param marca - Marca asociada al proyecto.
   * @param zona - Zona del proyecto.
   * @returns Lista de jefes de zona encontrados o `null`.
   */
  const getJefeZona = React.useCallback(async (marca: string, zona: string): Promise<jefeZona[] | null> => {
    if (!marca || !zona) return null;
    console.log(`Buscando jefe de zona para marca '${marca}' y zona '${zona}'`);
    const jefes = (await graph.jefeZona.getAll({
      filter: `fields/Title eq '${marca}' and fields/Zona eq '${zona}'`
    })).items;
    console.log(jefes);
    return jefes;
  }, [graph]);

  return { getReglas, getDetalles, getJefeZona };
}
