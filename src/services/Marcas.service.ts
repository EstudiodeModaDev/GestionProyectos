import type { GraphRest } from "../graph/graphRest";
import type { desplegable } from "../models/desplegables";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los logs de las marcas almacenadas en SharePoint.
 */
export class MarcasService extends BaseSharePointListService<desplegable> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Marcas"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `desplegable`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del desplegable.
   */
  protected toModel(item: any): desplegable {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ""),
    Title: f.Title,
    IsActive: f.IsActive
    };
  }
}