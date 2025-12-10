import React from "react";
import type { Kpm, ProjectSP } from "../../models/Projects";
import { useGraphServices } from "../../graph/graphContext";
import { useProjects } from "../../Funcionalidades/Proyectos";
import "./Dashboard.css"
import { ParseDateShow } from "../../utils/Date";
import { NuevoProyectoModal } from "../NuevoProyectoModal/NuevoProyectoModal";
import { RenombrarProyectoModal } from "../EditarNombre/EditarNombreModal";
import { useTasks } from "../../Funcionalidades/Tasks";


interface DashboardProps {
  onOpenProjectKanban: (project: ProjectSP) => void;
  onShowPostClosureAnalysis: (project: ProjectSP) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({onOpenProjectKanban, onShowPostClosureAnalysis,}) => {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<ProjectSP | null>(null);
  const [add, setAdd] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);
  const {proyectos, tasks} = useGraphServices()
  const {rows: projects, loadFirstPage, archiveProject} = useProjects(proyectos)
  const {loadTasksOnGoing, onGoingTasks} = useTasks(tasks)

  const activeProjects = projects.filter(p => p.Estado.toLocaleLowerCase().trim() === "en curso");
  const closedProjects = projects.filter(p => p.Estado.toLocaleLowerCase().trim() === "cerrado" || p.Estado.toLocaleLowerCase().trim() === "cancelado");

  function getOverdueTasksCount() {
      const today = new Date();
      return onGoingTasks.filter(t =>
          t.Estado !== "Completada" &&
          new Date(t.FechaResolucion) < today
      ).length;
  }

  function getProjectsOnTimePercent() {
    if(onGoingTasks.length === 0) return "No hay tareas activas"

    const overDue = getOverdueTasksCount()

    const onTime = onGoingTasks.length - overDue

    const percent = Math.round((onTime / onGoingTasks.length) * 100)

    return `${percent}%`;
  }

  const activeProjectIds = React.useMemo(
    () => activeProjects.map(p => p.Id).join("|"),
    [activeProjects]
  );

  const unassignedByProject = React.useMemo(() => {
    const map: Record<string, number> = {};

    onGoingTasks.forEach((t) => {
      const projectId = t.IdProyecto ?? "";
      const isUnassigned = !t.CorreoResponsable; // y si quieres solo incompletas:
      // const isUnassigned = !t.CorreoResponsable && t.Estado !== "Completada";

      if (!projectId) return;
      map[projectId] = (map[projectId] ?? 0) + (isUnassigned ? 1 : 0);
    });

    return map;
  }, [onGoingTasks]);

  React.useEffect(() => {
    if (activeProjects.length > 0) {
      loadTasksOnGoing(activeProjects);
    }
  }, [loadTasksOnGoing, activeProjectIds]);

  React.useEffect(() => {
    const closeAll = () => setOpenDropdownId(null);
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  const kpisCalc: Kpm[] = React.useMemo(() => {
    const overdue = getOverdueTasksCount();

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

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(prev => (prev === id ? null : id));
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await archiveProject(e, id)
    loadFirstPage()
    setOpenDropdownId(null)
  };

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
        <p className="dash__subtitle">
          Resumen ejecutivo y métricas clave de las aperturas en curso.
        </p>
      </header>

      {/* KPIs */}
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

      {/* Botón + título proyectos activos */}
      <div className="dash__projects-header">
        <button type="button" className="btn btn--primary" onClick={() => setAdd(true)}>
          <span>+ Nueva Apertura</span>
        </button>
        <h2 className="dash__title" style={{ fontSize: "1.3rem" }}>
          Proyectos activos ({activeProjects.length})
        </h2>
      </div>

      {/* Cards de proyectos activos */}
      <div className="dash__projects-grid">
        {activeProjects.map(p => (
          <article key={p.Id} className="card card--accent">
            {/* Menú contextual */}
            <div className="card__menu">
              <button type="button" className="btn btn--ghost" style={{ padding: 4, borderRadius: 999 }} onClick={e => handleMenuClick(e, p.Id ?? "")}>
                <span>⋮</span>
              </button>

              {openDropdownId === p.Id && (
                <div className="card__menu-panel" onClick={e => e.stopPropagation()}>
                  <button type="button" className="card__menu-item" onClick={() => {setSelected(p ?? ""); setOpenDropdownId(null); setEdit(true)}}>
                    Renombrar proyecto
                  </button>
                  <button type="button" className="card__menu-item" onClick={(e) => {handleArchive(e, p.Id ?? "") }}>
                    Archivar / Cerrar
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={() => onOpenProjectKanban(p)} style={{ all: "unset", display: "block", cursor: "pointer" }}>
              <h3 className="card__title">{p.Title}</h3>
              <p className="card__meta">Líder: {p.Lider} | Entrega: {ParseDateShow(p.Fechadelanzamiento)}</p>
              <p className="card__meta">Tareas sin asignar: {unassignedByProject[p.Id ?? ""] ?? 0}</p>

              <div className="card__progress-label">
                <span>Progreso</span>
                <span>{p.Progreso}%</span>
              </div>
              <div className="card__progress-track">
                <div className="card__progress-bar" style={{ width: `${p.Progreso}%` }}/>
              </div>
            </button>
          </article>
        ))}
      </div>

      {/* Proyectos cerrados */}
      <div style={{ marginTop: 32 }}>
        <h2 className="dash__title" style={{ fontSize: "1.3rem" }}>
          Historial de proyectos cerrados ({closedProjects.length})
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
              {closedProjects.map(p => (
                <tr key={p.Id}> 
                  <td>{p.Title} ({p.Estado})</td>
                  <td>{ParseDateShow(p.FechaInicio)}</td>
                  <td>{ParseDateShow(p.Fechadelanzamiento)}</td>
                  <td>
                    <span className={p.fulfillment === 100 ? "badge badge--ok" : "badge badge--info"}>
                      {p.fulfillment ?? "-"}%
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn--ghost-primary btn--ghost" style={{ paddingInline: 10, paddingBlock: 4, fontSize: "0.75rem" }} onClick={() => onShowPostClosureAnalysis(p)}>
                      Ver fugas
                    </button>
                  </td>
                </tr>
              ))}
              {closedProjects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                    No hay proyectos cerrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NuevoProyectoModal open={add} onClose={() => {setAdd(false), loadFirstPage()}}/>
      <RenombrarProyectoModal open={edit} onClose={() => {setEdit(false), loadFirstPage()}} Selected={selected!}/>
    </section>
  );
};
