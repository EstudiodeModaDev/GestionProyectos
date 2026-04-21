import { toGraphDateTime } from "../../../utils/Date";
import type { ProjectSP } from "../../../models/Projects";
import type { AccountInfo } from "@azure/msal-browser";

/**
 * Crea el estado inicial del formulario de proyectos.
 * @param account - Cuenta autenticada actual.
 * @returns Estado base del formulario con valores por defecto.
 */
export function createInitialProjectState(account: AccountInfo | null): ProjectSP {
  return {
    Descripcion: "",
    Estado: "",
    Title: "",
    CorreoLider: account?.username ?? "",
    Fechadelanzamiento: "",
    FechaInicio: toGraphDateTime(new Date()) ?? "",
    fulfillment: 0,
    Lider: account?.name ?? "",
    Progreso: "0",
    Marca: "",
    Zona: "",
  };
}

/**
 * Construye el payload de creación de un proyecto a partir del estado del formulario.
 * @param state - Estado actual del formulario.
 * @returns Proyecto listo para persistirse en SharePoint.
 */
export function buildProjectCreatePayload(state: ProjectSP): ProjectSP {
  return {
    Descripcion: state.Descripcion ?? "",
    Estado: "En curso",
    Title: state.Title,
    CorreoLider: state.CorreoLider,
    Fechadelanzamiento: toGraphDateTime(state.Fechadelanzamiento) ?? "",
    FechaInicio: toGraphDateTime(state.FechaInicio) ?? "",
    fulfillment: 0,
    Lider: state.Lider,
    Progreso: "0",
    Marca: state.Marca,
    Zona: state.Zona,
  };
}
