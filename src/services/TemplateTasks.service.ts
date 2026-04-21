import type { GraphRest } from "../graph/graphRest";
import type { TemplateTasks } from "../models/AperturaTienda";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar las relaciones entre las tareas los proyectos y los insumos almacenadas en SharePoint.
 */
export class TemplateTaskService extends BaseSharePointListService<TemplateTasks> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Tareas Plantilla"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `TemplateTasks`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del TemplateTasks.
   */
  protected toModel(item: any): TemplateTasks {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ''),
      Title: f.Title, 
      Codigo: f.Codigo,
      Dependencia: f.Dependencia,
      Diaspararesolver: f.Diaspararesolver,
      Phase: f.Phase,
      TipoTarea: f.TipoTarea,
      diasHabiles: f.diasHabiles,
      AreaResponsable: f.AreaResponsable
    };
  }
}