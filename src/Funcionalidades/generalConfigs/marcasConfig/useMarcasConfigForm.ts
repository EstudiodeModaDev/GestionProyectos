import type { marcas, } from "../../../models/generalConfigs";
import React from "react";

const cleanTask: marcas = {
  IsActive: true,
  nombre_marca: "",
}

/**
 * Administra el formulario de marcas
 * @returns Estado y helpers para edición del formulario.
 */
export function useMarcasForm() {
  const [state, setState] = React.useState<marcas>(cleanTask);

  /**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof marcas>(k: K, v: marcas[K]) => setState((s) => ({ ...s, [k]: v }));

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
  const createPayload = (o: marcas): marcas => {
    const payload: marcas = {
      IsActive: o.IsActive,
      nombre_marca: o.nombre_marca,
    };
    return payload;
  };

  return { state, setState, setField, cleanForm, createPayload };
}
