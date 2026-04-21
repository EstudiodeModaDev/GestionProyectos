import React from "react";
import type { projectTasks, taskResponsible } from "../../../models/AperturaTienda";
import { normalize } from "../../../utils/commons";
import { ParseDateShow } from "../../../utils/Date";


type Props = {
  task: projectTasks
  tasks: projectTasks[]
  onClick: (task: projectTasks) => void
  respByTaskId: Record<string, taskResponsible[]>;
  responsablesMap?: Record<string, string>
};


/**
 * Representa visualmente una tarea dentro de una columna del tablero Kanban.
 *
 * @param props - Tarea actual, tareas de la fase y metadatos de responsables.
 * @returns Tarjeta draggable con estado, responsables y vencimiento.
 */
const KanbanCard: React.FC<Props> = ({task, tasks, onClick, respByTaskId, responsablesMap}) => {

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const byCodigo = React.useMemo(() => {
    const m = new Map<string, projectTasks>();
    for (const t of tasks ?? []) {
      const c = normalize(t.Codigo);
      if (c) m.set(c, t);
    }
    return m;
  }, [tasks,]);

  const getParentByDependency = React.useCallback((dep?: string | null) => {
    const key = normalize(dep);
    if (!key) return null;
    return byCodigo.get(key) ?? null;
  },[byCodigo,]);

  const isCompleted = React.useCallback((estado?: string | null) => normalize(estado) === "completada", []);

  /* ========= DRAG & DROP ========= */

  const handleDragStart = (ev: React.DragEvent<HTMLDivElement>, task: projectTasks) => {
    if (task.Dependencia) {
      const parent = getParentByDependency(task.Dependencia);
      const blocked = !parent || !isCompleted(parent.Estado);

      if (blocked && task.Estado !== "Completada") {
        ev.preventDefault();
        const msg = `Tarea BLOQUEADA: "${task.Title}" depende de que "${parent ? parent.Title : task.Dependencia}" esté en estado "Completada".`;
        window.alert(msg);
        return;
      }
    }

    ev.dataTransfer.setData("text/plain", String(task.Id));
    ev.currentTarget.classList.add("kb-task--dragging");
  };

  /**
   * Limpia las clases visuales temporales cuando termina el arrastre.
   *
   * @param ev - Evento de finalizacion del drag.
   */
  const handleDragEnd = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.currentTarget.classList.remove("kb-task--dragging");
  };

  const handleDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  const getTaskResponsables = React.useCallback(
    (t: projectTasks) => respByTaskId[String(t.Id ?? "")] ?? [],
    [respByTaskId]
  );

  const getRespLabel = React.useCallback((t: projectTasks) => {
      const resps = getTaskResponsables(t);
      if (!resps.length) return "Sin asignar";

      const names = resps.map((r) => {
        const mail = (r.Correo ?? "").trim().toLowerCase();
        return responsablesMap?.[mail] ?? r.Title ?? mail;
      });

      if (names.length === 1) return names[0];
      return `${names[0]} +${names.length - 1}`;
    },
    [getTaskResponsables, responsablesMap]
  );

  /**
   * Calcula el indicador visual de vencimiento segun la fecha objetivo de la tarea.
   *
   * @param task - Tarea a evaluar.
   * @returns Clase del indicador y etiqueta descriptiva.
   */
  function getDueInfo(task: projectTasks) {
    if (task.Estado === "Completada" || !task.FechaResolucion) {
      return { dotClass: "kb-due-dot--neutral", label: "" };
    }

    const today = new Date();
    const due = new Date(task.FechaResolucion);
    const diffDays = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);

    if (diffDays < 0) return { dotClass: "kb-due-dot--over", label: "Vencido" };
    if (diffDays <= 7) return { dotClass: "kb-due-dot--soon", label: "Próximo" };
    return { dotClass: "kb-due-dot--ok", label: "A tiempo" };
  }

  const isCritical = task.TipoTarea === "Critica";
  const isDevuelta = task.Estado === "Devuelta";
  const isStarted = task.Estado === "Iniciado";
  const isOutOfTime = task.Estado === "Vencida";
  const isFinished = task.Estado === "Completada"

  const parent = getParentByDependency(task.Dependencia);
  const isBlocked = Boolean(task.Dependencia) && (task.Estado !== "Completada" && task.Estado !== "Iniciada") && (!parent || !isCompleted(parent.Estado));

  let borderClass = "kb-task--normal";
  if (task.Estado === "Completada") borderClass = "kb-task--done";
  else if (task.Estado === "Iniciada") borderClass = "kb-task--in-progress";
  if (isCritical && task.Estado !== "Completada") borderClass = "kb-task--critical";

  const dueInfo = getDueInfo(task);
  const respLabel = getRespLabel(task);

  return (
    <div key={task.Id} id={String(task.Id)} className={`kanban-task ${borderClass}`} onClick={() => onClick(task)} draggable onDragStart={(ev) => handleDragStart(ev, task)} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="kb-task-header">
        <p className="kb-task-title">
          <span className="kb-task-id">[{task.Codigo || task.Id}]</span>
          {task.Title}
        </p>
      </div>

      <p className="kb-task-resp">Responsable(s): <span className="badge-resp">{respLabel}</span></p>
      <div className="kb-task-footer">
        <div>
          {(isBlocked && !isStarted && !isDevuelta) && <span className="chip chip-blocked">BLOQUEADA</span>}
          {isCritical && <span className="chip chip-critical">CRÍTICA</span>}
          {isDevuelta && <span className="chip chip-devuelta">DEVUELTA</span>}
          {isStarted && <span className="chip chip-proceso">EN PROCESO</span>}
          {isOutOfTime && <span className="chip chip-vencida">VENCIDA</span>}
          {isFinished && <span className="chip chip-completada">COMPLETADA</span>}
        </div>

        <div className="kb-task-due">
          <span className="kb-task-due-date">
            {task.FechaResolucion ? ParseDateShow(task.FechaResolucion) : "Sin fecha"}
          </span>
          <span className={`due-dot ${dueInfo.dotClass}`} title={dueInfo.label} />
        </div>
      </div>
    </div>
    );
};

export default KanbanCard;
