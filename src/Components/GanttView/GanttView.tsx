import * as React from "react";
import "./GanttView.css";
import type { ProjectSP } from "../../models/Projects";
import type { projectTasks, } from "../../models/AperturaTienda";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useRepositories } from "../../repositories/repositoriesContext";

type GanttViewProps = {
  project: ProjectSP;
};

type GanttRowVM = {
  id: string;
  baseId: string;
  name: string;
  dependencyBaseId?: number;
  isCritical: boolean;
  offsetPercent: number;
  barPercent: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Muestra el cronograma del proyecto y resalta las tareas de la ruta critica.
 *
 * @param props - Propiedades del componente.
 * @returns Vista tipo Gantt construida a partir de las tareas del proyecto.
 */
export const GanttView: React.FC<GanttViewProps> = ({ project }) => {
  const repositories = useRepositories()
  const {loadProjectTasks, tasks: ProjecTasks, critical, loading,} = useTasks(repositories.projectTasks!);
  const [criticalPathIds, setCriticalPathsId] = React.useState<string[]>([]);

  //Fecha inicial del proyecto o por defecto fecha actual
  const baseDate = React.useMemo(
    () =>
      project.fecha_inicio
        ? new Date(project.fecha_inicio)
        : new Date(),
    [project.fecha_inicio]
  );

  // Cargar tareas del proyecto activo + ruta crítica
  React.useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        await loadProjectTasks(project.id!);
        const criticals = await critical.getCriticalCodes(project.id!);
        if (!cancel) {
          setCriticalPathsId(criticals);
        }
      } catch (e) {
        if (!cancel) console.error("Error cargando tareas:", e);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [project.id]);

  const { totalDays, rows } = React.useMemo(() => {
    if (!ProjecTasks.length) {
      return { totalDays: 0, rows: [] as GanttRowVM[] };
    }

    const taskById = new Map<string, projectTasks>();
    ProjecTasks.forEach((t) => {
      if (t.id) taskById.set(t.id, t);
    });

    const startDates = new Map<string, Date>();
    

    /**
     * Obtiene una clave estable para cachear y relacionar tareas en memoria.
     *
     * @param t - Tarea a identificar.
     * @returns Codigo o identificador utilizable como clave interna.
     */
    const getKey = (t: projectTasks) => t.codigo || t.id || "";

    

    /**
     * Calcula la fecha de inicio efectiva de una tarea segun su dependencia.
     *
     * @param t - Tarea cuyo inicio debe resolverse.
     * @returns Fecha estimada de arranque dentro del cronograma.
     */
    function computeStart(t: projectTasks): Date {
      const key = getKey(t);
      if (!key) return baseDate;

      const cached = startDates.get(key);
      if (cached) return cached;

      let start = new Date(baseDate);

      if (t.dependencia) {
        const depCodigo = t.dependencia; // ej: "T1"
        const parent =
          taskById.get(String(depCodigo)) ||
          ProjecTasks.find(
            (x) => Number(x.id) === Number(depCodigo)
          );

        if (parent) {
          const parentStart = computeStart(parent);
          start = new Date(
            parentStart.getTime() +
              Number(parent.dias_para_resolver || 1) * MS_PER_DAY
          );
        }
      }

      startDates.set(key, start);
      return start;
    }

    // Calcular todas las fechas de inicio
    ProjecTasks.forEach((t) => computeStart(t));

    // Fecha máxima de fin (defensivo por si falta alguna en el mapa)
    let maxEnd = new Date(baseDate);
    for (const t of ProjecTasks) {
      const key = getKey(t);
      if (!key) continue;

      const s = startDates.get(key) ?? baseDate;
      const end = new Date(
        s.getTime() + Number(t.dias_para_resolver || 1) * MS_PER_DAY
      );
      if (end > maxEnd) maxEnd = end;
    }

    const totalDays =
      Math.max(
        1,
        Math.ceil((maxEnd.getTime() - baseDate.getTime()) / MS_PER_DAY)
      ) || 1;

    const dayWidth = 100 / totalDays;

    const rows: GanttRowVM[] = ProjecTasks.map((t) => {
      const key = getKey(t);
      const start = startDates.get(key) ?? baseDate;

      const baseId = (t.codigo || key).split("-").pop() || (t.codigo || key);
      const isCritical = criticalPathIds.includes(baseId);

      let offsetDays = Math.round(
        (start.getTime() - baseDate.getTime()) / MS_PER_DAY
      );
      if (offsetDays < 0) offsetDays = 0;

      const offsetPercent = offsetDays * dayWidth;
      const barPercent = Math.max(
        1,
        Number(t.dias_para_resolver || 1) * dayWidth
      );

      return {
        id: t.id ?? key,
        baseId,
        name: t.nombre_tarea ?? "Sin tarea",
        dependencyBaseId: t.dependencia
          ? t.dependencia
          : undefined,
        isCritical,
        offsetPercent,
        barPercent,
      };
    });

    return { totalDays, rows };
  }, [ProjecTasks, criticalPathIds, baseDate]);


  if (loading) {
    return (
      <section className="gantt-root">
        <p className="gantt-subtitulo">Calculando ruta crítica...</p>
      </section>
    );
  }

  return (
    <section className="gantt-root">
      <h1 className="gantt-titulo">Cronograma y Ruta Crítica</h1>
      <p className="gantt-subtitulo">
        Visualización secuencial de tareas y dependencias para el proyecto: {project.nombre_proyecto}.
      </p>

      {/* Leyenda */
}
      <div className="gantt-leyenda">
        <span className="gantt-leyenda-item gantt-leyenda-item--critica">
          <span className="gantt-leyenda-dot gantt-leyenda-dot--critica" />Ruta Crítica (Bloqueante)</span>
        <span className="gantt-leyenda-item gantt-leyenda-item--normal">
          <span className="gantt-leyenda-dot gantt-leyenda-dot--normal" />Tarea Normal</span>
      </div>

      {/* Contenedor del Gantt */
}
      <div className="gantt-contenedor">
        <div className="gantt-encabezado-row">
          <div className="gantt-encabezado-tarea">Tarea</div>
          <div className="gantt-encabezado-cronograma">
            Cronograma (Total {totalDays} días)
          </div>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="gantt-fila">
            <div className="gantt-celda-tarea">
              <span className="gantt-tarea-id">[{row.baseId}]</span>
              {row.name}
              {row.dependencyBaseId && (
                <span className="gantt-tarea-dependencia">(Depende de {row.dependencyBaseId})</span>
              )}
            </div>
            <div className="gantt-celda-cronograma">
              <div className={"gantt-barra " + (row.isCritical ? "gantt-barra--critica" : "gantt-barra--normal")
                }
                style={{
                  left: `${row.offsetPercent}%`,
                  width: `${row.barPercent}%`,
                }}
              />
            </div>
          </div>
        ))}

        {!rows.length && (
          <div className="gantt-vacio">
            No hay tareas para mostrar en el cronograma.
          </div>
        )}
      </div>
    </section>
  );
};
