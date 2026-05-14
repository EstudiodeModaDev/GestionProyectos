import type { taskResponsible } from "../../models/AperturaTienda";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterProjectTaskResponsible, ProjectTaskResponsibleRepository, } from "./templateTaskResponsibleRepository";

export class SupabaseProjectTaskResponsibleRepository implements ProjectTaskResponsibleRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadResponsible(filter?: filterProjectTaskResponsible): Promise<taskResponsible[]> {
    return this.api.call<taskResponsible[]>("projectTaskResponsible.list", {...filter});
  }

  createResponsible(payload: taskResponsible): Promise<taskResponsible> {
    return this.api.call<taskResponsible>("projectTaskResponsible.create", {
      resource: "projectTaskResponsible",
      ...payload,
    });
  }
}
