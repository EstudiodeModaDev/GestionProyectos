import React from "react";
import "./DetallesTarea.css";
import type { TaskApertura } from "../../models/AperturaTienda";
import type { KanbanPhase } from "../kanban/Kanban";
import { ParseDateShow } from "../../utils/Date";
import { useTaskInsumos } from "../../Funcionalidades/Insumos";

export interface TaskDetailModalProps {
  open: boolean;
  task: TaskApertura | null;
  predecessor?: TaskApertura | null;
  successors?: TaskApertura[];
  phases: KanbanPhase[];
  blockedReason?: string;
  onClose: () => void;
  onGoToTask: (task: TaskApertura) => void;
  onAssignToMe: (task: TaskApertura) => Promise<void>;
  onCompleteTask: (task: TaskApertura) => Promise<void>;
}

// Debe coincidir con lo que devuelve useTaskInsumos
type TaskInsumoView = {
  id: string;
  title: string;
  tipo: "Entrada" | "Salida";
  texto: string;
  estado: "Subido" | "Pendiente";
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  task,
  predecessor,
  successors = [],
  phases,
  blockedReason,
  onClose,
  onGoToTask,
  onAssignToMe,
  onCompleteTask,
}) => {
  if (!open || !task) return null;

  const phaseName =
    phases.find((p) => p.name === task.Phase)?.name || task.Phase;

  const isCompleted = task.Estado === "Completada";
  const isBlocked =
    !!predecessor && predecessor.Estado !== "Completada" && !isCompleted;

  const { inputs, outputs, loading, error } = useTaskInsumos(task);

  const fullResponsibleName = task.Responsable;
  const initials = task.Responsable
    ? fullResponsibleName
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "N/A";

  const buttonText = isBlocked ? "Bloqueado por dependencia" : "Marcar Completada";

  const buttonTitle =
    isBlocked && predecessor
      ? blockedReason ||
        `Depende de "${predecessor.Title}" en estado "${predecessor.Estado}".`
      : undefined;

  const handleClickInsumo = (ins: TaskInsumoView) => {
    if (!ins.texto) {
      alert("Este insumo aún no ha sido subido o completado.");
      return;
    }

    if (ins.texto.startsWith("http")) {
      window.open(ins.texto, "_blank", "noopener,noreferrer");
    } else {
      alert(`Insumo: ${ins.title}\n\nContenido:\n${ins.texto}`);
    }
  };

  return (
    <div className="tdm-overlay">
      <div className="tdm-modal">
        {/* Header */}
        <div className="tdm-header-row">
          <div className="tdm-header-main">
            <span className="tdm-tag">VISTA PREVIA DE TAREA</span>
            <h3 className="tdm-title">
              {task.Title}{" "}
              <span className="tdm-title-id">({task.Codigo})</span>
            </h3>
          </div>

          <button
            type="button"
            className="tdm-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Grid principal */}
        <div className="tdm-grid">
          {/* Columna izquierda */}
          <div className="tdm-col-left">
            {/* Responsable */}
            <div>
              <p className="tdm-section-label">Responsable</p>
              <div className="tdm-responsable-row">
                <div className="tdm-avatar">{initials}</div>
                <span className="tdm-section-text">{fullResponsibleName}</span>
              </div>
            </div>

            {/* Fase */}
            <div>
              <p className="tdm-section-label">Fase</p>
              <span className="tdm-phase-chip">{phaseName}</span>
            </div>

            {/* Duración */}
            <div>
              <p className="tdm-section-label">Duración estimada</p>
              <p className="tdm-section-text">
                {task.Diaspararesolver} Días hábiles
              </p>
            </div>

            {/* Fecha límite */}
            <div>
              <p className="tdm-section-label">Fecha límite</p>
              <p className="tdm-section-text">
                {ParseDateShow(task.FechaResolucion) || "Sin fecha definida"}
              </p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="tdm-col-right">
            {/* Dependencia previa */}
            <div className="tdm-card tdm-card-gray">
              <div className="tdm-card-icon-bubble">
                <svg
                  className="tdm-icon tdm-icon-gray"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
              <div className="tdm-card-inner">
                <p className="tdm-section-label">
                  Dependencia previa (predecesora)
                </p>
                {predecessor ? (
                  <div
                    className="tdm-predecessor-item"
                    onClick={() => onGoToTask(predecessor)}
                  >
                    <p className="tdm-predecessor-title">
                      {predecessor.Title} ({predecessor.Codigo})
                    </p>
                    <p
                      className={
                        "tdm-predecessor-status " +
                        (predecessor.Estado === "Completada"
                          ? "tdm-predecessor-status-ok"
                          : "tdm-predecessor-status-blocked")
                      }
                    >
                      Estado: {predecessor.Estado}
                    </p>
                  </div>
                ) : (
                  <p className="tdm-predecessor-empty">
                    Sin dependencias previas.
                  </p>
                )}
              </div>
            </div>

            {/* Insumos */}
            <div className="tdm-card tdm-card-blue">
              <div className="tdm-card-title-row">
                <svg
                  className="tdm-icon tdm-icon-blue"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="tdm-card-title-text tdm-card-title-blue">
                  Insumos (datos de entrada)
                </span>
              </div>

              {loading ? (
                <p className="tdm-card-body-text">Cargando insumos...</p>
              ) : error ? (
                <p className="tdm-card-body-text tdm-error-text">
                  Error al cargar insumos: {error}
                </p>
              ) : inputs.length ? (
                <ul className="tdm-insumos-list">
                  {inputs.map((ins) => (
                    <li
                      key={ins.id}
                      className="tdm-insumos-item"
                      onClick={() => handleClickInsumo(ins)}
                    >
                      <span className="tdm-insumo-title">{ins.title}  </span>
                      <span
                        className={
                          "tdm-insumo-pill " +
                          (ins.estado === "Subido"
                            ? "tdm-insumo-pill-ok"
                            : "tdm-insumo-pill-pending")
                        }
                      >
                        {ins.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tdm-card-body-text">
                  No hay insumos configurados para esta tarea.
                </p>
              )}
            </div>

            {/* Entregables */}
            <div className="tdm-card tdm-card-green">
              <div className="tdm-card-title-row">
                <svg
                  className="tdm-icon tdm-icon-green"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="tdm-card-title-text tdm-card-title-green">
                  Entregables (datos de salida)
                </span>
              </div>

              {loading ? (
                <p className="tdm-card-body-text">Cargando entregables...</p>
              ) : error ? (
                <p className="tdm-card-body-text tdm-error-text">
                  Error al cargar entregables: {error}
                </p>
              ) : outputs.length ? (
                <ul className="tdm-insumos-list">
                  {outputs.map((out) => (
                    <li
                      key={out.id}
                      className="tdm-insumos-item"
                      onClick={() => handleClickInsumo(out)}
                    >
                      <span className="tdm-insumo-title">{out.title}</span>
                      <span
                        className={
                          "tdm-insumo-pill " +
                          (out.estado === "Subido"
                            ? "tdm-insumo-pill-ok"
                            : "tdm-insumo-pill-pending")
                        }
                      >
                        {out.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tdm-card-body-text">
                  No hay entregables configurados para esta tarea.
                </p>
              )}
            </div>

            {/* Impacto / tareas dependientes */}
            <div className="tdm-card tdm-card-gray">
              <div className="tdm-card-icon-bubble">
                <svg
                  className="tdm-icon tdm-icon-gray"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <div className="tdm-card-inner">
                <p className="tdm-section-label">
                  Impacto (tareas dependientes)
                </p>
                {successors.length > 0 ? (
                  <ul className="tdm-successors-list">
                    {successors.map((succ) => {
                      const status = succ.Estado;
                      return (
                        <li
                          key={succ.Id}
                          className="tdm-successor-item"
                          onClick={() => onGoToTask(succ)}
                        >
                          <p className="tdm-successor-title">
                            {succ.Title} ({succ.Codigo})
                          </p>
                          <span
                            className={
                              "tdm-successor-status " +
                              (status !== "Finalizada"
                                ? "tdm-successor-status-blocked"
                                : "tdm-successor-status-ok")
                            }
                          >
                            {status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="tdm-successors-empty">
                    No bloquea otras tareas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tdm-footer">
          <button
            type="button"
            className="tdm-btn tdm-btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>

          {!isCompleted ? (
            <>
              <button
                type="button"
                className="tdm-btn tdm-btn-primary"
                disabled={isBlocked}
                onClick={() => {
                  onCompleteTask(task);
                }}
                title={buttonTitle}
              >
                {!isBlocked ? (
                  <svg
                    className="tdm-btn-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0   01-1.414 0l-4-4a1 1 0 011.414-1.414L8  12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="tdm-btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0  002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
                {buttonText}
              </button>

              {!task.CorreoResponsable && (
                <button
                  type="button"
                  className="tdm-btn tdm-btn-primary"
                  onClick={() => onAssignToMe(task)}
                  title={"Asignarme esta tarea"}
                >
                  Asignarme tarea
                </button>
              )}
            </>
          ) : (
            <span className="tdm-pill-complete">✓ Tarea Completada</span>
          )}
        </div>
      </div>
    </div>
  );
};
