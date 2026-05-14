// src/components/KanbanApertura.tsx
import React from "react";
import "./Kanban.css";
import type { ProjectSP } from "../../models/Projects";
import type { projectTasks } from "../../models/AperturaTienda";
import { TaskDetailModal } from "../DetallesTarea/DetallesTarea";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useTaskResponsables } from "../../Funcionalidades/taskResponsible/useTaskResponsables";
import { normalize } from "../../utils/commons";
import KanbanHeader from "./Components/Toolbar";
import KanbanCard from "./Components/KanbanCard";
import { useRepositories } from "../../repositories/repositoriesContext";

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
  const repositories = useRepositories();
  const projectTasks = useTasks(repositories.projectTasks!);

  const [detalles, setDetalles] = React.useState<boolean>(false);
  const [selectedTask, setSelectedTask] = React.useState<projectTasks | null>(null);
  const [predesesor, setPredecesor] = React.useState<projectTasks | null>(null);
  const [sucessors, setSurcessors] = React.useState<projectTasks[]>([]);

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>, targetPhase: string, projectId: string) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    if (!id) return;

    void projectTasks.updateTaskPhase(id, targetPhase, projectId);
  };

  // Cargar tareas cuando cambien filtros/proyecto
  React.useEffect(() => {
    void projectTasks.loadProjectTasks(project.id ?? "");
  }, [project.id, projectTasks.filters.search, projectTasks.filters.responsable, projectTasks.filters.soloIncompletas,]);

  const taskIds = React.useMemo(
    () => (projectTasks.tasks ?? []).map((task) => String(task.id ?? "").trim()).filter(Boolean),
    [projectTasks.tasks]
  );

  const {
    responsablesByTaskId: respByTaskId,
    responsablesLoading: respLoading,
  } = useTaskResponsables(taskIds);

  // Predecesor y sucesores cuando cambie la tarea seleccionada
  React.useEffect(() => {
    if (!selectedTask?.id) {
      setPredecesor(null);
      setSurcessors([]);
      return;
    }

    let cancelled = false;

    (async () => {
      const projectId = selectedTask.IdProyecto ?? selectedTask.id_proyecto ?? "";
      const predecessorTask = selectedTask.dependencia
        ? await projectTasks.getPredecessorByCodigo(selectedTask.dependencia || 0, projectId)
        : null;

      const sucessorsTasks = await projectTasks.getSuccessorsByCodigo(
        selectedTask.id_tarea_plantilla,
        projectId
      );

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

  const compareTasksByCodigo = React.useCallback((a: projectTasks, b: projectTasks) => {
    const parseTaskNumber = (codigo?: string | null) => {
      const match = String(codigo ?? "").trim().match(/^T(\d+)$/i);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    };

    const aNumber = parseTaskNumber(a.codigo);
    const bNumber = parseTaskNumber(b.codigo);

    if (aNumber !== bNumber) return aNumber - bNumber;

    return String(a.codigo ?? a.nombre_tarea ?? a.id ?? "").localeCompare(
      String(b.codigo ?? b.nombre_tarea ?? b.id ?? ""),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  }, []);

  /* ========= RESPONSABLES (FILTRO + UI) ========= */

  const getTaskResponsables = React.useCallback(
    (t: projectTasks) => respByTaskId[String(t.id ?? "")] ?? [],
    [respByTaskId]
  );

  const passesResponsableFilter = React.useCallback(
    (t: projectTasks) => {
      const selected = projectTasks.filters.responsable;
      if (!selected || selected === "all") return true;

      const selectedMail = selected.toLowerCase().trim();
      const resps = getTaskResponsables(t);
      return resps.some((r) => (r.correo ?? "").toLowerCase().trim() === selectedMail);
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
            .filter((t) => normalize(t.fase) === normalize(phase.name))
            .filter(passesResponsableFilter)
            .sort(compareTasksByCodigo);

          return (
            <div key={phase.name} className="kanban-column">
              <header className="kb-column-header">
                <span className="kb-column-title">{phase.name}</span>
                <span className="kb-column-badge">{tasksInPhase.length}</span>
              </header>

              <div className="kb-column-body" onDragOver={handleDragOver} onDrop={(ev) => handleDrop(ev, phase.name, project.id ?? "")}>
                {tasksInPhase.map((task) => (
                  <KanbanCard 
                    task={task} 
                    tasks={tasksInPhase} 
                    onClick={handleClick} 
                    respByTaskId={respByTaskId} 
                    key={task.id}
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
