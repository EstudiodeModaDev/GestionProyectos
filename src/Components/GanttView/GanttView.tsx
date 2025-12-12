import * as React from "react";
import "./GanttView.css";
import { useGraphServices } from "../../graph/graphContext";
import { useTasks } from "../../Funcionalidades/Tasks";
import type { ProjectSP } from "../../models/Projects";
import type { TaskApertura } from "../../models/AperturaTienda";

type GanttViewProps = {
  project: ProjectSP;
};

type GanttRowVM = {
  id: string;
  baseId: string;
  name: string;
  dependencyBaseId?: string;
  isCritical: boolean;
  offsetPercent: number;
  barPercent: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const GanttView: React.FC<GanttViewProps> = ({ project }) => {
  const { tasks: tasksSvc } = useGraphServices();
  const {loadProyecTasks, task, getCritialPaths, loading,} = useTasks(tasksSvc);
  const [criticalPathIds, setCriticalPathsId] = React.useState<string[]>([]);

  //Fecha inicial del proyecto o por defecto fecha actual
  const baseDate = React.useMemo(
    () =>
      project.FechaInicio
        ? new Date(project.FechaInicio)
        : new Date(),
    [project.FechaInicio]
  );

  // Cargar tareas del proyecto activo + ruta crítica
  React.useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        await loadProyecTasks(project.Id!);
        const critical = await getCritialPaths(project.Id!);
        if (!cancel) {
          setCriticalPathsId(critical);
        }
      } catch (e) {
        if (!cancel) console.error("Error cargando tareas:", e);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [loadProyecTasks, getCritialPaths, project.Id]);

  const { totalDays, rows } = React.useMemo(() => {
    if (!task.length) {
      return { totalDays: 0, rows: [] as GanttRowVM[] };
    }

    const tasksByCodigo = new Map<string, TaskApertura>();
    task.forEach((t) => {
      if (t.Codigo) tasksByCodigo.set(t.Codigo, t);
    });

    const startDates = new Map<string, Date>();
    const getKey = (t: TaskApertura) => t.Codigo || t.Id || "";

    function computeStart(t: TaskApertura): Date {
      const key = getKey(t);
      if (!key) return baseDate;

      const cached = startDates.get(key);
      if (cached) return cached;

      let start = new Date(baseDate);

      if (t.Dependencia) {
        const depCodigo = t.Dependencia; // ej: "T1"
        const parent =
          tasksByCodigo.get(depCodigo) ||
          task.find(
            (x) => x.Codigo === depCodigo || x.Id === depCodigo
          );

        if (parent) {
          const parentStart = computeStart(parent);
          start = new Date(
            parentStart.getTime() +
              Number(parent.Diaspararesolver || 1) * MS_PER_DAY
          );
        }
      }

      startDates.set(key, start);
      return start;
    }

    // Calcular todas las fechas de inicio
    task.forEach((t) => computeStart(t));

    // Fecha máxima de fin (defensivo por si falta alguna en el mapa)
    let maxEnd = new Date(baseDate);
    for (const t of task) {
      const key = getKey(t);
      if (!key) continue;

      const s = startDates.get(key) ?? baseDate;
      const end = new Date(
        s.getTime() + Number(t.Diaspararesolver || 1) * MS_PER_DAY
      );
      if (end > maxEnd) maxEnd = end;
    }

    const totalDays =
      Math.max(
        1,
        Math.ceil((maxEnd.getTime() - baseDate.getTime()) / MS_PER_DAY)
      ) || 1;

    const dayWidth = 100 / totalDays;

    const rows: GanttRowVM[] = task.map((t) => {
      const key = getKey(t);
      const start = startDates.get(key) ?? baseDate;

      const baseId = (t.Codigo || key).split("-").pop() || (t.Codigo || key);
      const isCritical = criticalPathIds.includes(baseId);

      let offsetDays = Math.round(
        (start.getTime() - baseDate.getTime()) / MS_PER_DAY
      );
      if (offsetDays < 0) offsetDays = 0;

      const offsetPercent = offsetDays * dayWidth;
      const barPercent = Math.max(
        1,
        Number(t.Diaspararesolver || 1) * dayWidth
      );

      return {
        id: t.Id ?? key,
        baseId,
        name: t.Title,
        dependencyBaseId: t.Dependencia
          ? t.Dependencia.split("-").pop() || t.Dependencia
          : undefined,
        isCritical,
        offsetPercent,
        barPercent,
      };
    });

    return { totalDays, rows };
  }, [task, criticalPathIds, baseDate]);


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
        Visualización secuencial de tareas y dependencias para el proyecto: {project.Title}.
      </p>

      {/* Leyenda */}
      <div className="gantt-leyenda">
        <span className="gantt-leyenda-item gantt-leyenda-item--critica">
          <span className="gantt-leyenda-dot gantt-leyenda-dot--critica" />Ruta Crítica (Bloqueante)</span>
        <span className="gantt-leyenda-item gantt-leyenda-item--normal">
          <span className="gantt-leyenda-dot gantt-leyenda-dot--normal" />Tarea Normal</span>
      </div>

      {/* Contenedor del Gantt */}
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
