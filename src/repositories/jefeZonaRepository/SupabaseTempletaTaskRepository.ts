import type { jefeZona } from "../../models/responsables";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { JefeZonaRepository, jefeZonaFilter } from "./jefeZonaRepository";

export class SupabaseJefeZonaTaskRepository implements JefeZonaRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadJefes(filter?: jefeZonaFilter): Promise<jefeZona[]> {
    return this.api.call<jefeZona[]>("jefeZona.list", {
      ...(filter?.id_marca ? { id_marca: filter.id_marca } : {}),
      ...(filter?.id_zona ? { id_zona: filter.id_zona } : {}),
    });
  }

  createJefe(payload: jefeZona): Promise<jefeZona> {
    return this.api.call<jefeZona>("jefeZona.create", {
      resource: "jefeZona",
      ...payload,
    });
  }

  updateJefe(id: string, payload: jefeZona): Promise<jefeZona> {
    return this.api.call<jefeZona>("jefeZona.update", {
      resource: "jefeZona",
      id: id,
      ...payload,
    });
  }

  deleteJefe(id: string): Promise<void> {
    return this.api.call<void>("jefeZona.delete", {
      resource: "ResponsibleDetail",
      id: id
    })
  }
}
