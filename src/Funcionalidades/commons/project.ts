import type { ProjectSP } from "../../models/Projects";

export function createVoidProject(): ProjectSP{
  return {
    correo_lider: "",
    estado: "",
    fecha_inicio: "",
    fulfillment: 0,
    id_marca: "",
    id_zona: "",
    lider: "",
    nombre_proyecto: "",
    progreso: 0,
  }
}