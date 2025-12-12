// PostClosureAnalysis.tsx
import React from "react";
import "./Desviacion.css";
import type { ProjectSP } from "../../models/Projects";
import { ParseDateShow } from "../../utils/Date";
import { useTasks } from "../../Funcionalidades/Tasks";
import { useGraphServices } from "../../graph/graphContext";
import type { TaskApertura } from "../../models/AperturaTienda";

type Props = {
  project: ProjectSP;
  onBack?: () => void;
};

type AnalysisRow = {
  task: TaskApertura;
  isCritical: boolean;
  deviation: number | string;
  deviationClass: string;
  isHeavyDeviation: boolean;
  plannedLabel: string;
  actualLabel: string;
};

const Desviation: React.FC<Props> = ({ project, onBack }) => {
  const { tasks} = useGraphServices();
  const { task: rows, loadProyecTasks } = useTasks(tasks);

  React.useEffect(() => {
    loadProyecTasks(project.Id ?? "")
  }, [project])

  if (!rows || rows.length === 0) {
    return (
      <div className="pca-root">
        <div className="pca-header">
          <div>
            <h1 className="pca-title">Análisis Post-Cierre: {project.Title}</h1>
            <p className="pca-subtitle"> Aún no hay configuración de análisis post-cierre para este proyecto.</p>
          </div>
          {onBack && (
            <button className="pca-back-btn" onClick={onBack}>
              ← Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // =========================
  // 1) Preparamos filas de análisis
  // =========================
  const analysisRows: AnalysisRow[] = rows.map((task) => {
    const isCritical = task.TipoTarea === "Critica";
    const planned = task.FechaResolucion ? new Date(task.FechaResolucion) : null;
    let plannedLabel = task.FechaResolucion ? ParseDateShow(task.FechaResolucion) : "Sin fecha planeada";
    let actualLabel = "";
    let deviation: number | string = "N/A";

    if (task.FechaCierre) {
      const actual = new Date(task.FechaCierre);

      if (planned) {
        const ms = actual.getTime() - planned.getTime();
        deviation = Math.round(ms / MS_PER_DAY);
      }

      actualLabel = ParseDateShow(task.FechaCierre);
    } else {
      actualLabel = "No se finalizó";
      deviation = "N/A";
    }

    const deviationClass = typeof deviation === "number"  ? deviation > 0 ? "pca-cell-deviation-negative" : "pca-cell-deviation-positive" : "pca-cell-deviation-neutral";
    const isHeavyDeviation = isCritical && typeof deviation === "number" && deviation > 5;

    return { task,
      isCritical,
      deviation,
      deviationClass,
      isHeavyDeviation,
      plannedLabel,
      actualLabel,
    };
  });

  // =========================
  // 2) KPIs de desviación
  // =========================
  const criticalRows = analysisRows.filter((r) => r.isCritical);

  const numericDeviations = criticalRows
    .map((r) => (typeof r.deviation === "number" ? r.deviation : null))
    .filter((v): v is number => v !== null);

  let deviationText = "0 días";
  if (numericDeviations.length > 0) {
    const maxDelay = Math.max(...numericDeviations); // puede ser negativo
    const minDelay = Math.min(...numericDeviations);

    if (maxDelay > 0) {
      deviationText = `+${maxDelay} días`;
    } else if (minDelay < 0) {
      deviationText = `${minDelay} días (adelanto)`;
    }
  }

  const criticalWithDelay = criticalRows.filter(
    (r) => typeof r.deviation === "number" && r.deviation > 0
  ).length;

  const totalCritical = criticalRows.length || 1;
  const criticalAffected = `${criticalWithDelay} / ${totalCritical}`;

  // =========================
  // 3) Render
  // =========================
  return (
    <div className="pca-root">
      {/* Header */}
      <div className="pca-header">
        <div>
          <h1 className="pca-title">Análisis Post-Cierre: {project.Title}</h1>
          <p className="pca-subtitle">
            Desviación del proyecto cerrado con base en tareas críticas.
          </p>
        </div>

        {onBack && (
          <button className="btn btn-cancel" onClick={onBack}>
            ← Volver al dashboard
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="pca-kpi-grid">
        <div className={"pca-kpi-card " + (Number(project.Progreso) < 100 ? "pca-kpi-border-red" : "pca-kpi-border-green")}>
          <p className="pca-kpi-label">Cumplimiento global</p>
          <p className={"pca-kpi-value " + (Number(project.Progreso) < 100 ? "pca-kpi-value-red" : "pca-kpi-value-green")}>
            {project.Progreso}%
          </p>
        </div>

        <div className="pca-kpi-card pca-kpi-border-orange">
          <p className="pca-kpi-label">Días de desviación final</p>
          <p className="pca-kpi-value pca-kpi-value-orange">
            {deviationText}
          </p>
        </div>

        <div className="pca-kpi-card pca-kpi-border-indigo">
          <p className="pca-kpi-label">Tareas críticas afectadas</p>
          <p className="pca-kpi-value pca-kpi-value-indigo">
            {criticalAffected}
          </p>
        </div>
      </div>

      {/* Tabla de tareas */}
      <div className="pca-table-section">
        <h2 className="pca-table-title">
          Detalle de incumplimiento por tarea crítica
        </h2>

        <div className="pca-table-wrapper">
          <table className="pca-table">
            <thead>
              <tr>
                <th>Tarea (Ruta Crítica)</th>
                <th>Fecha planeada</th>
                <th>Fecha real</th>
                <th>Desviación (días)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {analysisRows.map((row) => (
                <tr key={row.task.Id} className={row.isHeavyDeviation ? "pca-row pca-row-critical" : "pca-row"}>
                  <td className={"pca-cell-text " + (row.isCritical ? "pca-cell-critical" : "pca-cell-normal")}>
                    {row.task.Title}
                  </td>
                  <td className="pca-cell-text-muted">
                    {row.plannedLabel}
                  </td>
                  <td className="pca-cell-text-muted">
                    {row.actualLabel}
                  </td>
                  <td className={row.deviationClass}>{row.deviation}</td>
                  <td>
                    <span className={"pca-status-chip " + (row.task.Estado === "Completa" ? "pca-status-ok" : "pca-status-bad")}>
                      {row.task.Estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Desviation;
