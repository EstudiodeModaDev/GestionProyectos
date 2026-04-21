import type { GraphRest } from "../graph/graphRest";
import type { taskResponsible } from "../models/AperturaTienda";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los detalles de los responsables asignados a las tareas del proyecto almacenadas en SharePoint.
 */
export class ResponsableTareaProyectoService extends BaseSharePointListService<taskResponsible> {
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
   * Convierte un elemento bruto de SharePoint en el modelo `taskResponsible`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del taskResponsible.
   */
  protected toModel(item: any): taskResponsible {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      Correo: f.Correo,
      IdTarea: f.IdTarea,
    };
  }
}