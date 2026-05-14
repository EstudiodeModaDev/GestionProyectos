import type { responsableReglaTarea } from "../../models/responsables";

export type filterTemplateTaskResponsible = {
  template_task_id?: number;
  id_marca?: number;
  id_zona?: number;
}

export interface TemplateTaskResponsibleRepository {
  loadResponsible(filter?: filterTemplateTaskResponsible): Promise<responsableReglaTarea[]>;
  createResponsible(payload: responsableReglaTarea): Promise<responsableReglaTarea>;
  updateResponsible(id: string, payload: responsableReglaTarea): Promise<responsableReglaTarea>;
  deleteResponsible(id: number): Promise<void>;
}
