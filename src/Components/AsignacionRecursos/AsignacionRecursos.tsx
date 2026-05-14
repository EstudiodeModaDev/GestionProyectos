// src/components/ResourceAllocation/ResourceAllocation.tsx
import * as React from "react";
import "./AsignacionRecursos.css";
import type { ProjectSP } from "../../models/Projects";
import type { projectTasks, taskResponsible } from "../../models/AperturaTienda";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useRepositories } from "../../repositories/repositoriesContext";

export type ResourceLoadRow = {
  name: string;
  totalTasks: number;
  criticalTasks: number;
  loadPercent: number;
};

type ResourceAllocationProps = {
  project: ProjectSP;
};

/**
 * Normaliza un correo para usarlo como clave de agregacion.
 *
 * @param s - Correo a normalizar.
 * @returns Correo en minusculas y sin espacios.
 */
const normMail = (s?: string | null) => (s ?? "").trim().toLowerCase();

/**
 * Construye las filas a partir de:
 * - tasks del proyecto (ProjectTasks)
 * - codigos de ruta critica (criticalCodes)
 * - responsables por tarea (ResponsableTarea -> map taskId -> responsables[])
 *
 * Nota: Aqui usamos "full count": si una tarea tiene 2 responsables, cuenta 1 para cada uno.
 */
function buildRowsFromTasks(tasks: projectTasks[], criticalCodes: string[], responsablesByTaskId: Record<string, taskResponsible[]>): ResourceLoadRow[] {
  const totalProjectTasks = tasks.length;
  if (!totalProjectTasks) return [];

  const map = new Map<string, { totalTasks: number; criticalTasks: number }>();

  for (const t of tasks) {
    const taskId = String(t.id ?? "").trim();
    const responsables = taskId ? (responsablesByTaskId[taskId] ?? []) : [];

    const isCritical = !!t.codigo && criticalCodes.includes(t.codigo);

    if (!responsables.length) {
      const key = "Sin responsable";
      if (!map.has(key)) map.set(key, { totalTasks: 0, criticalTasks: 0 });
      const agg = map.get(key)!;
      agg.totalTasks += 1;
      if (isCritical) agg.criticalTasks += 1;
      continue;
    }

    for (const r of responsables) {
      const key = (r.nombre ?? "").trim() || normMail(r.correo) || "Sin responsable";

      if (!map.has(key)) map.set(key, { totalTasks: 0, criticalTasks: 0 });
      const agg = map.get(key)!;
      agg.totalTasks += 1;
      if (isCritical) agg.criticalTasks += 1;
    }
  }

  const rows: ResourceLoadRow[] = [];
  map.forEach((agg, name) => {
    const loadPercent = Math.round((agg.totalTasks / totalProjectTasks) * 100);
    rows.push({
      name,
      totalTasks: Math.round(agg.totalTasks),
      criticalTasks: Math.round(agg.criticalTasks),
      loadPercent,
    });
  });

  rows.sort((a, b) => b.loadPercent - a.loadPercent);
  return rows;
}

/**
 * Muestra la distribucion de carga por responsable dentro del proyecto.
 *
 * @param props - Proyecto sobre el que se calcula la asignacion.
 * @returns Tabla con tareas asignadas, criticidad y porcentaje de carga.
 */
export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({ project }) => {
  const repositories = useRepositories()

  // tasks hook
  const { loadProjectTasks, tasks: projectTasksList, critical } = useTasks(repositories.projectTasks!);

  // ruta critica
  const [criticalCodes, setCriticalCodes] = React.useState<string[]>([]);

  // responsables por tarea
  const [respByTaskId, setRespByTaskId] = React.useState<Record<string, taskResponsible[]>>({});
  const [respLoading, setRespLoading] = React.useState(false);
  const [respError, setRespError] = React.useState<string | null>(null);

  // clave estable basada en los IDs de las tareas para evitar loops
  const tasksKey = React.useMemo(() => {
    const ids = (projectTasksList ?? [])
      .map((t) => String(t.id ?? "").trim())
      .filter(Boolean)
      .sort();
    return ids.join("|");
  }, [projectTasksList]);

  // referencia directa al service (mas estable que depender de "graph" completo)
  const responsableSvc = repositories.projectTaskReponsible;

  /* ==========================
     1) Cargar tareas + ruta critica
     - Depende SOLO del project.Id y loadProjectTasks
  ========================== */
  React.useEffect(() => {
    const pid = project.id;
    if (!pid) return;

    let cancel = false;

    (async () => {
      await loadProjectTasks(pid);
      if (cancel) return;

      // OJO: no metemos critical/getCriticalCodes en deps para evitar loops por referencia
      const crit = await critical.getCriticalCodes(pid);
      if (cancel) return;

      setCriticalCodes(crit ?? []);
    })();

    return () => {
      cancel = true;
    };
  }, [project.id, loadProjectTasks]);

  /* ==========================
     2) Cargar responsables del proyecto basado en tasksKey
     - Evita bucles aunque projectTasksList cambie de referencia
  ========================== */
  React.useEffect(() => {
    const pid = project.id;
    if (!pid) return;

    const ids = tasksKey ? tasksKey.split("|").filter(Boolean) : [];
    if (!ids.length) {
      setRespByTaskId({});
      return;
    }

    let cancel = false;

    (async () => {
      setRespLoading(true);
      setRespError(null);

      try {
        const CHUNK = 20;

        const map: Record<string, taskResponsible[]> = {};

        for (let i = 0; i < ids.length; i += CHUNK) {
          const part = ids.slice(i, i + CHUNK);

          const rows = await responsableSvc?.loadResponsible({tarea_ids: part});

          for (const r of rows ?? []) {
            const taskId = String((r as any).IdTarea ?? "").trim();
            if (!taskId) continue;
            (map[taskId] ||= []).push(r);
          }
        }

        if (!cancel) setRespByTaskId(map);
      } catch (e: any) {
        if (!cancel) {
          setRespByTaskId({});
          setRespError(e?.message ?? "Error cargando responsables del proyecto");
        }
      } finally {
        if (!cancel) setRespLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [project.id, tasksKey, responsableSvc]);

  /* ==========================
     3) Construir rows (memo)
  ========================== */
  const rows = React.useMemo(
    () => buildRowsFromTasks(projectTasksList as projectTasks[], criticalCodes, respByTaskId),
    [projectTasksList, criticalCodes, respByTaskId]
  );

  /**
   * Determina la clase visual del indicador de carga.
   *
   * @param loadPercent - Porcentaje de carga calculado.
   * @returns Clase CSS asociada al rango de carga.
   */
  const getBadgeClass = (loadPercent: number) => {
    if (loadPercent >= 60) return "resource-allocation__load-badge--high";
    if (loadPercent >= 30) return "resource-allocation__load-badge--medium";
    return "resource-allocation__load-badge--low";
  };

  return (
    <section className="resource-allocation">
      <header className="resource-allocation__header">
        <h1 className="resource-allocation__title">Asignación de Recursos</h1>
        <p className="resource-allocation__subtitle">
          Visualización de la carga de trabajo por recurso en el proyecto {project.nombre_proyecto}
        </p>
        {respError ? (
          <p className="resource-allocation__subtitle" style={{ color: "#b91c1c" }}>
            {respError}
          </p>
        ) : null}
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
            {respLoading ? (
              <tr className="resource-allocation__row">
                <td className="resource-allocation__cell" colSpan={4} style={{ textAlign: "center" }}>
                  Cargando responsables...
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row) => (
                  <tr key={row.name} className="resource-allocation__row">
                    <td className="resource-allocation__cell resource-allocation__cell--primary">
                      {row.name}
                    </td>
                    <td className="resource-allocation__cell">{row.totalTasks}</td>
                    <td className="resource-allocation__cell">{row.criticalTasks}</td>
                    <td className="resource-allocation__cell">
                      <span className={"resource-allocation__load-badge " + getBadgeClass(row.loadPercent)}>
                        {row.loadPercent}%
                      </span>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr className="resource-allocation__row">
                    <td
                      className="resource-allocation__cell"
                      colSpan={4}
                      style={{ textAlign: "center", fontStyle: "italic" }}
                    >
                      No hay recursos asignados en este proyecto.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
