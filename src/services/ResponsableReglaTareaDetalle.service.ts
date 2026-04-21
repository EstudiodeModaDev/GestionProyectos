import type { GraphRest } from "../graph/graphRest";
import type {  responsableReglaTareaDetalle } from "../models/responsables";
import { BaseSharePointListService } from "./Base.service";


/**
 * Servicio para gestionar los detalles de los responsables por plantilla asignados a las tareas almacenadas en SharePoint.
 */
export class ResponsableReglaTareaDetalleService extends BaseSharePointListService<responsableReglaTareaDetalle> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Responsable Regla Tarea Detalle"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `responsableReglaTareaDetalle`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del responsableReglaTareaDetalle.
   */
  protected toModel(item: any): responsableReglaTareaDetalle {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      Correo: f.Correo,
      Nombre: f.Nombre,
      reglaId: f.reglaId
    };
  }
}