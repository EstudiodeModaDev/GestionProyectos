import type { plantillaInsumos } from "../../models/Insumos";

export interface PlantillaInsumosRepository {
  listByProceso(proceso: string): Promise<plantillaInsumos[]>;
  create(payload: plantillaInsumos): Promise<plantillaInsumos>;
  update(id: string, payload: plantillaInsumos): Promise<plantillaInsumos>;
  inactivate(id: string): Promise<void>;
}
