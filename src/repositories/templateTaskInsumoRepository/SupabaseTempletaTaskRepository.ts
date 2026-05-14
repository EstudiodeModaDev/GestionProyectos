import type { plantillaTareaInsumo } from "../../models/Insumos";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { templateTaskInsumoFilter, templateTaskInsumoRepository } from "./templateTaskInsumoRepository";

export class SupabaseTemplateTaskInsumoRepository implements templateTaskInsumoRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadTempateTaskInsumo(filter?: templateTaskInsumoFilter): Promise<plantillaTareaInsumo[]> {
    return this.api.call<plantillaTareaInsumo[]>("TemplateTaskInsumos.list", { ...(filter ?? {}) });
  }

  createRelation(payload: plantillaTareaInsumo): Promise<plantillaTareaInsumo> {
    return this.api.call<plantillaTareaInsumo>("TemplateTaskInsumos.create", {
      resource: "TemplateTaskInsumos",
      ...payload,
    });
  }

  deleteRelation(id: string): Promise<void> {
    return this.api.call<void>("TemplateTaskInsumos.delete", {
      resource: "TemplateTaskInsumos",
      id: id
    })
  }
}
