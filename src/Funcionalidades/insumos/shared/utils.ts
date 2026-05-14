import type { InsumoProyecto } from "../../../models/Insumos";

export function getProjectInsumoId(insumo: Partial<InsumoProyecto> | null | undefined) {
  return String(insumo?.id ?? "").trim();
}

export function getTemplateInsumoId(insumo: Partial<InsumoProyecto> | null | undefined) {
  return String(insumo?.id_insumo ?? "").trim();
}
