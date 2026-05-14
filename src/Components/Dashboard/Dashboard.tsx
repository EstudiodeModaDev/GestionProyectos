import React from "react";
import type { Kpm, ProjectSP } from "../../models/Projects";

import "./Dashboard.css"
import { ParseDateShow } from "../../utils/Date";
import { NuevoProyectoModal } from "../NuevoProyectoModal/NuevoProyectoModal";
import { RenombrarProyectoModal } from "../EditarNombre/EditarNombreModal";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useProjects } from "../../Funcionalidades/Projects/useProjects";
import { useTaskResponsables } from "../../Funcionalidades/taskResponsible/useTaskResponsables";
import { Link } from "react-router-dom";
import { useRepositories } from "../../repositories/repositoriesContext";

const normalizeEstado = (estado?: string | null) =>
  (estado ?? "").toLocaleLowerCase().trim();

/**
 * Presenta el tablero principal con KPIs y resumen de proyectos.
 *
 * @returns Vista general de proyectos activos, cerrados y metricas operativas.
 */
export const Dashboard: React.FC = () => {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<ProjectSP | null>(null);
  const [add, setAdd] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);
  const repositories = useRepositories();
  const {rows: projects, loadAll, archiveProject} = useProjects();
  const {loadTasksOnGoing, onGoingTasks} = useTasks(repositories.projectTasks!);


  const activeProjects = projects.filter(p => normalizeEstado(p.estado) === "en curso");
  const closedProjects = projects.filter(p => normalizeEstado(p.estado ?? "")=== "cerrado" || normalizeEstado(p.estado) === "cancelado");

  const taskIds = React.useMemo(
    () => onGoingTasks.map((task) => String(task.id ?? "").trim()).filter(Boolean),
    [onGoingTasks]
  );

  const { responsablesByTaskId } = useTaskResponsables(taskIds);

  

  /**
   * Cuenta las tareas activas cuya fecha de resolucion ya vencio.
   *
   * @returns Cantidad de tareas atrasadas.
   */
  function getOverdueTasksCount() {
      const today = new Date();
      return onGoingTasks.filter(t => t.Estado !== "Completada" && new Date(t.FechaResolucion!) < today).length;
  }

  

  /**
   * Calcula el porcentaje de tareas activas que siguen dentro del tiempo esperado.
   *
   * @returns Texto con el porcentaje o un mensaje cuando no hay tareas activas.
   */
  function getProjectsOnTimePercent() {
    if(onGoingTasks.length === 0) return "No hay tareas activas"

    const overDue = getOverdueTasksCount()

    const onTime = onGoingTasks.length - overDue

    const percent = Math.round((onTime / onGoingTasks.length) * 100)

    return `${percent}%`;
  }

  const activeProjectIds = React.useMemo(() => activeProjects.map(p => p.id).join("|"), [activeProjects]);

  const unassignedByProject = React.useMemo(() => {
    const map: Record<string, number> = {};

    onGoingTasks.forEach((t) => {
      const projectId = String(t.id_proyecto ?? "").trim();
      const taskId = String(t.id ?? "").trim();
      if (!projectId || !taskId) return;

      const isUnassigned = !(responsablesByTaskId[taskId]?.length);
      map[projectId] = (map[projectId] ?? 0) + (isUnassigned ? 1 : 0);
    });

    return map;
  }, [onGoingTasks, responsablesByTaskId]);

  React.useEffect(() => {
    if (activeProjects.length > 0) {
      loadTasksOnGoing(activeProjects);
    }
  }, [activeProjectIds]);

  const kpisCalc: Kpm[] = React.useMemo(() => { const overdue = getOverdueTasksCount();

    return [
      {
        label: "Tareas atrasadas",
        value: onGoingTasks.length === 0 ? "0" : String(overdue),
        tone: "danger",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-red-700"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.85 3.375 2.757 3.375h14.808c1.907 0 3.623-1.875 2.757-3.375L19.5 8.498a1.25 1.25 0 00-2.165 0L12 15.148m0 0l-4.135-7.394a1.25 1.25 0 00-2.165 0L4.5 16.501"></path></svg>,
      },
      {
        label: "Tareas a tiempo / cerradas a tiempo",
        value: onGoingTasks.length === 0 ? "No hay proyectos en curso" : getProjectsOnTimePercent(),
        tone: "success",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-green-700"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      },
    ];
  }, [onGoingTasks]);

  

  /**
   * Abre o cierra el menu contextual de una tarjeta de proyecto.
   *
   * @param e - Evento del clic.
   * @param id - Identificador del proyecto cuyo menu se alterna.
   */
  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(prev => (prev === id ? null : id));
  };

  

  /**
   * Archiva o cierra un proyecto desde el menu contextual.
   *
   * @param e - Evento del clic.
   * @param id - Identificador del proyecto a actualizar.
   */
  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await archiveProject(id)
    loadAll()
    setOpenDropdownId(null)
  };

  

  /**
   * Traduce el tono del KPI a la clase visual correspondiente.
   *
   * @param tone - Variante semantica del indicador.
   * @returns Clase CSS asociada al tono.
   */
  const kpiToneClass = (tone: Kpm["tone"]) => {
    switch (tone) {
      case "danger":
        return "kpi--danger"; // si quieres estilos extra por tono
      case "success":
        return "kpi--success";
      default:
        return "";
    }
  };

  return (
    <section className="app-main__surface">
      <header>
        <h1 className="dash__title">Dashboard</h1>
      </header>

      {/* KPIs */
}
      <div className="dash__kpis">
        {kpisCalc.map((kpm, idx) => (
          <article key={idx} className={`kpi ${kpiToneClass(kpm.tone)}`}>
            <div className="kpi__icon">{kpm.icon}</div>
            <div>
              <div className="kpi__label">{kpm.label}</div>
              <div className="kpi__value">{kpm.value}</div>
            </div>
          </article>
        ))}
      </div>

      {/* Botón + título proyectos activos */
}
      <div className="dash__projects-header">
        <button type="button" className="btn btn--primary" onClick={() => setAdd(true)}>
          <span>+ Nueva Apertura</span>
        </button>
        <h2 className="dash__title" style={{ fontSize: "1.3rem" }}>
          Proyectos activos ({activeProjects.length})
        </h2>
      </div>

      {/* Cards de proyectos activos */
}
      <div className="dash__projects-grid">
        {activeProjects.map(p => (
          <article key={p.id} className="card card--accent">
            {/* Menú contextual */
}
            <div className="card__menu">
              <button type="button" className="btn btn--ghost" style={{ padding: 4, borderRadius: 999 }} onClick={e => handleMenuClick(e, p.id ?? "")}>
                <span>⋮</span>
              </button>

              {openDropdownId === p.id && (
                <div className="card__menu-panel" onClick={e => e.stopPropagation()}>
                  <button type="button" className="card__menu-item" onClick={() => {setSelected(p ?? ""); setOpenDropdownId(null); setEdit(true)}}>
                    Renombrar proyecto
                  </button>
                  <button type="button" className="card__menu-item" onClick={(e) => {handleArchive(e, p.id ?? "") }}>
                    Archivar / Cerrar
                  </button>
                </div>
              )}
            </div>

            <Link to={`/kanban/${p.id}`} style={{ all: "unset", display: "block", cursor: "pointer" }}>
                <h3 className="card__title">{p.nombre_proyecto}</h3>
                <p className="card__meta">Líder: {p.lider}</p>
                <p className="card__meta">Tareas sin asignar: {unassignedByProject[p.id ?? ""] ?? 0}</p>

                <div className="card__progress-label">
                  <span>Progreso</span>
                  <span>{p.progreso}%</span>
                </div>
                <div className="card__progress-track">
                  <div className="card__progress-bar" style={{ width: `${p.progreso}%` }}/>
                </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Proyectos cerrados */
}
      <div style={{ marginTop: 32 }}>
        <h2 className="dash__title" style={{ fontSize: "1.3rem" }}>
          Proyectos ({closedProjects.length})
        </h2>

        <div className="dash__table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Fecha de inicio</th>
                <th>Fecha de cierre</th>
                <th>Cumplimiento</th>
                <th>Análisis</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}> 
                  <td>{p.nombre_proyecto} ({p.estado})</td>
                  <td>{ParseDateShow(p.fecha_inicio)}</td>
                  <td>
                    <span className={Number(p.progreso) === 100 ? "badge badge--ok" : "badge badge--info"}>
                      {p.progreso ?? "-"}%
                    </span>
                  </td>
                  <td>
                    {
                    <Link type="button" className="btn btn--ghost-primary btn--ghost" style={{ paddingInline: 10, paddingBlock: 4, fontSize: "0.75rem" }} to={`/metrics/${p.id}`}>
                      Ver fugas
                    </Link>
                    }
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                    No hay ningun proyecto cerrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NuevoProyectoModal open={add} onClose={() => {setAdd(false), loadAll()}}/>
      <RenombrarProyectoModal open={edit} onClose={() => {setEdit(false), loadAll()}} Selected={selected!}/>
    </section>
  );
};
