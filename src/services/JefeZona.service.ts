import type { GraphRest } from "../graph/graphRest";
import type { jefeZona, } from "../models/responsables";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los jefes de zona almacenados en SharePoint.
 */
export class JefeZonaService extends BaseSharePointListService<jefeZona> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - JefeZona"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `jefeZona`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del jefeZona.
   */
  protected toModel(item: any): jefeZona {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ""),
    Title: f.Title,
    JefeCorreo: f.JefeCorreo,
    JefeNombre: f.JefeNombre,
    Zona: f.Zona,
    };
  }
}