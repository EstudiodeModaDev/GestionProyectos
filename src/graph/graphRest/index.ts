import {buildGraphError, DEFAULT_GRAPH_BASE_URL, GRAPH_PREFER_HEADER, mergeHeaders, parseGraphResponse, readGraphErrorDetail,} from "./http";
import type { GraphMethod, GraphSendMailPayload, GraphUserLite } from "./types";
export type {GraphMethod, GraphRecipient, GraphSendMailPayload, GraphUserLite,} from "./types";

/**
 * Cliente orquestador para consumir Microsoft Graph vía REST.
 *
 * Centraliza autenticación, ejecución de peticiones, manejo de errores,
 * parseo de respuestas y operaciones frecuentes de correo, usuarios y grupos.
 */
export class GraphRest {
  private getToken: () => Promise<string>;
  private base = DEFAULT_GRAPH_BASE_URL;

  /**
   * Inicializa una nueva instancia de `GraphRest`.
   * @param getToken - Función que resuelve el token de acceso actual.
   * @param baseUrl - URL base opcional para las peticiones.
   */
  constructor(getToken: () => Promise<string>, baseUrl?: string) {
    this.getToken = getToken;
    if (baseUrl) this.base = baseUrl;
  }

  /**
   * Ejecuta una petición JSON relativa a la URL base configurada.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param method - Método HTTP a utilizar.
   * @param path - Ruta relativa de Graph.
   * @param body - Cuerpo opcional de la petición.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada de forma segura.
   */
  private async call<T>(method: GraphMethod, path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const token = await this.getToken();
    const hasBody = body !== undefined && body !== null;

    const headers = mergeHeaders(
      {
        Authorization: `Bearer ${token}`,
        Prefer: GRAPH_PREFER_HEADER,
      },
      hasBody ? { "Content-Type": "application/json" } : undefined,
      init?.headers
    );

    const response = await fetch(this.base + path, {
      ...init,
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const detail = await readGraphErrorDetail(response);
      throw buildGraphError(method, path, response, detail);
    }

    return parseGraphResponse<T>(response);
  }

  /**
   * Ejecuta una petición binaria contra una URL arbitraria.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param method - Método HTTP a utilizar.
   * @param url - URL absoluta o relativa ya resuelta.
   * @param binary - Contenido binario a enviar.
   * @param contentType - Tipo de contenido opcional.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada de forma segura.
   */
  private async sendBinary<T>(
    method: "POST" | "PUT",
    url: string,
    binary: Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
    init?: RequestInit
  ): Promise<T> {
    const token = await this.getToken();

    const headers = mergeHeaders(
      {
        Authorization: `Bearer ${token}`,
      },
      contentType ? { "Content-Type": contentType } : undefined,
      init?.headers
    );

    const response = await fetch(url, {
      ...init,
      method,
      headers,
      body: binary as BodyInit,
    });

    if (!response.ok) {
      const detail = await readGraphErrorDetail(response);
      throw buildGraphError(method, url, response, detail);
    }

    return parseGraphResponse<T>(response);
  }

  /**
   * Descarga un recurso binario desde Graph.
   * @param path - Ruta relativa del recurso.
   * @returns Contenido descargado como `Blob`.
   */
  async getBlob(path: string): Promise<Blob> {
    const token = await this.getToken();
    const response = await fetch(`${this.base.replace(/\/$/, "")}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const detail = await readGraphErrorDetail(response);
      throw buildGraphError("GET", path, response, detail);
    }

    return response.blob();
  }

  /**
   * Ejecuta una petición GET relativa a la URL base.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param path - Ruta relativa de Graph.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada.
   */
  get<T = any>(path: string, init?: RequestInit) {
    return this.call<T>("GET", path, undefined, init);
  }

  /**
   * Ejecuta una petición POST relativa a la URL base.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param path - Ruta relativa de Graph.
   * @param body - Cuerpo JSON de la petición.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada.
   */
  post<T = any>(path: string, body: any, init?: RequestInit) {
    return this.call<T>("POST", path, body, init);
  }

  /**
   * Ejecuta una petición PATCH relativa a la URL base.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param path - Ruta relativa de Graph.
   * @param body - Cuerpo JSON con los cambios a aplicar.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada.
   */
  patch<T = any>(path: string, body: any, init?: RequestInit) {
    return this.call<T>("PATCH", path, body, init);
  }

  /**
   * Ejecuta una petición DELETE relativa a la URL base.
   * @param path - Ruta relativa de Graph.
   * @param init - Configuración adicional de `fetch`.
   * @returns Promesa resuelta cuando la eliminación finaliza.
   */
  delete(path: string, init?: RequestInit) {
    return this.call<void>("DELETE", path, undefined, init);
  }

  /**
   * Envía contenido binario a una ruta relativa de Graph.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param path - Ruta relativa de destino.
   * @param binary - Contenido binario a enviar.
   * @param contentType - Tipo de contenido opcional.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada de forma segura.
   */
  async putBinary<T = any>(
    path: string,
    binary: Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
    init?: RequestInit
  ): Promise<T> {
    return this.sendBinary<T>("PUT", this.base + path, binary, contentType, init);
  }

  /**
   * Ejecuta una petición GET contra una URL absoluta.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param url - URL absoluta a consultar.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada de forma segura.
   */
  async getAbsolute<T = any>(url: string, init?: RequestInit): Promise<T> {
    const token = await this.getToken();
    const headers = mergeHeaders(
      {
        Authorization: `Bearer ${token}`,
        Prefer: GRAPH_PREFER_HEADER,
      },
      init?.headers
    );

    const response = await fetch(url, {
      ...init,
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const detail = await readGraphErrorDetail(response);
      throw buildGraphError("GET (absolute)", url, response, detail);
    }

    return parseGraphResponse<T>(response);
  }

  /**
   * Envía un correo desde un usuario específico.
   * @param fromUser - UPN o identificador del usuario remitente.
   * @param payload - Carga útil del correo.
   * @returns Promesa resuelta cuando el envío finaliza.
   */
  sendMail(fromUser: string, payload: GraphSendMailPayload) {
    const encoded = encodeURIComponent(fromUser);
    return this.post<void>(`/users/${encoded}/sendMail`, payload);
  }

  /**
   * Envía contenido binario con POST a una URL absoluta.
   * @typeParam T - Tipo esperado en la respuesta.
   * @param url - URL absoluta de destino.
   * @param binary - Contenido binario a enviar.
   * @param contentType - Tipo de contenido opcional.
   * @param init - Configuración adicional de `fetch`.
   * @returns Respuesta parseada de forma segura.
   */
  async postAbsoluteBinary<T = any>(
    url: string,
    binary: Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
    init?: RequestInit
  ): Promise<T> {
    return this.sendBinary<T>("POST", url, binary, contentType, init);
  }

  /**
   * Busca el identificador de un usuario a partir de su correo.
   * @param email - Correo o UPN del usuario.
   * @returns Identificador único del usuario en Entra ID.
   */
  async getUserIdByEmail(email: string): Promise<string> {
    const normalizedEmail = (email ?? "").trim();
    if (!normalizedEmail) throw new Error("getUserIdByEmail: email vacio");

    try {
      const encoded = encodeURIComponent(normalizedEmail);
      const user = await this.get<GraphUserLite>(
        `/users/${encoded}?$select=id,displayName,mail,userPrincipalName`
      );
      if (user?.id) return user.id;
    } catch {}

    const filter = encodeURIComponent(
      `mail eq '${normalizedEmail}' or userPrincipalName eq '${normalizedEmail}'`
    );

    const response = await this.get<{ value: GraphUserLite[] }>(
      `/users?$select=id,displayName,mail,userPrincipalName&$top=1&$filter=${filter}`
    );

    const found = response?.value?.[0];
    if (!found?.id) {
      throw new Error(`No se encontro el usuario en Entra ID para: ${normalizedEmail}`);
    }

    return found.id;
  }

  /**
   * Agrega un usuario a un grupo.
   * @param groupId - Identificador del grupo.
   * @param email - Correo del usuario a agregar.
   * @returns Promesa resuelta cuando la operación finaliza.
   */
  async addUserToGroup(groupId: string, email: string): Promise<void> {
    const gid = (groupId ?? "").trim();
    if (!gid) throw new Error("addUserToGroup: groupId vacio");

    const userId = await this.getUserIdByEmail(email);

    try {
      await this.post<void>(`/groups/${gid}/members/$ref`, {
        "@odata.id": `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`,
      });
    } catch (error: any) {
      const message = String(error?.message ?? error);
      const isDuplicate =
        message.includes("409") ||
        message.includes("added object references already exist") ||
        message.toLowerCase().includes("already exist");

      if (!isDuplicate) throw error;
    }
  }

  /**
   * Indica si un usuario pertenece a un grupo.
   * @param groupId - Identificador del grupo.
   * @param email - Correo del usuario a validar.
   * @returns `true` si el usuario es miembro del grupo.
   */
  async isUserInGroup(groupId: string, email: string): Promise<boolean> {
    const gid = (groupId ?? "").trim();
    if (!gid) throw new Error("isUserInGroup: groupId vacio");

    const userId = await this.getUserIdByEmail(email);
    const token = await this.getToken();

    const response = await fetch(`${this.base}/groups/${gid}/members/${userId}/$ref`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: GRAPH_PREFER_HEADER,
      },
    });

    if (response.status === 204) return true;
    if (response.status === 404) return false;

    if (!response.ok) {
      const detail = await readGraphErrorDetail(response);
      throw buildGraphError(
        "GET",
        `/groups/${gid}/members/${userId}/$ref`,
        response,
        detail
      );
    }

    return true;
  }

  /**
   * Busca miembros de un grupo y opcionalmente filtra por correo.
   * @param groupId - Identificador del grupo.
   * @param emailContains - Texto opcional a buscar en correo o UPN.
   * @param top - Número máximo de resultados.
   * @returns Lista de usuarios encontrados.
   */
  async searchMembersInGroup(
    groupId: string,
    emailContains?: string,
    top: number = 50
  ): Promise<GraphUserLite[]> {
    const gid = (groupId ?? "").trim();
    if (!gid) throw new Error("searchMembersInGroup: groupId vacio");

    const safeTop = Math.max(1, Math.min(top, 999));
    const response = await this.get<{ value: GraphUserLite[] }>(
      `/groups/${gid}/members?$select=id,displayName,mail,userPrincipalName&$top=${safeTop}`
    );

    const items = response?.value ?? [];
    if (!emailContains) return items;

    const query = emailContains.toLowerCase();
    return items.filter(
      (user) =>
        (user.mail ?? "").toLowerCase().includes(query) ||
        (user.userPrincipalName ?? "").toLowerCase().includes(query)
    );
  }

  /**
   * Remueve un usuario de un grupo.
   * @param groupId - Identificador del grupo.
   * @param email - Correo del usuario a remover.
   * @returns Promesa resuelta cuando la operación finaliza.
   */
  async removeUserFromGroup(groupId: string, email: string): Promise<void> {
    const gid = (groupId ?? "").trim();
    if (!gid) throw new Error("removeUserFromGroup: groupId vacio");

    const userId = await this.getUserIdByEmail(email);

    try {
      await this.delete(`/groups/${gid}/members/${userId}/$ref`);
    } catch (error: any) {
      const message = String(error?.message ?? error);
      if (message.includes("404")) return;
      throw error;
    }
  }
}
