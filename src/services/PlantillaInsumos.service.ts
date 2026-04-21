import type { GraphRest } from "../graph/graphRest";
import type { plantillaInsumos } from "../models/Insumos";
import { BaseSharePointListService } from "./Base.service";


/**
 * Servicio para gestionar la plantilla de los insumos almacenados en SharePoint.
 */
export class PlantillaInsumoService extends BaseSharePointListService<plantillaInsumos> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Insumos Plantilla"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `plantillaInsumos`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del plantillaInsumos.
   */
  protected toModel(item: any): plantillaInsumos {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ''),
    Title: f.Title, 
    Categoria: f.Categoria,
    Proceso: f.Proceso,
    OpcionesJson: f.OpcionesJsonm,
    PreguntaFlujo: f.PreguntaFlujo
    };
  }
}