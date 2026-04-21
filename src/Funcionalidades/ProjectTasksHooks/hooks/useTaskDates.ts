import type { Holiday } from "festivos-colombianos";
import { calcularFechaTareaBase } from "../utils/taskDates";

/**
 * Expone utilidades para calcular fechas de tareas dentro del flujo.
 * @returns Funciones de cálculo de fechas.
 */
export function useTaskDates() {
  /**
   * Calcula la fecha objetivo de una tarea.
   * @param diasParaResolver - Cantidad de días a sumar.
   * @param fechaInicio - Fecha base del cálculo.
   * @param holidays - Festivos aplicables al cálculo.
   * @param diasHabiles - Indica si el cálculo debe hacerse por días hábiles.
   * @returns Fecha objetivo calculada.
   */
  const calcularFechaTarea = (
    diasParaResolver: number | string,
    fechaInicio: Date,
    holidays: Holiday[],
    diasHabiles: boolean
  ) => calcularFechaTareaBase(diasParaResolver, fechaInicio, holidays, diasHabiles);

  return { calcularFechaTarea };
}
