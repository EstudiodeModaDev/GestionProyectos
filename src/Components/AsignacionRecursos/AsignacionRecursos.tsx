// src/components/ResourceAllocation/ResourceAllocation.tsx
import * as React from "react";
import "./AsignacionRecursos.css";
import type { ProjectSP } from "../../models/Projects";
import { useGraphServices } from "../../graph/graphContext";
import { useTasks } from "../../Funcionalidades/Tasks";
import type { TaskApertura } from "../../models/AperturaTienda";

export type ResourceLoadRow = {
  name: string;
  totalTasks: number;
  criticalTasks: number;
  loadPercent: number;
};

type ResourceAllocationProps = {
  project: ProjectSP;
};

// Construye las filas a partir de las tareas y los IDs de la ruta crítica
function buildRowsFromTasks(tasks: TaskApertura[], CRITICAL_PATH_IDS: string[]): ResourceLoadRow[] {
  const totalProjectTasks = tasks.length;
  if (totalProjectTasks === 0) return [];

  const map = new Map<string, { totalTasks: number; criticalTasks: number }>();

  for (const t of tasks) {
    const key = t.Responsable || t.CorreoResponsable || "Sin responsable";

    if (!map.has(key)) {
      map.set(key, { totalTasks: 0, criticalTasks: 0 });
    }

    const agg = map.get(key)!; 
    agg.totalTasks++;

    const baseCode = t.Codigo;
    if (baseCode && CRITICAL_PATH_IDS.includes(baseCode)) {
      agg.criticalTasks++;
    }
  }

  const rows: ResourceLoadRow[] = [];
  map.forEach((agg, name) => {const loadPercent = Math.round((agg.totalTasks / totalProjectTasks) * 100);

    rows.push({
      name,
      totalTasks: agg.totalTasks,
      criticalTasks: agg.criticalTasks,
      loadPercent,
    });
  });

  return rows;
}

export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({project,}) => {
    const { tasks } = useGraphServices();
    const { loadProyecTasks, task: tareas, getCritialPaths } = useTasks(tasks);

    const [criticalPathsIds, setCriticalPathsIds] = React.useState<string[]>([]);

    // Carga tareas + ruta crítica del proyecto
    React.useEffect(() => {
        if (!project.Id) return;

        let cancel = false;

        (async () => {
            await loadProyecTasks(project.Id!);
            if (cancel) return;

            const crit = await getCritialPaths(project.Id!);
            if (cancel) return;

            setCriticalPathsIds(crit ?? []);
        })();

        return () => {
        cancel = true;
        };
    }, [loadProyecTasks, getCritialPaths, project.Id]);

    // Construir rows en base a las tareas y la ruta crítica
    const rows = React.useMemo(
        () => buildRowsFromTasks(tareas as TaskApertura[], criticalPathsIds),
        [tareas, criticalPathsIds]
    );

    const getBadgeClass = (loadPercent: number) => {
        if (loadPercent >= 60) return "resource-allocation__load-badge--high";
        if (loadPercent >= 30) return "resource-allocation__load-badge--medium";
        return "resource-allocation__load-badge--low";
    };

    return (
        <section className="resource-allocation">
            <header className="resource-allocation__header">
                <h1 className="resource-allocation__title">Asignación de Recursos</h1>
                <p className="resource-allocation__subtitle">Visualización de la carga de trabajo por recurso en el proyecto {project.Title}</p>
            </header>

            <div className="resource-allocation__card">
                <table className="resource-allocation__table">
                    <thead className="resource-allocation__table-head">
                        <tr>
                            <th className="resource-allocation__th">Responsable</th>
                            <th className="resource-allocation__th">Total Tareas Asignadas</th>
                            <th className="resource-allocation__th">Tareas Críticas</th>
                            <th className="resource-allocation__th">Carga de Trabajo (%)</th>
                        </tr>
                    </thead>
                    <tbody className="resource-allocation__table-body">
                        {rows.map((row) => (
                            <tr key={row.name} className="resource-allocation__row">
                                <td className="resource-allocation__cell resource-allocation__cell--primary">{row.name}</td>
                                <td className="resource-allocation__cell">{row.totalTasks}</td>
                                <td className="resource-allocation__cell">{row.criticalTasks}</td>
                                <td className="resource-allocation__cell">
                                    <span className={"resource-allocation__load-badge " + getBadgeClass(row.loadPercent)}>{row.loadPercent}%</span>
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr className="resource-allocation__row">
                                <td className="resource-allocation__cell" colSpan={4} style={{ textAlign: "center", fontStyle: "italic" }}>
                                    No hay recursos asignados en este proyecto.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
