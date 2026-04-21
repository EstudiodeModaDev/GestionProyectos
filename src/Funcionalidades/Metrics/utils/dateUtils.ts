import type { projectTasks } from "../../../models/AperturaTienda";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Normaliza una fecha al inicio del día.
 * @param value - Fecha en formato string.
 * @returns Fecha normalizada o `null` si no es válida.
 */
export const toDay = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Calcula la desviación entre la fecha planificada y la fecha real de una tarea.
 * @param task - Tarea a evaluar.
 * @returns Diferencia en días o `null` si faltan fechas válidas.
 */
export const getDeviationInDays = (task: projectTasks): number | null => {
  const planned = toDay(task.FechaResolucion);
  if (!planned) return null;

  const actual = toDay(task.FechaCierre) ?? toDay(new Date().toISOString());
  if (!actual) return null;

  return Math.round((actual.getTime() - planned.getTime()) / MS_PER_DAY);
};
