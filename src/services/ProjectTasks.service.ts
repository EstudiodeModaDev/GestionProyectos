import type { GraphRest } from "../graph/graphRest";
import type {projectTasks, } from "../models/AperturaTienda";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar las tareas de los proyectos almacenados en SharePoint.
 */
export class TareasProyectosService extends BaseSharePointListService<projectTasks> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Tareas Proyecto"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `projectTasks`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del projectTasks.
   */
  protected toModel(item: any): projectTasks {
    const f = item?.fields ?? {};

  return {
    Id: String(item?.id ?? ''),
    Title: f.Title, 
    Codigo: f.Codigo,
    Dependencia: f.Dependencia,
    Diaspararesolver: f.Diaspararesolver,
    Phase: f.Phase,
    TipoTarea: f.TipoTarea,
    IdProyecto: f.IdProyecto,
    FechaResolucion: f.FechaResolucion,
    Estado: f.Estado,
    FechaCierre: f.FechaCierre,
    diasHabiles: f.diasHabiles,
    fechaInicio: f.fechaInicio,
    razonDevolucion: f.razonDevolucion,
    razonBloqueo: f.razonBloqueo,
    AreaResponsable: f.AreaResponsable
    };
  }
}