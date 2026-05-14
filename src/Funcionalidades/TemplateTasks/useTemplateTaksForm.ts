import type { TemplateTasks } from "../../models/AperturaTienda";
import React from "react";

const cleanTask: TemplateTasks = {
  area_responsable: "",
  codigo: "",
  fase: "",
  tipo_tarea: "",
  dias_para_resolver: 0,
  dependencia: null,
  dias_habiles: false,
  nombre_tarea: ""
}

/**
 * Administra el formulario de tareas plantilla.
 * @returns Estado y helpers para edición del formulario.
 */
export function useTemplateForm() {
  const [state, setState] = React.useState<TemplateTasks>(cleanTask);

  /**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof TemplateTasks>(k: K, v: TemplateTasks[K]) =>
    setState((s) => ({ ...s, [k]: v }));

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
  const createPayload = (o: TemplateTasks): TemplateTasks => {
    const payload: TemplateTasks = {
      codigo: o.codigo,
      dependencia: o.dependencia,
      dias_habiles: o.dias_habiles,
      dias_para_resolver: o.dias_para_resolver,
      fase: o.fase,
      tipo_tarea: o.tipo_tarea,
      nombre_tarea: o.nombre_tarea,
      area_responsable: o.area_responsable
    };
    return payload;
  };

  return { state, setState, setField, cleanForm, createPayload };
}
