import type { InsumoProyecto,} from "../../models/Insumos";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { insumosProyectosFilter, InsumosProyectosRepository, } from "./insumosProyectoRepository";

export class SupabaseProjectInsumosRepository implements InsumosProyectosRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  listInsumos(filter: insumosProyectosFilter): Promise<InsumoProyecto[]> {
    return this.api.call<InsumoProyecto[]>("taskInsumos.list", { ...filter });
  }

  createInsumoProyecto(payload: InsumoProyecto): Promise<InsumoProyecto> {
    return this.api.call<InsumoProyecto>("taskInsumos.create", {
      resource: "taskInsumos",
      ...payload,
    });
  }

  updateInsumoProyecto(id: string, payload: Partial<InsumoProyecto>): Promise<InsumoProyecto> {
    return this.api.call<InsumoProyecto>("taskInsumos.update", {
      resource: "taskInsumos",
      id: id,
      ...payload,
    });
  }
}
