import type { taskResponsible } from "../../models/AperturaTienda";

export type filterProjectTaskResponsible = {
  tarea_id?: number;
  correo?: string;
  tarea_ids?: number[] | string[];
}

export interface ProjectTaskResponsibleRepository {
  loadResponsible(filter?: filterProjectTaskResponsible): Promise<taskResponsible[]>;
  createResponsible(payload: taskResponsible): Promise<taskResponsible>;
}
