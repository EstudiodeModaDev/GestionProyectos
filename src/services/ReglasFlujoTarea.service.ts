import type { GraphRest } from "../graph/graphRest";
import type { ReglasFlujoTareas } from "../models/Insumos";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar las reglas de negocio de las tareas almacenadas en SharePoint.
 */
export class ReglasFlujoTareaService extends BaseSharePointListService<ReglasFlujoTareas> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Reglas Flujo Tarea"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `ProjectSP`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del ProjectSP.
   */
  protected toModel(item: any): ReglasFlujoTareas {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      Activa: f.Activa,
      Condicion: f.Condicion,
      IdPlantillaInsumo: f.IdPlantillaInsumo,
      IdTemplateTaskOrigen: f.IdTemplateTaskOrigen,
      Prioridad: f.Prioridad,
      ValorEsperado: f.ValorEsperado,
      TareaSiCumple: f.TareaSiCumple,
      TareaSiNoCumple: f.TareaSiNoCumple
    };
  }
}
