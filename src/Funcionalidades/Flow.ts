export type FlowInvokeOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
};

/**
 * Cliente ligero para invocar flujos HTTP externos.
 */
export class FlowClient {
  private readonly flowUrl: string;

  /**
   * Inicializa una nueva instancia del cliente de flujos.
   * @param flowUrl - URL absoluta del flujo a consumir.
   */
  constructor(flowUrl: string) {
    if (!flowUrl || !/^https?:\/\//i.test(flowUrl)) {
      throw new Error("FlowClient: URL invÃ¡lida");
    }
    this.flowUrl = flowUrl;
  }

  /**
   * Ejecuta una invocación POST al flujo configurado.
   * @typeParam TIn - Tipo del payload enviado.
   * @typeParam TOut - Tipo esperado en la respuesta.
   * @param payload - Cuerpo JSON a enviar al flujo.
   * @param opts - Configuración adicional de cabeceras, timeout y reintentos.
   * @returns Respuesta del flujo parseada como JSON cuando aplica.
   */
  async invoke<TIn extends object, TOut = unknown>(
    payload: TIn,
    opts: FlowInvokeOptions = {}
  ): Promise<TOut> {
    const { headers = {}, timeoutMs = 30_000, retries = 0 } = opts;
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    /**
     * Ejecuta un único intento de invocación.
     * @returns Respuesta parseada del flujo.
     */
    const tryOnce = async (): Promise<TOut> => {
      const ac = new AbortController();
      const id = setTimeout(() => ac.abort(), timeoutMs);
      try {
        const res = await fetch(this.flowUrl, {
          method: "POST",
          headers: mergedHeaders,
          body: JSON.stringify(payload),
          signal: ac.signal,
        });
        const ct = res.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        const raw = await res.text().catch(() => "");
        if (!res.ok) {
          let msg = raw;
          if (isJson) {
            try {
              const obj = JSON.parse(raw);
              msg = (obj as any)?.error || (obj as any)?.message || JSON.stringify(obj);
            } catch {}
          }
          throw new Error(`Flow ${res.status}: ${msg || "Error invocando el flujo"}`);
        }
        return (isJson ? JSON.parse(raw) : ({} as any)) as TOut;
      } finally {
        clearTimeout(id);
      }
    };

    let attempt = 0;
    while (true) {
      try {
        return await tryOnce();
      } catch (err: any) {
        const transient =
          /abort/i.test(String(err?.message)) ||
          /timed out/i.test(String(err?.message)) ||
          /network/i.test(String(err?.message)) ||
          /Flow 5\d{2}/.test(String(err?.message));
        if (attempt >= retries || !transient) throw err;
        attempt++;
        await new Promise((r) => setTimeout(r, 250 * attempt));
      }
    }
  }
}
