import type { responsableReglaTareaDetalle } from "../../models/responsables";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterResponsibleDetail, ResponsibleDetailRepository } from "./responsibleDetailRespository";

export class SupabaseDetailResponsibleRepository implements ResponsibleDetailRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadDetail(filter?: filterResponsibleDetail): Promise<responsableReglaTareaDetalle[]> {
    return this.api.call<responsableReglaTareaDetalle[]>("ResponsibleDetail.list", {
      regla_id: filter?.reglaId,
      id_marca: filter?.id_marca,
      id_zona: filter?.id_zona,
    });
  }

  createDetail(payload: responsableReglaTareaDetalle): Promise<responsableReglaTareaDetalle> {
    return this.api.call<responsableReglaTareaDetalle>("ResponsibleDetail.create", {
      resource: "ResponsibleDetail",
      ...payload,
    });
  }

  updateDetail(id: string, payload: responsableReglaTareaDetalle): Promise<responsableReglaTareaDetalle> {
    return this.api.call<responsableReglaTareaDetalle>("ResponsibleDetail.update", {
      resource: "ResponsibleDetail",
      id: id,
      ...payload,
    });
  }

  deleteDetail(id: number): Promise<void> {
    return this.api.call<void>("ResponsibleDetail.delete", {
      resource: "ResponsibleDetail",
      id: id
    })
     
  }
}
