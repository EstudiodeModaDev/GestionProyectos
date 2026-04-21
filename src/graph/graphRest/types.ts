/**
 * Representa un destinatario de correo compatible con Microsoft Graph.
 */
export type GraphRecipient = {
  /**
   * Datos básicos de la dirección de correo.
   */
  emailAddress: {
    /**
     * Dirección de correo del destinatario.
     */
    address: string;
  };
};

/**
 * Define la carga útil requerida para enviar correos mediante Microsoft Graph.
 */
export type GraphSendMailPayload = {
  /**
   * Contenido principal del mensaje.
   */
  message: {
    /**
     * Asunto del correo.
     */
    subject: string;
    /**
     * Cuerpo del correo y su tipo de contenido.
     */
    body: {
      /**
       * Formato del contenido del cuerpo.
       */
      contentType: "Text" | "HTML";
      /**
       * Texto o HTML del cuerpo del mensaje.
       */
      content: string;
    };
    /**
     * Lista de destinatarios principales.
     */
    toRecipients: GraphRecipient[];
    /**
     * Lista opcional de destinatarios en copia.
     */
    ccRecipients?: GraphRecipient[];
  };
  /**
   * Indica si el correo debe guardarse en elementos enviados.
   */
  saveToSentItems?: boolean;
};

/**
 * Información mínima de un usuario devuelta por Microsoft Graph.
 */
export type GraphUserLite = {
  /**
   * Identificador único del usuario.
   */
  id: string;
  /**
   * Nombre visible del usuario.
   */
  displayName?: string;
  /**
   * Correo principal del usuario.
   */
  mail?: string;
  /**
   * User principal name del usuario.
   */
  userPrincipalName?: string;
};

/**
 * Métodos HTTP soportados por el cliente `GraphRest`.
 */
export type GraphMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
