import React from "react";

type Props = {
  error: string | null;
  responsablesError: string | null;
  isLoading: boolean;
};

/**
 * Muestra mensajes de carga y errores asociados al panel de desviacion.
 *
 * @param props - Estados de error y carga del modulo.
 * @returns Mensajes contextuales visibles cuando aplica.
 */
export const FeedbackMessages: React.FC<Props> = ({
  error,
  responsablesError,
  isLoading,
}) => (
  <>
    {error ? <p className="desv__feedback desv__feedback--error">{error}</p> : null}
    {responsablesError ? (
      <p className="desv__feedback desv__feedback--error">{responsablesError}</p>
    ) : null}
    {isLoading ? (
      <p className="desv__feedback">Cargando métricas del proyecto...</p>
    ) : null}
  </>
);
