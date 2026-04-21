import * as React from "react";

/**
 * Centraliza el estado de carga y error para operaciones asíncronas.
 * @returns Estado y helpers para iniciar, detener o marcar fallos.
 */
export function useAsyncStatus() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Marca el inicio de una operación asíncrona.
   */
  const start = React.useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  /**
   * Marca el fin de una operación asíncrona.
   */
  const stop = React.useCallback(() => setLoading(false), []);

  /**
   * Registra el error producido por una operación asíncrona.
   * @param e - Error capturado.
   * @param fallback - Mensaje de respaldo.
   */
  const fail = React.useCallback((e: unknown, fallback = "Error") => {
    const msg = (e as any)?.message ?? fallback;
    setError(msg);
  }, []);

  return { loading, error, start, stop, fail, setError, setLoading };
}
