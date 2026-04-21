import React from "react";
import { isCompletedTask } from "../../../Funcionalidades/Metrics/utils/taskStateUtils";
import type { TaskColumnFilterKey, TaskColumnFilters, TaskRowView } from "../types";

type Props = {
  taskRows: TaskRowView[];
  filters: TaskColumnFilters;
  onOpenFilter: (column: TaskColumnFilterKey) => void;
};

const FILTERABLE_COLUMNS: Array<{ key: TaskColumnFilterKey; label: string }> = [
  { key: "tarea", label: "Tarea" },
  { key: "area", label: "Area" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
];

/**
 * Renderiza la tabla detallada de tareas con filtros por columna.
 *
 * @param props - Filas visibles, filtros activos y callback para abrir filtros.
 * @returns Tabla con el detalle operativo del proyecto.
 */
export const TasksTable: React.FC<Props> = ({ taskRows, filters, onOpenFilter }) => (
  <div className="desv__table-card">
    <div className="desv__table-head">
      <div>
        <p className="desv__table-eyebrow">Detalle operativo</p>
        <h2 className="desv__table-title">Seguimiento de tareas</h2>
      </div>
      <div className="desv__table-counter">{taskRows.length} tareas</div>
    </div>

    <div className="desv__table-wrap">
      <table className="desv__table">
        <thead>
          <tr>
            {FILTERABLE_COLUMNS.map(({ key, label }) => (
              <th key={key}>
                <button
                  type="button"
                  className="desv__th-button"
                  data-active={filters[key] !== "all"}
                  onClick={() => onOpenFilter(key)}
                >
                  <span>{label}</span>
                  <small>{filters[key] === "all" ? "Filtrar" : filters[key]}</small>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {taskRows.map((row) => (
            <tr key={row.id}>
              <td className="desv__cell-primary">{row.tarea}</td>
              <td>
                <span className="desv__tag">{row.area}</span>
              </td>
              <td>{row.responsable}</td>
              <td>
                <span
                  className={
                    "desv__status-pill " +
                    (row.isBlocked
                      ? "desv__status-pill--blocked"
                      : isCompletedTask(row.estado)
                        ? "desv__status-pill--done"
                        : "desv__status-pill--active")
                  }
                >
                  {row.estado}
                </span>
              </td>
            </tr>
          ))}

          {!taskRows.length ? (
            <tr>
              <td colSpan={5} className="desv__empty">
                No hay tareas para mostrar en este proyecto.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);
