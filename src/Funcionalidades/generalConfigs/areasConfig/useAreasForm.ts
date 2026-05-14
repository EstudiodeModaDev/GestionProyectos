import type { areas,} from "../../../models/generalConfigs";
import React from "react";

const cleanTask: areas = {
  nombre_area: "",
}

/**
 * Administra el formulario de marcas
 * @returns Estado y helpers para edición del formulario.
 */
export function useAreasForm() {
  const [state, setState] = React.useState<areas>(cleanTask);

  /**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof areas>(k: K, v: areas[K]) => setState((s) => ({ ...s, [k]: v }));

  /**
   * Restablece el formulario al estado limpio.
   */
  const cleanForm = () => {
    setState(cleanTask);
  };

  /**
   * Construye el payload persistible a partir del estado actual.
   * @param o - Estado del formulario.
   * @returns Tarea plantilla lista para guardarse.
   */
  const createPayload = (o: areas): areas => {
    const payload: areas = {
      nombre_area: o.nombre_area,
    };
    return payload;
  };

  return { state, setState, setField, cleanForm, createPayload };
}
