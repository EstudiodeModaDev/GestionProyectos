import React from "react";
import "./DetallesTarea.css";
import type { TaskApertura } from "../../models/AperturaTienda";
import type { KanbanPhase } from "../kanban/Kanban";
import { ParseDateShow } from "../../utils/Date";

export interface SuccessorTask extends TaskApertura {
  blocked?: boolean;      
}

export interface TaskDetailModalProps {
  open: boolean;
  task: TaskApertura | null;
  predecessor?: TaskApertura | null;
  successors?: SuccessorTask[];
  phases: KanbanPhase[];
  blockedReason?: string;                      
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onGoToTask: (taskId: string, phaseId: string) => void;
}

function getArtifacts(taskName: string) {
  const name = taskName.toLowerCase();
  let inputs = "Solicitud de requerimiento, Planificación previa";
  let outputs = "Informe de avance, Tarea completada en sistema";

  if (name.includes("planos")) {
    inputs = "Levantamiento topográfico, Manual de marca";
    outputs = "Juego de planos arquitectónicos (PDF/DWG)";
  } else if (name.includes("contrato")) {
    inputs = "Datos del proveedor, Propuesta económica aprobada";
    outputs = "Contrato firmado y legalizado";
  } else if (name.includes("presupuesto")) {
    inputs = "Cantidades de obra, Cotizaciones de proveedores";
    outputs = "Cuadro de presupuesto consolidado (Excel)";
  } else if (name.includes("licencia") || name.includes("permiso")) {
    inputs = "Planos firmados, Formularios de solicitud";
    outputs = "Resolución de aprobación / Licencia física";
  } else if (name.includes("compra") || name.includes("adquisición")) {
    inputs = "Requisición aprobada, Cotizaciones comparativas";
    outputs = "Orden de compra generada, Factura proveedor";
  }

  return { inputs, outputs };
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({open, task, predecessor, successors = [],  phases, blockedReason, onClose, onComplete, onGoToTask,}) => {
  if (!open || !task) return null;

  const phaseName =
    phases.find((p) => p.name === task.Phase)?.name || task.Phase

  const isCompleted = task.Estado === "Completada";
  const isBlocked =!!predecessor && predecessor.Estado !== "Completada" && !isCompleted;

  const artifacts = getArtifacts(task.Title);

  const fullResponsibleName = task.Responsable;
  let initials
  if(task.Responsable){
    initials = fullResponsibleName.split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    } else {
        initials = "N/A"    
    }

  const baseId = task.Id!.split("-").pop() || task.Id!;

  const handleCompleteClick = () => {
    if (isBlocked || isCompleted) return;
    onComplete(task.Id!);
  };

  const buttonText = isBlocked ? "Bloqueado por dependencia" : "Marcar Completada";

  const buttonTitle = isBlocked && predecessor ? blockedReason || `Depende de "${predecessor.Title}" en estado "${predecessor.Estado}".` : undefined;

  return (
    <div className="tdm-overlay">
      <div className="tdm-modal">
        {/* Header */}
        <div className="tdm-header-row">
          <div className="tdm-header-main">
            <span className="tdm-tag">VISTA PREVIA DE TAREA</span>
            <h3 className="tdm-title">
              {task.Title}{" "}
              <span className="tdm-title-id">({baseId})</span>
            </h3>
          </div>

          <button type="button" className="tdm-close-btn"  onClick={onClose} aria-label="Cerrar">
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
                <svg className="tdm-icon tdm-icon-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
              </div>
              <div className="tdm-card-inner">
                <p className="tdm-section-label">
                  Dependencia previa (predecesora)
                </p>
                {predecessor ? (
                  <div className="tdm-predecessor-item" onClick={() => onGoToTask(predecessor.Id!, predecessor.Phase)}>
                    <p className="tdm-predecessor-title">
                      {predecessor.Title} ({predecessor.Id})
                    </p>
                    <p className={"tdm-predecessor-status " + (predecessor.Estado === "Completada" ? "tdm-predecessor-status-ok" : "tdm-predecessor-status-blocked")}>
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
                <svg className="tdm-icon tdm-icon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="tdm-card-title-text tdm-card-title-blue">
                  Insumos (datos de entrada)
                </span>
              </div>
              <p className="tdm-card-body-text">{artifacts.inputs}</p>
            </div>

            {/* Entregables */}
            <div className="tdm-card tdm-card-green">
              <div className="tdm-card-title-row">
                <svg className="tdm-icon tdm-icon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="tdm-card-title-text tdm-card-title-green">
                  Entregables (datos de salida)
                </span>
              </div>
              <p className="tdm-card-body-text">{artifacts.outputs}</p>
            </div>

            {/* Impacto / tareas dependientes */}
            <div className="tdm-card tdm-card-gray">
              <div className="tdm-card-icon-bubble">
                <svg className="tdm-icon tdm-icon-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
              <div className="tdm-card-inner">
                <p className="tdm-section-label">
                  Impacto (tareas dependientes)
                </p>
                {successors.length > 0 ? (
                  <ul className="tdm-successors-list">
                    {successors.map((succ) => {
                      const blocked = !!succ.blocked;
                      return (
                        <li key={succ.Id} className="tdm-successor-item"  onClick={() => onGoToTask(succ.Id!, succ.Phase)}>
                          <p className="tdm-successor-title">
                            {succ.Title} ({succ.Id})
                          </p>
                          <span className={ "tdm-successor-status " + (blocked ? "tdm-successor-status-blocked" : "tdm-successor-status-ok")}>
                            ({blocked ? "BLOQUEADA" : "DESBLOQUEADA"})
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
          <button type="button" className="tdm-btn tdm-btn-secondary"  onClick={onClose}>
            Cerrar
          </button>

          {!isCompleted ? (
            <button type="button" className="tdm-btn tdm-btn-primary" disabled={isBlocked} onClick={handleCompleteClick} title={buttonTitle}>
              {!isBlocked ? (
                <svg className="tdm-btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0   01-1.414 0l-4-4a1 1 0 011.414-1.414L8  12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="tdm-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0  002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              )}
              {buttonText}
            </button>
          ) : (
            <span className="tdm-pill-complete">
              ✓ Tarea Completada
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
