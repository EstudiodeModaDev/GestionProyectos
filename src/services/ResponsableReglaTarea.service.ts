
import type { GraphRest } from "../graph/graphRest";
import type { responsableReglaTarea } from "../models/responsables";
import { BaseSharePointListService } from "./Base.service";


/**
 * Servicio para gestionar los responsables por plantilla asignados a las tareas almacenadas en SharePoint.
 */
export class ResponsableReglaTareaService extends BaseSharePointListService<responsableReglaTarea> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Responsable Regla Tarea"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `responsableReglaTarea`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del responsableReglaTarea.
   */
  protected toModel(item: any): responsableReglaTarea {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      Ciudad: f.Ciudad,
      Marca: f.Marca,
    };
  }
}
