import type { marcas,} from "../../../models/generalConfigs";
import type { SupabaseApiService } from "../../../services/supabase.service";

import type { GeneralConfigRepository } from "../generalConfigReposity";

export class SupabaseMarcasRepository implements GeneralConfigRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadConfigs(): Promise<marcas[]> {
    return this.api.call<marcas[]>("marcas.list", {});
  }

  createConfig(payload: marcas): Promise<marcas> {
    return this.api.call<marcas>("marcas.create", {
      resource: "marcas",
      ...payload,
    });
  }
}
