import { toSupabaseDate } from "../../../utils/Date";
import type { ProjectSP } from "../../../models/Projects";
import type { AccountInfo } from "@azure/msal-browser";

/**
 * Crea el estado inicial del formulario de proyectos.
 * @param account - Cuenta autenticada actual.
 * @returns Estado base del formulario con valores por defecto.
 */
export function createInitialProjectState(account: AccountInfo | null): ProjectSP {
  return {
    correo_lider: account?.username ?? "",
    estado: "",
    fecha_inicio: "",
    fulfillment: 0,
    id_marca: "",
    id_zona: "",
    lider: account?.name ?? "",
    nombre_proyecto: "",
    progreso: 0,
  };
}

/**
 * Construye el payload de creación de un proyecto a partir del estado del formulario.
 * @param state - Estado actual del formulario.
 * @returns Proyecto listo para persistirse en SharePoint.
 */
export function buildProjectCreatePayload(state: ProjectSP): ProjectSP {
  return {
    estado: "En curso",
    nombre_proyecto: state.nombre_proyecto,
    correo_lider: state.correo_lider,
    fecha_inicio: toSupabaseDate(new Date(state.fecha_inicio)) ?? "",
    fulfillment: 0,
    lider: state.lider,
    progreso: 0,
    id_marca: state.id_marca,
    id_zona: state.id_zona,
  };
}

