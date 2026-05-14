import type { jefeZona } from "../../models/responsables";

export type jefeZonaFilter = {
  id_marca: string
  id_zona: string
}

export interface JefeZonaRepository {
  loadJefes(filter?: jefeZonaFilter): Promise<jefeZona[]>;
  createJefe(payload: jefeZona): Promise<jefeZona>;
  updateJefe(id: string, payload: Partial<jefeZona>): Promise<jefeZona>;
  deleteJefe(id: string): Promise<void>;
}
