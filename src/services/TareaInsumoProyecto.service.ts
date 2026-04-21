import type { GraphRest } from "../graph/graphRest";
import type { tareaInsumoProyecto } from "../models/Insumos";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar las relaciones entre las tareas los proyectos y los insumos almacenadas en SharePoint.
 */
export class TareaInsumoProyectoServicio extends BaseSharePointListService<tareaInsumoProyecto> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Tarea Insumo Proyecto"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `tareaInsumoProyecto`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del tareaInsumoProyecto.
   */
  protected toModel(item: any): tareaInsumoProyecto {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ''),
      Title: f.Title, 
      IdInsumoProyecto: f.IdInsumoProyecto,
      TipoUso: f.TipoUso,
      ProyectoId: f.ProyectoId
    };
  }
}