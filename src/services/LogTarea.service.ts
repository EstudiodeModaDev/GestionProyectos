import type { GraphRest } from "../graph/graphRest";
import type { LogTarea } from "../models/LogTarea";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los logs de las tareas almacenados en SharePoint.
 */
export class LogTareaService extends BaseSharePointListService<LogTarea> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Log Tareas"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `LogTarea`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del LogTarea.
   */
  protected toModel(item: any): LogTarea {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ""),
    Title: f.Title,
    FechaAccion: f.FechaAccion,
    IdTarea: f.IdTarea,
    RealizadoPor: f.RealizadoPor,
    };
  }
}