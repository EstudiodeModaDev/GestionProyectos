import type { zonas } from "../../../models/generalConfigs";
import type { SupabaseApiService } from "../../../services/supabase.service";

import type { GeneralConfigRepository } from "../generalConfigReposity";

export class SupabaseZonaRepository implements GeneralConfigRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadConfigs(): Promise<zonas[]> {
    return this.api.call<zonas[]>("zonas.list", {});
  }

  createConfig(payload: zonas): Promise<zonas> {
    return this.api.call<zonas>("zonas.create", {
      resource: "zonas",
      ...payload,
    });
  }
}
