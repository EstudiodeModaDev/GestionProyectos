import { normalize } from "../../../utils/commons";

/**
 * Indica si un estado representa una tarea completada.
 * @param estado - Estado textual de la tarea.
 * @returns `true` cuando el estado sugiere finalización.
 */
export const isCompletedTask = (estado?: string | null) => normalize(estado).includes("comple");

/**
 * Indica si un estado representa una tarea bloqueada.
 * @param estado - Estado textual de la tarea.
 * @returns `true` cuando la tarea está bloqueada.
 */
export const isBlockedTask = (estado?: string | null) => {
  const value = normalize(estado);
  return value === "bloqueada" || value === "bloqueado" || value === "userblocked";
};
