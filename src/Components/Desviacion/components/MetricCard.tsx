import React from "react";
import type { DesviacionTone } from "../types";

type Props = {
  value: string;
  title: string;
  detail?: string;
  tone?: DesviacionTone;
  eyebrow?: string;
};

/**
 * Renderiza una tarjeta compacta para una metrica del panel de desviacion.
 *
 * @param props - Valor, titulo y tono visual de la metrica.
 * @returns Tarjeta resumen de una estadistica.
 */
export const MetriCard: React.FC<Props> = ({
  value,
  title,
  detail,
  tone = "neutral",
  eyebrow,
}) => (
  <article className={`desv__metric-card desv__metric-card--${tone}`}>
    <div className="desv__metric-top">
      <span className={`desv__metric-accent desv__metric-accent--${tone}`} aria-hidden="true" />
      <div>
        {eyebrow ? <div className="desv__metric-eyebrow">{eyebrow}</div> : null}
        <div className="desv__metric-label">{title}</div>
      </div>
    </div>

    <div className="desv__metric-value">{value}</div>

    {detail ? <div className="desv__metric-caption">{detail}</div> : null}
  </article>
);
