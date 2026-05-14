import type { plantillaTareaInsumo } from "../../models/Insumos";

export type templateTaskInsumoFilter = {
  id_tarea_plantilla?: string;
  id_insumo?: string;
  tipo_insumo?: string;
  proceso?: string
}

export interface templateTaskInsumoRepository {
  loadTempateTaskInsumo(filter?: templateTaskInsumoFilter): Promise<plantillaTareaInsumo[]>;
  createRelation(payload: plantillaTareaInsumo): Promise<plantillaTareaInsumo>;
  deleteRelation(id: string): Promise<void>;
}
