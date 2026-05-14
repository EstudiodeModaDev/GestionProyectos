import type { plantillaInsumos } from "../../../models/Insumos";

export function createInitialPlantillaInsumoState(): plantillaInsumos {
  return {
    opciones_json: "[]",
    categoria: "",
    proceso: "",
    nombre_insumo: "",
    is_active: true,
    pregunta_flujo: false,
  };
}

export function buildPlantillaInsumoPayload(state: plantillaInsumos): plantillaInsumos {
  return {
    categoria: state.categoria,
    proceso: state.proceso,
    nombre_insumo: state.nombre_insumo,
    is_active: state.is_active,
    pregunta_flujo: state.pregunta_flujo,
    opciones_json: state.opciones_json,
  };
}
