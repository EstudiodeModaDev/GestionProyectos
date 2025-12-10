// src/components/KanbanApertura.tsx
import React from "react";
import "./Kanban.css"; // reutiliza las clases que ya tienes (kanban-column, kanban-task, etc.)
import type { ProjectSP } from "../../models/Projects";
import type { TaskApertura } from "../../models/AperturaTienda";
import { useGraphServices } from "../../graph/graphContext";
import { useTasks } from "../../Funcionalidades/Tasks";
import { ParseDateShow } from "../../utils/Date";
import {TaskDetailModal} from "../DetallesTarea/DetallesTarea"
import { useProjects } from "../../Funcionalidades/Proyectos";

export type KanbanEstado = "Pendiente" | "En Proceso" | "Completada";

export type KanbanPhase = {
  id: number;   // debe coincidir con task.Phase
  name: string; // nombre bonito de la fase
};

type Props = {
  project: ProjectSP;
  responsablesMap?: Record<string, string>;
  onCreateTask?: () => void;
  onAlert?: (msg: string) => void;
  fases: KanbanPhase[];   
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const KanbanApertura: React.FC<Props> = ({project, responsablesMap, onCreateTask, onAlert, fases}) => {
  const { tasks, proyectos} = useGraphServices();
  const { task: rows, estado, search, responsable, loading,
    loadProyecTasks, setEstado, setResponsable, setSearch, updateTaskPhase, searchPredecessor, searchSuccesor, selfAssign, setComplete } = useTasks(tasks);
  const { updatePorcentaje } = useProjects(proyectos);
  const [detalles, setDetalles] = React.useState<boolean>(false)
  const [selectedTask, setSelectedTask] = React.useState<TaskApertura | null>(null)
  const [predesesor, setPredecesor] = React.useState<TaskApertura | null>(null)
  const [sucessors, setSurcessors] = React.useState<TaskApertura[]>([])

  // cuando cambien las tareas (o el proyecto), reseteamos
  React.useEffect(() => {
    loadProyecTasks(project.Id ?? "")
  }, [tasks, project.Id, estado, search, responsable,]);

  React.useEffect(() => {
    if (!selectedTask) {
      setPredecesor(null);
      return;
    }

    if (!selectedTask.Dependencia) {
      setPredecesor(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const predecessorTask = await searchPredecessor(selectedTask.Dependencia || "");
      const sucessorsTasks = await searchSuccesor(selectedTask.Codigo || "");
      
      if (!cancelled) {
        setPredecesor(predecessorTask);
        setSurcessors(sucessorsTasks);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTask, searchPredecessor]);

  const handleAssignToMe = React.useCallback(
  async (task: TaskApertura) => {
    await selfAssign(task.Id!);
    await loadProyecTasks(task.IdProyecto!);  // refresca MIS rows
  },
  [selfAssign, loadProyecTasks]
  );

  const handleCompleteTask = React.useCallback(
    async (task: TaskApertura) => {
      const data = await setComplete(task);
      if (data.ok) {
        await updatePorcentaje(task.IdProyecto!, data.percent);
      }
      await loadProyecTasks(task.IdProyecto!);  // refresca MIS rows
    },
    [setComplete, updatePorcentaje, loadProyecTasks]
  );

  const getTaskById = React.useCallback(
    (id?: string | null) =>
      id ? rows.find((t) => String(t.Id) === id || t.Id === id) ?? null : null,
    [rows]
  );

  /* ========= DUE DATE ========= */

  function getDueInfo(task: TaskApertura) {
    if (task.Estado === "Completada" || !task.FechaResolucion) {
      return { dotClass: "kb-due-dot--neutral", label: "" };
    }

    const today = new Date();
    const due = new Date(task.FechaResolucion);
    const diffDays = Math.round(
      (due.getTime() - today.getTime()) / MS_PER_DAY
    );

    if (diffDays < 0) {
      return { dotClass: "kb-due-dot--over", label: "Vencido" };
    }
    if (diffDays <= 7) {
      return { dotClass: "kb-due-dot--soon", label: "Próximo" };
    }
    return { dotClass: "kb-due-dot--ok", label: "A tiempo" };
  }

  /* ========= DRAG & DROP ========= */

  const handleDragStart = (ev: React.DragEvent<HTMLDivElement>, task: TaskApertura) => {
    // si tiene dependencia, valida que la predecesora esté "Completada"
    if (task.Dependencia) {
      const parent = getTaskById(task.Dependencia);
      const blocked = !parent || parent.Estado !== "Completada";

      if (blocked && task.Estado !== "Completada") {
        ev.preventDefault();
        const msg = `Tarea BLOQUEADA: "${task.Title}" depende de que "${
          parent ? parent.Title : task.Dependencia
        }" esté en estado "Completada".`;
        onAlert ? onAlert(msg) : window.alert(msg);
        return;
      }
    }

    ev.dataTransfer.setData("text/plain", String(task.Id));
    ev.currentTarget.classList.add("kb-task--dragging");
  };

  const handleDragEnd = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.currentTarget.classList.remove("kb-task--dragging");
  };

  const handleDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>, targetPhase: string,  projectId: string) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    if (!id) return;

    updateTaskPhase(id, targetPhase, projectId, )
  };

  const handleClick = React.useCallback(async (task: TaskApertura) => {
    setSelectedTask(task); 
    setDetalles(true)
  }, [searchPredecessor, tasks, selectedTask]);

  /* ========= RENDER ========= */

  const allResponsablesKeys = Array.from(new Set(rows.map((t) => t.CorreoResponsable).filter(Boolean)));

  if(loading){
    return (
        <p>Cargando tareas del proyecto...</p>
    )
  }

  return (
    <div className="kb-root">
      {/* HEADER PROYECTO */}
      <header className="kb-header">
        <div>
          <h1 className="kb-project-title">{project.Title}</h1>
          <p className="kb-project-id">ID proyecto: {project.Id}</p>
        </div>

        <div className="kb-project-status">
          <div className="kb-pill"><span>{project.Estado ?? "En curso"}</span></div>
          <div className="kb-pill"><span>{project.Progreso ?? 0}%</span></div>
          <div className="kb-pill"><span>{ParseDateShow(project.FechaInicio) ?? ""}</span></div>
        </div>
      </header>

      {/* TOOLBAR */}
      <section className="kb-toolbar">
        <div className="kb-filter--search">
          <input type="text" placeholder="Buscar tarea por nombre o código…" value={search} onChange={(e) => setSearch(e.target.value)} className="filter-text"/>
        </div>

        <div className="kb-filter">
          <select value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            <option value="all">Todos los responsables</option>
            {allResponsablesKeys.map((mail) => (
              <option key={mail} value={mail}>
                {responsablesMap?.[mail] ?? mail}
              </option>
            ))}
          </select>
        </div>

        <div className="kb-toolbar-right">
          <label className="kb-toggle">
            <input type="checkbox" checked={estado} onChange={() => {setEstado((v) => !v)}}/>
            <span className="kb-toggle-slider" />
            <span className="kb-toggle-label">Ver terminadas</span>
          </label>

          <button type="button" className="btn btn--primary" onClick={onCreateTask}>
            + Tarea
          </button>
        </div>
      </section>

      {/* BOARD */}
      <section className="kb-board">
        {fases.map((phase) => {
          const tasksInPhase = rows.filter((t) => t.Phase.toLowerCase().trim() === phase.name.toLowerCase());

          return (
            <div key={phase.name} className="kanban-column">
              <header className="kb-column-header">
                <span className="kb-column-title">{phase.name}</span>
                <span className="kb-column-badge">{tasksInPhase.length}</span>
              </header>

              <div className="kb-column-body" onDragOver={handleDragOver} onDrop={(ev) => handleDrop(ev, phase.name, project.Id ?? "")}>
                {tasksInPhase.map((task) => {
                  const isCritical = task.TipoTarea === "Critica";
                  const parent = getTaskById(task.Dependencia ?? undefined);
                  const isBlocked =
                    !!task.Dependencia &&
                    (!parent || parent.Estado !== "Completada");

                  let borderClass = "kb-task--normal";
                  if (task.Estado === "Completada") borderClass = "kb-task--done";
                  else if (task.Estado === "En Proceso")
                    borderClass = "kb-task--in-progress";
                  if (isCritical && task.Estado !== "Completada")
                    borderClass = "kb-task--critical";

                  const dueInfo = getDueInfo(task);
                  const respLabel =
                    responsablesMap?.[task.CorreoResponsable] ??
                    task.Responsable;

                  return (
                    <div key={task.Id} id={String(task.Id)} className={`kanban-task ${borderClass}`} onClick={() => {handleClick(task)}} draggable onDragStart={(ev) => handleDragStart(ev, task)} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
                      <div className="kb-task-header">
                        <p className="kb-task-title">
                          <span className="kb-task-id">
                            [{task.Codigo || task.Id}]
                          </span>
                          {task.Title}
                        </p>
                      </div>

                      <p className="kb-task-resp">
                        Responsable:{" "}
                        <span className="badge-resp">{respLabel}</span>
                      </p>

                      <div className="kb-task-footer">
                        <div>
                          {isBlocked && (
                            <span className="chip-blocked">BLOQUEADA</span>
                          )}
                          {isCritical && !isBlocked && (
                            <span className="chip-blocked" style={{ backgroundColor: "#b91c1c" }}>
                              CRÍTICA
                            </span>
                          )}
                        </div>

                        <div className="kb-task-due">
                          <span className="kb-task-due-date">
                            {ParseDateShow(task.FechaResolucion) || "Sin fecha"}
                          </span>
                          <span
                            className={`due-dot ${dueInfo.dotClass}`}
                            title={dueInfo.label}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasksInPhase.length === 0 && (
                  <div className="kb-column-empty">
                    Sin tareas en esta fase.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <TaskDetailModal open={detalles} task={selectedTask} phases={fases} onClose={() => setDetalles(false)} predecessor={predesesor} successors={sucessors} onGoToTask={(task: TaskApertura) => { setSelectedTask(task); } } onAssignToMe={handleAssignToMe} onCompleteTask={handleCompleteTask}/>
    </div>
  );
};

export default KanbanApertura;
