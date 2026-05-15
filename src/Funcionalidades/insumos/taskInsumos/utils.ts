import type { InsumoProyecto, plantillaInsumos, tareaInsumoProyecto } from "../../../models/Insumos";
import type { TaskInsumoView } from "../shared/types";
import { getProjectInsumoId, getTemplateInsumoId } from "../shared/utils";

function parseInsumoOptions(opcionesJson: string | undefined): string[] {
  try {
    const parsed = JSON.parse(opcionesJson ?? "[]");

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }

    if (parsed && Array.isArray(parsed.options)) {
      return parsed.options.map((item: unknown) => String(item).trim()).filter(Boolean);
    }
  } catch {
    return [];
  }

  return [];
}

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
    fileName: insumo.file_name ?? undefined,
    fase,
    options: parseInsumoOptions(plantilla?.opciones_json),
  };
}
