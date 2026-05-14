import type { InsumoProyecto, plantillaInsumos } from "../../../models/Insumos";

export function createInitialProjectInsumoState(): InsumoProyecto {
  return {
    id_proyecto: "",
    id_insumo: "",
    file_name: null,
    file_path: null,
    mime_type: null,
    texto: null,
  };
}

export function buildCreateProjectInsumoPayload(
  plantilla: plantillaInsumos,
  proyectoId: string
): InsumoProyecto {
  return {
    id_proyecto: proyectoId,
    id_insumo: String(plantilla.id ?? ""),
    file_name: null,
    file_path: null,
    mime_type: null,
    texto: null,
  };
}
