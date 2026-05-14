import type { plantillaTareaInsumo } from "../../../models/Insumos";

export function createInitialPlantillaTareaInsumoState(): plantillaTareaInsumo {
  return {
    id_insumo: "",
    id_tarea_plantilla: "",
    proceso: "",
    tipo_insumo: "",
  };
}

export function buildPlantillaTareaInsumoPayload(
  state: plantillaTareaInsumo,
  proceso: string
): plantillaTareaInsumo {
  return {
    id_insumo: state.id_insumo,
    proceso,
    tipo_insumo: state.tipo_insumo,
    id_tarea_plantilla: state.id_tarea_plantilla,
  };
}
