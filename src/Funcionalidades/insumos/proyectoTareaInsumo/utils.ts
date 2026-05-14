import type { tareaInsumoProyecto } from "../../../models/Insumos";

export function createInitialProjectTaskInsumoState(): tareaInsumoProyecto {
  return {
    id_insumo_proyecto: "",
    id_tarea: "",
    proyecto_id: "",
    tipo_uso: "",
  };
}
