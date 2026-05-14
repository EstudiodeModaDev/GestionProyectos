import * as React from "react";
import type { jefeZona } from "../../models/responsables";
import { useRepositories } from "../../repositories/repositoriesContext";
import { useGraphServices } from "../../graph/graphContext";

/**
 * Provee consultas base para resolver responsables por reglas.
 * @returns Operaciones de lectura sobre reglas, detalles y jefes de zona.
 */
export function useResponsableRulesRepository() {
  const repositories = useRepositories()
  const graph = useGraphServices()

  /**
   * Obtiene las reglas aplicables para una combinación de marca y tarea.
   * @param marca - Id de Marca asociada al proyecto.
   * @param tarea - Id de la tarea.
   * @returns Reglas encontradas.
   */
  const getReglas = React.useCallback(async (marca: number, tarea: number) => {
    if (!marca || !tarea) return [];
    return await repositories.responsablesPlantilla?.loadResponsible({id_marca: marca, template_task_id: tarea}) 
    
  }, [repositories]);

  /**
   * Obtiene los detalles configurados para una regla.
   * @param reglaId - Identificador de la regla.
   * @returns Detalles asociados a la regla.
   */
  const getDetalles = React.useCallback(async (reglaId: string) => {
    if (!reglaId) return [];
    return (await repositories.responsablesDetalles?.loadDetail({ reglaId: Number(reglaId) }));
  }, [repositories.responsablesDetalles]);

  /**
   * Obtiene el jefe de zona para una marca y zona específicas.
   * @param marca - Marca asociada al proyecto.
   * @param zona - Zona del proyecto.
   * @returns Lista de jefes de zona encontrados o `null`.
   */
  const getJefeZona = React.useCallback(async (marca: string, zona: string): Promise<jefeZona[] | null> => {
    if (!marca || !zona) return null;
    console.log(`Buscando jefe de zona para marca '${marca}' y zona '${zona}'`);
    const jefes = (await repositories.jefeZona?.loadJefes({id_marca: marca, id_zona: zona}));
    console.log(jefes);
    return jefes ?? null;
  }, [graph]);

  /**
   * Lista todas las configuraciones de jefes de zona.
   * @returns Coleccion completa de jefes registrados.
   */
  const listJefesZona = React.useCallback(async (): Promise<jefeZona[]> => {
    const jefes = await repositories.jefeZona?.loadJefes() ?? []
    return jefes;
  }, [graph]);

  /**
   * Crea una configuracion de jefe de zona.
   * @param payload - Datos a persistir.
   * @returns Registro creado.
   */
  const createJefeZona = React.useCallback(async (payload: jefeZona): Promise<{ok: boolean, errorMessage: string | null, created: jefeZona | null}> => {
    try{
      const createdJefe = await repositories.jefeZona?.createJefe(payload);
      if(!createdJefe){
        return{
          created: null,
          errorMessage: "No se ha podido crear el jefe de zona",
          ok: false
        }
      }

      return {
        created: createdJefe,
        errorMessage: null,
        ok: true
      }
    } catch(e){
      return{
        created: null,
        errorMessage: "No se ha podido crear el jefe de zona" + e,
        ok: false
      }
    }
  }, [graph]);

  /**
   * Actualiza una configuracion existente de jefe de zona.
   * @param id - Identificador del registro.
   * @param payload - Campos modificados.
   * @returns Registro actualizado.
   */
  const updateJefeZona = React.useCallback(async (id: string, payload: Partial<jefeZona>): Promise<{ok: boolean, errorMessage: string | null, created: jefeZona | null}> => {
    try{
      const createdJefe = await repositories.jefeZona?.updateJefe(id, payload);
      if(!createdJefe){
        return{
          created: null,
          errorMessage: "No se ha podido editar el jefe de zona",
          ok: false
        }
      }

      return {
        created: createdJefe,
        errorMessage: null,
        ok: true
      }
    } catch(e){
      return{
        created: null,
        errorMessage: "No se ha podido editar el jefe de zona" + e,
        ok: false
      }
    }
  
  }, [graph]);

  /**
   * Elimina una configuracion de jefe de zona.
   * @param id - Identificador del registro.
   */
  const deleteJefeZona = React.useCallback(async (id: string): Promise<{ok: boolean, messageError: string | null}> => {
    try{
      await repositories.jefeZona?.deleteJefe(id);
      return{
        ok: true,
        messageError: null
      } 
    } catch(e){
      return{
        messageError: "Algo ha salido mal, no se ha podido borrar el jefe de zona",
        ok: false
      }
    }
    
  }, [graph]);

  return { getReglas, getDetalles, getJefeZona, listJefesZona, createJefeZona, updateJefeZona, deleteJefeZona };
}
