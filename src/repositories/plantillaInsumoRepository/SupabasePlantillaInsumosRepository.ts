import type { plantillaInsumos } from "../../models/Insumos";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { PlantillaInsumosRepository } from "./PlantillaInsumosRepository";

export class SupabasePlantillaInsumosRepository implements PlantillaInsumosRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  listByProceso(proceso: string): Promise<plantillaInsumos[]> {
    return this.api.call<plantillaInsumos[]>("insumos.list", { proceso });
  }

  create(payload: plantillaInsumos): Promise<plantillaInsumos> {
    return this.api.call<plantillaInsumos>("createResource", {
      resource: "insumos",
      ...payload,
    });
  }

  update(id: string, payload: plantillaInsumos): Promise<plantillaInsumos> {
    return this.api.call<plantillaInsumos>("updateResource", {
      resource: "insumos",
      id: id,
      ...payload,
    });
  }

  async inactivate(id: string): Promise<void> {
    await this.api.call("setResourceActive", {
      resource: "insumos",
      id: id,
      is_active: false,
    });
  }
}
