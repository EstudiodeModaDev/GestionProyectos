import type { ProjectSP } from "../../models/Projects";

/**
 * Propiedades requeridas para renderizar el panel de desviacion de un proyecto.
 */
export type DesviacionProps = {
  project: ProjectSP;
};

/**
 * Fila normalizada que alimenta la tabla de tareas del panel.
 */
export type TaskRowView = {
  id: string;
  tarea: string;
  area: string;
  responsable: string;
  estado: string;
  observacion: string;
  isBlocked: boolean;
};

/**
 * Variantes visuales disponibles para tarjetas y estados de desviacion.
 */
export type DesviacionTone = "danger" | "success" | "neutral";

/**
 * Estructura semantica usada para resumir el estado de una metrica.
 */
export type DesviacionStatusMeta = {
  label: string;
  detail: string;
  tone: DesviacionTone;
};

/**
 * Columnas de la tabla que admiten filtrado desde la interfaz.
 */
export type TaskColumnFilterKey = "tarea" | "area" | "responsable" | "estado";

/**
 * Conjunto de filtros activos por columna dentro de la tabla de tareas.
 */
export type TaskColumnFilters = Record<TaskColumnFilterKey, string>;
