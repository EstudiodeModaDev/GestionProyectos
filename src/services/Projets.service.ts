import type { GraphRest } from "../graph/graphRest";
import type { ProjectSP } from "../models/Projects";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los proyectos almacenados en SharePoint.
 */
export class ProyectosServices extends BaseSharePointListService<ProjectSP> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Proyectos"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `ProjectSP`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del ProjectSP.
   */
  protected toModel(item: any): ProjectSP {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      Descripcion: f.Descripcion,
      Estado: f.Estado, 
      Fechadelanzamiento: f.Fechadelanzamiento,
      FechaInicio: f.FechaInicio,
      fulfillment: f.fulfillment,
      Lider: f.Lider,
      CorreoLider: f.CorreoLider,
      Progreso: f.Progreso,
      Marca: f.Marca,
      Zona: f.Zona
    };
  }
}
