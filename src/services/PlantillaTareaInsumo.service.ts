import type { GraphRest } from "../graph/graphRest";
import type { plantillaTareaInsumo } from "../models/Insumos";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar la plantilla de la realcion entre las tareas y los insumos almacenados en SharePoint.
 */
export class PlantillaTareaInsumoService extends BaseSharePointListService<plantillaTareaInsumo> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Insumo Tarea Plantilla"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `plantillaInsumos`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del plantillaInsumos.
   */
  protected toModel(item: any): plantillaTareaInsumo {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ""),
    Title: f.Title,
    IdInsumo: f.IdInsumo,
    Proceso: f.Proceso,
    TipoInsumo: f.TipoInsumo,
    Obligatorio: f.Obligatorio,
    OrdenPregunta: f.OrdenPregunta,
    };
  }
}
