import type { ReglasFlujoTareas } from "../../models/Insumos";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { RulesFlujoRepository } from "./templateTaskRepository";

export class SupabaseReglasFlujoRepository implements RulesFlujoRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadAllRules(): Promise<ReglasFlujoTareas[]> {
    return this.api.call<ReglasFlujoTareas[]>("flowRule.list", {});
  }

  loadFilterRules(filters: any): Promise<ReglasFlujoTareas[]> {
    return this.api.call<ReglasFlujoTareas[]>("flowRule.list", filters);
  }

  createRule(payload: ReglasFlujoTareas): Promise<ReglasFlujoTareas> {
    return this.api.call<ReglasFlujoTareas>("flowRule.create", {
      resource: "flowRule",
      ...payload,
    });
  }

  updateRule(id: string, payload: ReglasFlujoTareas): Promise<ReglasFlujoTareas> {
    return this.api.call<ReglasFlujoTareas>("flowRule.update", {
      resource: "flowRule",
      id: id,
      ...payload,
    });
  }

  async inactivateRule(id: string): Promise<void> {
    return this.api.call<void>("flowRule.inactivate", {
      resource: "flowRule",
      id: id,
      is_active: false ,
    });
  }
}
