import type { GraphRecipient } from "../../graph/graphRest";

/**
 * Modelo de vista para representar un insumo asociado a una tarea en notificaciones.
 */
export type TaskInsumoView = {
  /**
   * Identificador del insumo.
   */
  id: string;
  /**
   * Nombre visible del insumo.
   */
  title: string;
  /**
   * Tipo de relación del insumo con la tarea.
   */
  tipo: "Entrada" | "Salida";
  /**
   * Texto capturado o descripción principal del insumo.
   */
  texto: string;
  /**
   * Estado actual para mostrar en la notificación.
   */
  estado: string;
  /**
   * Enlace opcional a un archivo o adjunto asociado.
   */
  link?: string;
};

/**
 * Argumentos requeridos para construir y enviar la notificación de tarea desbloqueada.
 */
export type SendUnlockedTaskNotificationArgs = {
  /**
   * Tarea previa cuyo cierre desbloqueó nuevas tareas.
   */
  predecessorTask: {
    /**
     * Nombre de la tarea predecesora.
     */
    Title?: string;
    /**
     * Código funcional de la tarea predecesora.
     */
    Codigo?: string;
  };
  /**
   * Tareas habilitadas tras completar la tarea predecesora.
   */
  unlockedTasks: Array<{
    /**
     * Identificador de la tarea desbloqueada.
     */
    Id?: string;
    /**
     * Nombre visible de la tarea.
     */
    Title?: string;
    /**
     * Código funcional de la tarea.
     */
    Codigo?: string;
    /**
     * Identificador del proyecto al que pertenece la tarea.
     */
    IdProyecto: string;
    /**
     * Fecha estimada de inicio.
     */
    fechaInicio?: string;
    /**
     * Fecha objetivo o de resolución.
     */
    FechaResolucion?: string;
    /**
     * Fase o etapa funcional de la tarea.
     */
    Phase?: string;
    /**
     * Duración esperada de la tarea en días.
     */
    Diaspararesolver?: number;
  }>;
};

/**
 * Estructura mínima para enviar un correo a un destinatario específico.
 */
export type NotificationEmail = {
  /**
   * Asunto del correo.
   */
  subject: string;
  /**
   * Cuerpo HTML del mensaje.
   */
  bodyHtml: string;
  /**
   * Destinatarios del correo.
   */
  toRecipients: GraphRecipient[];
};
