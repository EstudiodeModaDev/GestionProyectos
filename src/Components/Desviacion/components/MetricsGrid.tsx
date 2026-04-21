import React from "react";
import { formatPercent } from "../../../Funcionalidades/Metrics/utils/formatUtils";
import type { DesviacionStatusMeta } from "../types";
import { MetriCard } from "./MetricCard";

type Props = {
  cumplimientoProyecto: number;
  avanceGlobal: number;
  desviacionMeta: DesviacionStatusMeta;
  cumplimientoArea: number;
  blockedCount: number;
};

/**
 * Agrupa las metricas principales del panel de desviacion.
 *
 * @param props - Valores agregados calculados para el proyecto.
 * @returns Rejilla de tarjetas con indicadores de cumplimiento y riesgo.
 */
export const MetricsGrid: React.FC<Props> = ({cumplimientoProyecto, avanceGlobal, desviacionMeta, cumplimientoArea, blockedCount,}) => (
  <div className="desv__metrics">

    
    {/* ========================== Tarjeta % de cumplimiento ========================== */
}
    <MetriCard value={formatPercent(cumplimientoProyecto)} title="% Cumplimiento" detail="Porcentaje de tareas terminadas a tiempo" tone="success" eyebrow="Proyecto"/>
    <MetriCard value={formatPercent(avanceGlobal)} title="% Avance Global" detail="Progreso general" tone="neutral" eyebrow="Ejecucion"/>
    <MetriCard
      value={desviacionMeta.label}
      title="Desviacion promedio"
      detail={desviacionMeta.detail}
      tone={desviacionMeta.tone}
      eyebrow="Ritmo"
    />
    <MetriCard
      value={formatPercent(cumplimientoArea)}
      title="Cumplimiento por area"
      detail="Promedio entre frentes activos"
      tone="neutral"
      eyebrow="Cobertura"
    />
    <MetriCard
      value={String(blockedCount)}
      title="Tareas bloqueadas"
      detail="Pendientes que requieren atencion"
      tone={blockedCount > 0 ? "danger" : "success"}
      eyebrow="Alertas"
    />
  </div>
);
