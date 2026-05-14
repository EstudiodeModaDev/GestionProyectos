import type { tareaInsumoProyecto } from "../../models/Insumos";

export type filterTareaInsumoProyecto = {
  id_tarea?: number;
  id?: number;
  proyecto_id?: number;
  tipo_uso?: string;
}

export interface TareaInsumoProyectoRepository {
  loadRelation(filter?: filterTareaInsumoProyecto): Promise<tareaInsumoProyecto[]>;
  createRelation(payload: tareaInsumoProyecto): Promise<tareaInsumoProyecto>;
  updateRelation(id: string, payload: tareaInsumoProyecto): Promise<tareaInsumoProyecto>;
}
