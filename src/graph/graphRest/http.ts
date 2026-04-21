import type { GraphMethod } from "./types";

/**
 * URL base por defecto para Microsoft Graph v1.0.
 */
export const DEFAULT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0/";

/**
 * Cabecera `Prefer` usada para consultas tolerantes a índices no óptimos.
 */
export const GRAPH_PREFER_HEADER = "HonorNonIndexedQueriesWarningMayFailRandomly";

/**
 * Forma mínima esperada para errores devueltos por Microsoft Graph.
 */
export type GraphErrorShape = {
  error?: {
    message?: string;
  };
  message?: string;
};

/**
 * Extrae un mensaje legible desde una respuesta fallida.
 * @param response - Respuesta HTTP retornada por `fetch`.
 * @returns Detalle del error si fue posible interpretarlo.
 */
export async function readGraphErrorDetail(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return "";

    try {
      const parsed = JSON.parse(text) as GraphErrorShape;
      return parsed?.error?.message || parsed?.message || text;
    } catch {
      return text;
    }
  } catch {
    return "";
  }
}

/**
 * Parsea una respuesta HTTP manejando `204`, cuerpos vacíos y JSON.
 * @typeParam T - Tipo esperado para la respuesta.
 * @param response - Respuesta HTTP exitosa.
 * @returns Contenido parseado según el tipo de contenido.
 */
export async function parseGraphResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  return text as T;
}

/**
 * Construye un error homogéneo para operaciones del cliente Graph.
 * @param method - Método HTTP ejecutado.
 * @param target - Ruta o URL solicitada.
 * @param response - Respuesta HTTP fallida.
 * @param detail - Detalle adicional del error.
 * @returns Instancia de `Error` con contexto de depuración.
 */
export function buildGraphError(method: GraphMethod | string, target: string, response: Response, detail: string): Error {
  return new Error(
    `${method} ${target} -> ${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`
  );
}

/**
 * Combina varios juegos de cabeceras preservando la última ocurrencia de cada clave.
 * @param headersList - Colección de cabeceras a fusionar.
 * @returns Objeto plano listo para usarse en `fetch`.
 */
export function mergeHeaders(...headersList: Array<HeadersInit | undefined>): Record<string, string> {
  const merged = new Headers();

  headersList.forEach((headers) => {
    if (!headers) return;
    new Headers(headers).forEach((value, key) => {
      merged.set(key, value);
    });
  });

  return Object.fromEntries(merged.entries());
}
