import type { GraphRest, GraphSendMailPayload } from "../graph/graphRest";

/**
 * Servicio para enviar notificaciones por correo a través de Microsoft Graph.
 */
export class MailService {
  private graph!: GraphRest;

  /**
   * Inicializa una nueva instancia del servicio de correo.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    this.graph = graph;
  }

  /**
   * Envía un correo electrónico usando el endpoint `sendMail` del usuario autenticado.
   * @param payload - Contenido y metadatos del correo a enviar.
   * @returns Respuesta devuelta por Microsoft Graph.
   */
  async sendEmail(payload: GraphSendMailPayload) {
    const res = await this.graph.post<any>("/me/sendMail", payload);
    return res;
  }
}

