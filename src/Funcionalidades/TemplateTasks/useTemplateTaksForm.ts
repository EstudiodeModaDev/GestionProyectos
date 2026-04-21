import type { TemplateTasks } from "../../models/AperturaTienda";
import React from "react";

const cleanTask = {
  Codigo: "",
  CorreoResponsable: "",
  Dependencia: "",
  Diaspararesolver: 0,
  diasHabiles: true,
  Phase: "",
  Responsable: "",
  TipoTarea: "",
  Title: "",
  AreaResponsable: ""
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
      Codigo: o.Codigo,
      Dependencia: o.Dependencia,
      diasHabiles: o.diasHabiles,
      Diaspararesolver: o.Diaspararesolver,
      Phase: o.Phase,
      TipoTarea: o.TipoTarea,
      Title: o.Title,
      AreaResponsable: o.AreaResponsable
    };
    return payload;
  };

  return { state, setState, setField, cleanForm, createPayload };
}
