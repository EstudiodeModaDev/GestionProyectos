import type { InsumoProyecto, plantillaInsumos, tareaInsumoProyecto } from "../../../models/Insumos";
import type { TaskInsumoView } from "../shared/types";
import { getProjectInsumoId, getTemplateInsumoId } from "../shared/utils";

export function buildTaskInsumoView(
  link: tareaInsumoProyecto,
  insumo: InsumoProyecto,
  plantilla: plantillaInsumos | undefined
): TaskInsumoView {
  const texto = insumo.texto ?? "";
  const fase = (link.tipo_uso as "Entrada" | "Salida") || "Entrada";

  return {
    id: getProjectInsumoId(insumo) || link.id_insumo_proyecto,
    title: plantilla?.nombre_insumo || `Insumo ${getTemplateInsumoId(insumo)}`,
    tipo: plantilla?.categoria || "Texto",
    texto,
    estado: texto || insumo.file_path ? "Subido" : "Pendiente",
    fase,
  };
}
