import * as React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import { initialTaskState } from "../utils/taskForm";

/**
 * Administra el estado del formulario de tareas.
 * @returns Estado actual y helpers para modificar o reiniciar el formulario.
 */
export function useTaskForm() {
  const [state, setState] = React.useState<projectTasks>(initialTaskState);

  /**
   * Actualiza un campo específico del formulario.
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const setField = React.useCallback(
    <K extends keyof projectTasks>(key: K, value: projectTasks[K]) => {
      setState((current) => ({ ...current, [key]: value }));
    },
    []
  );

  /**
   * Reinicia el formulario al estado inicial.
   */
  const cleanState = React.useCallback(() => setState(initialTaskState), []);

  /**
   * Carga valores parciales en el formulario actual.
   * @param task - Valores a mezclar con el estado actual.
   */
  const load = React.useCallback((task: Partial<projectTasks>) => {
    setState((current) => ({ ...current, ...task }));
  }, []);

  return { state, setState, setField, cleanState, load, initialTaskState };
}
