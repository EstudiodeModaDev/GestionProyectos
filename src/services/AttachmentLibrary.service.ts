
import type { GraphRest } from "../graph/graphRest";
import { BibliotecaBaseService } from "./BibliotecaBase.service";

/**
 * Servicio concreto para bibliotecas de adjuntos de tareas.
 */
export class TaskBibliotecaAttachmentsService extends BibliotecaBaseService {
  /**
   * Inicializa una nueva instancia del servicio de adjuntos.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   * @param hostname - Host del sitio de SharePoint.
   * @param sitePath - Ruta relativa del sitio.
   * @param name - Nombre de la biblioteca.
   */
  constructor(graph: GraphRest, hostname: string, sitePath: string, name: string) {
    super(graph, hostname, sitePath, name);
  }
}