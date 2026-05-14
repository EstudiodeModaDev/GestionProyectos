import type { areas } from "../../../models/generalConfigs";
import type { SupabaseApiService } from "../../../services/supabase.service";

import type { GeneralConfigRepository } from "../generalConfigReposity";

export class SupabaseAreasRepository implements GeneralConfigRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadConfigs(): Promise<areas[]> {
    return this.api.call<areas[]>("areas.list", {});
  }

  createConfig(payload: areas): Promise<areas> {
    return this.api.call<areas>("areas.create", {
      resource: "areas",
      ...payload,
    });
  }
}
