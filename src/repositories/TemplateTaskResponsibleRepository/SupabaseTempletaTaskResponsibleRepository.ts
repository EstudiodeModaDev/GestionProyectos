import type { responsableReglaTarea } from "../../models/responsables";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterTemplateTaskResponsible, TemplateTaskResponsibleRepository } from "./templateTaskResponsibleRepository";

export class SupabaseTemplateTaskResponsibleRepository implements TemplateTaskResponsibleRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadResponsible(filter?: filterTemplateTaskResponsible): Promise<responsableReglaTarea[]> {
    return this.api.call<responsableReglaTarea[]>("templateResponsible.list", {...filter});
  }

  createResponsible(payload: responsableReglaTarea): Promise<responsableReglaTarea> {
    return this.api.call<responsableReglaTarea>("templateResponsible.create", {
      resource: "templateResponsible",
      ...payload,
    });
  }

  updateResponsible(id: string, payload: responsableReglaTarea): Promise<responsableReglaTarea> {
    return this.api.call<responsableReglaTarea>("templateResponsible.update", {
      resource: "templateResponsible",
      id: id,
      ...payload,
    });
  }

  deleteResponsible(id: number): Promise<void> {
    return this.api.call<void>("templateResponsible.delete", {
      resource: "templateResponsible",
      id: id
    })
     
  }
}
