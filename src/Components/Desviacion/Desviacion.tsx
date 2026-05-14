import React from "react";
import "./Desviacion.css";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import type { DesviacionProps } from "./types";
import { ColumnFilterModal } from "./components/ColumnFilterModal";
import { FeedbackMessages } from "./components/FeedbackMessages";
import { MetricsGrid } from "./components/MetricsGrid";
import { TasksTable } from "./components/TasksTable";
import { useDesviacionMetrics } from "../../Funcionalidades/Metrics/hooks/useDesviacionMetrics";
import { useTaskResponsables } from "../../Funcionalidades/taskResponsible/useTaskResponsables";
import type { TaskColumnFilterKey, TaskColumnFilters } from "./types";
import { useRepositories } from "../../repositories/repositoriesContext";

const DEFAULT_FILTERS: TaskColumnFilters = {
  tarea: "all",
  area: "all",
  responsable: "all",
  estado: "all",
};

/**
 * Presenta el tablero de metricas y desviaciones del proyecto seleccionado.
 *
 * @param props - Propiedades del modulo de desviacion.
 * @returns Vista con KPIs, filtros por columna y detalle de tareas.
 */
const Desviacion: React.FC<DesviacionProps> = ({ project, }) => {
  const repositories = useRepositories()
  const { tasks: projectTasksList, loadAllProjectTasks, loading, error, } = useTasks(repositories.projectTasks!);
  const [filters, setFilters] = React.useState<TaskColumnFilters>(DEFAULT_FILTERS);
  const [activeColumn, setActiveColumn] = React.useState<TaskColumnFilterKey | null>(null);

  React.useEffect(() => {
    if (!project.id) return;
    void loadAllProjectTasks(project.id);
    setFilters(DEFAULT_FILTERS);
  }, [project.id]);

  const taskIds = React.useMemo(
    () =>
      projectTasksList
        .map((task) => String(task.id ?? "").trim())
        .filter(Boolean),
    [projectTasksList]
  );

  const { responsablesByTaskId, responsablesLoading, responsablesError } = useTaskResponsables(taskIds);

  const {  filteredTasks, taskRows, filterOptions, cumplimientoProyecto, avanceGlobal, desviacionMeta, cumplimientoArea, blockedCount, summaryText, lastTargetDateLabel,} = useDesviacionMetrics({
    project,
    projectTasksList,
    filters,
    responsablesByTaskId,
  });

  const handleFilterChange = React.useCallback((column: TaskColumnFilterKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [column]: value,
    }));
    setActiveColumn(null);
  }, []);

  return (
    <section className="desv">
      <div className="desv__backdrop" aria-hidden="true" />

      <header className="desv__hero">
        <div className="desv__hero-main">
          <div>
            <p className="desv__eyebrow">Panel de desvio</p>
            <h1 className="desv__title">Ver solicitud {project.nombre_proyecto}</h1>
          </div>
        </div>

        <div className="desv__summary">
          <span className="desv__summary-label">Resumen</span>
          <strong className="desv__summary-value">{summaryText}</strong>
          <span className="desv__summary-hint">
            Lectura rapida del estado actual del proyecto.
          </span>
        </div>
      </header>

      <FeedbackMessages 
        error={error}
        responsablesError={responsablesError}
        isLoading={loading || responsablesLoading}
      />

      <MetricsGrid
        cumplimientoProyecto={Number(cumplimientoProyecto)}
        avanceGlobal={avanceGlobal}
        desviacionMeta={desviacionMeta}
        cumplimientoArea={cumplimientoArea}
        blockedCount={blockedCount}
      />

      <TasksTable taskRows={taskRows} filters={filters} onOpenFilter={setActiveColumn} />

      {!!filteredTasks.length && (
        <div className="desv__footnote">Ultima fecha objetivo detectada: {lastTargetDateLabel}</div>
      )}

      {activeColumn ? (
        <ColumnFilterModal
          column={activeColumn}
          value={filters[activeColumn]}
          options={filterOptions[activeColumn]}
          onClose={() => setActiveColumn(null)}
          onApply={(value) => handleFilterChange(activeColumn, value)}
        />
      ) : null}
    </section>
  );
};

export default Desviacion;
