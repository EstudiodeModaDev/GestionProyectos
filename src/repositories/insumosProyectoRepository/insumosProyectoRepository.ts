import type { InsumoProyecto,} from "../../models/Insumos";

export type insumosProyectosFilter = {
  id_proyecto?: string;
  id_insumo?: string;
  id?: string
  ids?: string[] | number[]
}

export interface InsumosProyectosRepository {
  listInsumos(filter?: insumosProyectosFilter): Promise<InsumoProyecto[]>;
  createInsumoProyecto(payload: InsumoProyecto): Promise<InsumoProyecto>;
  updateInsumoProyecto(id: string, payload: Partial<InsumoProyecto>): Promise<InsumoProyecto>
}
