import type { tareaInsumoProyecto } from "../../models/Insumos";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterTareaInsumoProyecto, TareaInsumoProyectoRepository,} from "./TareaInsumoProyectoRepository";

export class SupabaseTareaInsumoProyectoRepository implements TareaInsumoProyectoRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadRelation(filter?: filterTareaInsumoProyecto): Promise<tareaInsumoProyecto[]> {
    return this.api.call<tareaInsumoProyecto[]>("taskProjectInsumo.list", {...filter});
  }

  createRelation(payload: tareaInsumoProyecto): Promise<tareaInsumoProyecto> {
    return this.api.call<tareaInsumoProyecto>("taskProjectInsumo.create", {
      resource: "taskProjectInsumo",
      ...payload,
    });
  }

  updateRelation(id: string, payload: tareaInsumoProyecto): Promise<tareaInsumoProyecto> {
    return this.api.call<tareaInsumoProyecto>("taskProjectInsumo.update", {
      resource: "taskProjectInsumo",
      id: id,
      ...payload,
    });
  }
}
