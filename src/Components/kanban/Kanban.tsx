// src/components/KanbanApertura.tsx
import React from "react";
import "./Kanban.css";
import type { ProjectSP } from "../../models/Projects";
import type { projectTasks, taskResponsible } from "../../models/AperturaTienda";
import { useGraphServices } from "../../graph/graphContext";
import { TaskDetailModal } from "../DetallesTarea/DetallesTarea";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { normalize } from "../../utils/commons";
import KanbanHeader from "./Components/Toolbar";
import KanbanCard from "./Components/KanbanCard";

export type KanbanEstado = "Pendiente" | "En Proceso" | "Completada";

export type KanbanPhase = {
  id: number;
  name: string;
};

type Props = {
  project: ProjectSP;
  responsablesMap?: Record<string, string>; // correo -> nombre (opcional)
  fases: KanbanPhase[];
};

/**
 * Renderiza el tablero Kanban de un proyecto con filtros y detalle de tareas.
 *
 * @param props - Proyecto activo, fases disponibles y mapa opcional de responsables.
 * @returns Tablero por columnas con tareas arrastrables y modal de detalle.
 */
const KanbanApertura: React.FC<Props> = ({project, responsablesMap, fases,}) => {
  const graph = useGraphServices();
  const projectTasks = useTasks(graph.tasks);

  const [detalles, setDetalles] = React.useState<boolean>(false);
  const [selectedTask, setSelectedTask] = React.useState<projectTasks | null>(null);
  const [predesesor, setPredecesor] = React.useState<projectTasks | null>(null);
  const [sucessors, setSurcessors] = React.useState<projectTasks[]>([]);
  const [respByTaskId, setRespByTaskId] = React.useState<Record<string, taskResponsible[]>>({});
  const [respLoading, setRespLoading] = React.useState(false);

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>, targetPhase: string, projectId: string) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    if (!id) return;

    void projectTasks.updateTaskPhase(id, targetPhase, projectId);
  };

  // Cargar tareas cuando cambien filtros/proyecto
  React.useEffect(() => {
    void projectTasks.loadProjectTasks(project.Id ?? "");
  }, [project.Id, projectTasks.filters.search, projectTasks.filters.responsable, projectTasks.filters.soloIncompletas,]);

  // Cargar responsables del proyecto cuando cambien las tareas o el proyecto
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const pid = project.Id ?? "";
      if (!pid) return;

      setRespLoading(true);

      try {
        const ids = (projectTasks.tasks ?? []).map((t) => String(t.Id ?? "").trim()).filter(Boolean);

        if (!ids.length) {
          if (!cancelled) setRespByTaskId({});
          return;
        }

        const CHUNK = 20;
        const map: Record<string, taskResponsible[]> = {};

        

        /**
         * Construye un filtro OData para consultar responsables por grupos de tareas.
         *
         * @param values - Identificadores de tarea incluidos en la consulta.
         * @returns Filtro combinado con clausulas `or`.
         */
        const buildOrFilter = (values: string[]) => values.map((v) => `fields/IdTarea eq '${v}'`).join(" or ");

        for (let i = 0; i < ids.length; i += CHUNK) {
          const part = ids.slice(i, i + CHUNK);
          const filter = buildOrFilter(part);

          const rows = await graph.responsableProyecto.getAll({filter, top: 10000,});

          for (const r of rows.items ?? []) {
            const taskId = String((r as any).IdTarea ?? "").trim();
            if (!taskId) continue;
            if (!map[taskId]) map[taskId] = [];
            map[taskId].push(r);
          }
        }

        if (!cancelled) setRespByTaskId(map);
      } catch (e: any) {
        if (!cancelled) {
          setRespByTaskId({});
        }
      } finally {
        if (!cancelled) setRespLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [project.Id, projectTasks.tasks, graph]);

  // Predecesor y sucesores cuando cambie la tarea seleccionada
  React.useEffect(() => {
    if (!selectedTask?.Id) {
      setPredecesor(null);
      setSurcessors([]);
      return;
    }

    let cancelled = false;

    (async () => {
      const predecessorTask = selectedTask.Dependencia ? await projectTasks.getPredecessorByCodigo(selectedTask.Dependencia || "", selectedTask.IdProyecto) : null;

      const sucessorsTasks = await projectTasks.getSuccessorsByCodigo(selectedTask.Codigo || "", selectedTask.IdProyecto);

      if (!cancelled) {
        setPredecesor(predecessorTask);
        setSurcessors(sucessorsTasks);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTask, detalles,]);

  const handleDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  const handleClick = React.useCallback((t: projectTasks) => {
    setSelectedTask(t);
    setDetalles(true);
  }, []);

  /* ========= RESPONSABLES (FILTRO + UI) ========= */

  const getTaskResponsables = React.useCallback(
    (t: projectTasks) => respByTaskId[String(t.Id ?? "")] ?? [],
    [respByTaskId]
  );

  const passesResponsableFilter = React.useCallback(
    (t: projectTasks) => {
      const selected = projectTasks.filters.responsable;
      if (!selected || selected === "all") return true;

      const selectedMail = selected.toLowerCase().trim();
      const resps = getTaskResponsables(t);
      return resps.some((r) => (r.Correo ?? "").toLowerCase().trim() === selectedMail);
    },
    [projectTasks.filters.responsable, getTaskResponsables]
  );

  if (projectTasks.loading) return <p>Cargando tareas del proyecto...</p>;

  return (
    <div className="kb-root">
      <KanbanHeader 
        project={project}
        filters={{
          search: projectTasks.filters.search,
          setSearch: (s: string) => { projectTasks.setFilters({ ...projectTasks.filters, search: s }); },
          responsable: projectTasks.filters.responsable,
          setResponsable: (r: string) => { projectTasks.setFilters({ ...projectTasks.filters, responsable: r }); },
          soloIncompletas: projectTasks.filters.soloIncompletas,
          setSoloIncompletas: (i: boolean) => { projectTasks.setFilters({ ...projectTasks.filters, soloIncompletas: i }); }
        }}
        loading={respLoading}
        respByTaskId={respByTaskId} 
        responsablesMap={responsablesMap}/>

      {/* BOARD */}
      <section className="kb-board">
        {fases.map((phase) => {
          const tasksInPhase = (projectTasks.tasks ?? [])
            .filter((t) => normalize(t.Phase) === normalize(phase.name))
            .filter(passesResponsableFilter);

          return (
            <div key={phase.name} className="kanban-column">
              <header className="kb-column-header">
                <span className="kb-column-title">{phase.name}</span>
                <span className="kb-column-badge">{tasksInPhase.length}</span>
              </header>

              <div className="kb-column-body" onDragOver={handleDragOver} onDrop={(ev) => handleDrop(ev, phase.name, project.Id ?? "")}>
                {tasksInPhase.map((task) => (
                  <KanbanCard 
                    task={task} 
                    tasks={tasksInPhase} 
                    onClick={handleClick} 
                    respByTaskId={respByTaskId} 
                    key={task.Id}
                    responsablesMap={responsablesMap}
                  />
                ))}

                {tasksInPhase.length === 0 && (
                  <div className="kb-column-empty">Sin tareas en esta fase.</div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <TaskDetailModal
        open={detalles}
        task={selectedTask}
        phases={fases}
        onClose={() => setDetalles(false)}
        predecessor={predesesor}
        successors={sucessors}
        onGoToTask={(t: projectTasks) => setSelectedTask(t)}
        onCompleteTask={projectTasks.handleCompleteTask}
        sending={projectTasks.loading}
        returnTask={projectTasks.returnTask} 
        blockTask={projectTasks.blockOrUnblockByUser}      
        />
    </div>
  );
};

export default KanbanApertura;
