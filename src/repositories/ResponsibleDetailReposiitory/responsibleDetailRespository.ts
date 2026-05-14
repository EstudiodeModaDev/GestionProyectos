import type { responsableReglaTareaDetalle } from "../../models/responsables";

export type filterResponsibleDetail = {
  reglaId: number;
  id_marca?: number | null;
  id_zona?: number | null;
};

export interface ResponsibleDetailRepository {
  loadDetail(filter?: filterResponsibleDetail): Promise<responsableReglaTareaDetalle[]>;
  createDetail(payload: responsableReglaTareaDetalle): Promise<responsableReglaTareaDetalle>;
  updateDetail(id: string, payload: responsableReglaTareaDetalle): Promise<responsableReglaTareaDetalle>;
  deleteDetail(id: number): Promise<void>;
}
