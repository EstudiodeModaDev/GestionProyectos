import type { zonas } from "../../../models/generalConfigs";
import React from "react";

const cleanTask: zonas = {
  IsActive: true,
  zonas: "",
}

/**
 * Administra el formulario de zonas
 * @returns Estado y helpers para edición del formulario.
 */
export function useZonasForm() {
  const [state, setState] = React.useState<zonas>(cleanTask);

  /**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof zonas>(k: K, v: zonas[K]) => setState((s) => ({ ...s, [k]: v }));

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
  const createPayload = (o: zonas): zonas => {
    const payload: zonas = {
      IsActive: o.IsActive,
      zonas: o.zonas,
    };
    return payload;
  };

  return { state, setState, setField, cleanForm, createPayload };
}
