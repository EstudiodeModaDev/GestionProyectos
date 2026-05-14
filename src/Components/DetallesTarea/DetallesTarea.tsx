import React from "react";
import "./DetallesTarea.css";
import type { projectTasks } from "../../models/AperturaTienda";
import type { KanbanPhase } from "../kanban/Kanban";
import { ParseDateShow } from "../../utils/Date";
import { useInsumosProyecto, useTaskInsumos, type TaskInsumoView } from "../../Funcionalidades/insumos";
import type { taskResponsible } from "../../models/AperturaTienda";
import { useResponsablesTarea } from "../../Funcionalidades/taskResponsible/useResponsableTarea";
import { useAuth } from "../../auth/authProvider";
import { SalidaModal } from "./UploadInsumos";
import { ReturnReasonModal } from "../confirmationModal/ConfirmModal";
import { TaskLogModal } from "../TaskLog/TaskLog";
import { useRepositories } from "../../repositories/repositoriesContext";
import { showError, showWarning } from "../../utils/toast";
import { DocumentViewerModal } from "../DocumentViewer/DocumentViewerModal";
import { isPreviewSupported, triggerBrowserDownload } from "../DocumentViewer/documentViewerUtils";
import type { Archivo } from "../../models/Files";

// ✅ Tipos nuevos del modal
export type SalidaValue = { kind: "Archivo"; file: File | null } | { kind: "Texto"; text: string } | { kind: "Opcion"; approved: string };

export type SalidaValues = Record<string, SalidaValue>;

export interface TaskDetailModalProps {
  open: boolean;
  task: projectTasks | null;
  predecessor?: projectTasks | null;
  successors?: projectTasks[];
  phases: KanbanPhase[];
  blockedReason?: string;
  onClose: () => void;
  onGoToTask: (task: projectTasks) => void;
  onCompleteTask: (task: projectTasks) => Promise<void>;
  sending: boolean;
  returnTask: (task: projectTasks, motivoDevolucion: string) => Promise<void>;
  blockTask: (task: projectTasks, razon: string) => Promise<void>
}

/**
 * Presenta el detalle completo de una tarea, sus insumos, dependencias y acciones.
 *
 * @param props - Propiedades del modal de detalle.
 * @returns Modal con informacion operativa y acciones sobre la tarea seleccionada.
 */
export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({blockTask, returnTask, open, task, predecessor, successors = [], phases, blockedReason, onClose, onGoToTask, onCompleteTask, sending,}) => {
  if (!open || !task) return null;

  const { account } = useAuth();
  const repositories = useRepositories();

  // Insumos
  const { inputs, outputs, loading, error, } = useTaskInsumos(task);
  const { saveInsumoFile, loadInsumosFiles, saveInsumoText} = useInsumosProyecto(repositories.projectInsumo!);

  // Responsables
  const responsablesCtrl = useResponsablesTarea();
  const [responsables, setResponsables] = React.useState<taskResponsible[]>([]);
  const [loadingResp, setLoadingResp] = React.useState(false);
  const [errorResp, setErrorResp] = React.useState<string | null>(null);
  const [devolver, setDevolver] = React.useState<boolean>(false);
  const [bloquear, setBloquear] = React.useState<boolean>(false);
  const [blocking, setBlocking] = React.useState<boolean>(false);
  const [log, setLog] = React.useState<boolean>(false);
  const [viewerFile, setViewerFile] = React.useState<Archivo | null>(null);

  React.useEffect(() => {
    console.log(inputs)
  }, [task?.id]);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      if (!task?.id) return;
      setLoadingResp(true);
      setErrorResp(null);

      try {
        const data = (await responsablesCtrl.loadByTaskId(Number(task.id)));
        if (!mounted) return;
        setResponsables(data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setResponsables([]);
        setErrorResp(e?.message ?? "Error cargando responsables");
      } finally {
        if (mounted) setLoadingResp(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [task?.id]);

  // UI helpers
  const phaseName = phases.find((p) => p.name === task.fase)?.name || task.fase;
  const isCompleted = task.Estado === "Completada";
  const isBlocked = !!predecessor && predecessor.Estado !== "Completada" && !isCompleted;
  const userEmail = (account?.username ?? "").toLowerCase().trim();
  const isResponsible = responsables.some((r) => (r.correo ?? "").toLowerCase().trim() === userEmail) || userEmail === "dpalacios@estudiodemoda.com.co";

  const [showSalidaModal, setShowSalidaModal] = React.useState<boolean>(false);

  const buttonTitle = isBlocked && predecessor ? blockedReason || `Depende de "${predecessor.nombre_tarea}" en estado "${predecessor.Estado}".`
      : !isResponsible ? "No tienes permiso para completar esta tarea" : undefined;

  const disableComplete = isBlocked || !isResponsible || loading || loadingResp || sending;

  const buttonText = isBlocked ? "Bloqueado por dependencia" 
    : !isResponsible ? "No eres responsable" 
    : loading || loadingResp || sending ? "Cargando..." : "Marcar Completada";

  

  /**
   * Abre el adjunto principal del insumo seleccionado cuando existe.
   *
   * @param ins - Insumo o entregable asociado a la tarea.
   */
  const handleClickInsumo = async (ins: TaskInsumoView) => {
    if (ins.estado === "Pendiente") {
      showWarning("Este insumo aún no tiene archivos adjuntos.");
      return;
    }

    const attachments = await loadInsumosFiles(ins.id,);

    if (!attachments.length) {
      showWarning("No se encontraron adjuntos para este insumo.");
      return;
    }

    const file = attachments[0];
    const downloadUrl = file.webUrl;

    if (!downloadUrl) {
      showError("No se pudo obtener la URL de descarga del archivo.");
      return;
    }

    if (!isPreviewSupported(file)) {
      triggerBrowserDownload(file);
      return;
    }

    setViewerFile(file);
  };

  

  /**
   * Decide si la tarea puede completarse directamente o requiere capturar salidas.
   *
   * @param t - Tarea que se intenta cerrar.
   */
  const tryCloseTask = (t: projectTasks) => {
    if (outputs.length > 0) {
      setShowSalidaModal(true);
    } else {
      void onCompleteTask(t);
    }
  };

  

  /**
   * Guarda los entregables de salida y completa o devuelve la tarea segun el resultado.
   *
   * @param values - Valores enviados por el modal de salidas.
   */
  const handleSubmitSalidas = async (values: SalidaValues) => {
    // Validar faltantes según tipo
    const faltantes = outputs.filter((s: any) => {
      const v = values[s.id];
      const yaSubido = s.estado === "Subido";
      if (!v) return !yaSubido;

      if (s.tipo === "Archivo") return !yaSubido && (v.kind !== "Archivo" || !v.file);
      if (s.tipo === "Texto") return !yaSubido && (v.kind !== "Texto" || !v.text?.trim());
      if (s.tipo === "Opcion") return !yaSubido && (v.kind !== "Opcion" || !v.approved);

      // fallback seguro
      return !yaSubido;
    });

    if (faltantes.length > 0) {
      showWarning("Debes completar estos entregables:\n\n" + faltantes.map((f: any) => `- ${f.title}`).join("\n"), { autoClose: 8000 });
      return false;
    }

    // Guardar cada entregable según tipo
    for (const salida of outputs as any[]) {
      const v = values[salida.id];
      if (!v) continue;

      if (v.kind === "Archivo") {
        if (!v.file) continue;
        await saveInsumoFile(salida.id, v.file, );
      }

      if (v.kind === "Texto") {
        await saveInsumoText(salida.id, v.text)
      }

      if (v.kind === "Opcion") {
        await saveInsumoText(salida.id, v.approved)
        if(v.approved.toLocaleLowerCase().trim() === "no"){
          await returnTask(task, "Una de las salidas suministradas por esta tarea no fue aprobada por una de las tareas dependientes.")
          setShowSalidaModal(false);
          onClose();
          return true
        }
      }
    }

    await onCompleteTask(task);
    setShowSalidaModal(false);
    onClose()
    return true
  };

  

  /**
   * Bloquea o desbloquea la tarea actual registrando la razon indicada.
   *
   * @param t - Tarea a actualizar.
   * @param razon - Motivo del bloqueo o desbloqueo.
   */
  const blockTasks = async(t: projectTasks, razon: string) => {
    setBlocking(true)
    await blockTask(t, razon),
    setBlocking(false)
    onClose()
  };

  return (
    <>
      <div className="tdm-overlay">
        <div className="tdm-modal">
          {/* Header */
}
          <div className="tdm-header-row">
            <div className="tdm-header-main">
              <h3 className="tdm-title">
                {task.nombre_tarea} <span className="tdm-title-id">({task.codigo})</span>
              </h3>
            </div>

            <button type="button" className="tdm-close-btn" onClick={onClose} aria-label="Cerrar">
              &times;
            </button>
          </div>

          <div className="tdm-grid">
            {/* Columna izquierda */
}
            <div className="tdm-col-left">
              <div>
                <p className="tdm-section-label">Responsables</p>

                {loadingResp ? (
                  <span className="tdm-section-text">Cargando responsables...</span>
                ) : errorResp ? (
                  <span className="tdm-section-text tdm-error-text">{errorResp}</span>
                ) : responsables.length ? (
                  <div className="tdm-responsables-list">
                    {responsables.map((r) => {
                      const initials = r.nombre
                        ? r.nombre.split(/\s+/)
                            .filter(Boolean)
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "N/A";

                      return (
                        <div key={r.id ?? `${r.tarea_id}-${r.correo}`}  className="tdm-responsable-row">
                          <div className="tdm-avatar">{initials}</div>

                          <div className="tdm-responsable-info">
                            <span className="tdm-section-text">{r.nombre}</span>
                            <small style={{ opacity: 0.7 }}>{r.correo}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="tdm-section-text">Sin asignar</span>
                )}
              </div>

              <div>
                <p className="tdm-section-label">Fase</p>
                <span className="tdm-phase-chip">{phaseName}</span>
              </div>

              <div>
                <p className="tdm-section-label">Duración estimada</p>
                <p className="tdm-section-text">{task.dias_para_resolver} Días hábiles</p>
              </div>

              <div>
                <p className="tdm-section-label">Fecha inicio</p>
                <p className="tdm-section-text">
                  {task.fechaInicio
                    ? ParseDateShow(task.fechaInicio ?? "")
                    : "Sin fecha definida"}
                </p>
              </div>

              <div>
                <p className="tdm-section-label">Fecha límite</p>
                <p className="tdm-section-text">
                  {task.FechaResolucion
                    ? ParseDateShow(task.FechaResolucion ?? "")
                    : "Sin fecha definida"}
                </p>
              </div>

              <div>
                <p className="tdm-section-label">Fecha en la que se completó</p>
                <p className="tdm-section-text">
                  {task.FechaCierre
                    ? ParseDateShow(task.FechaCierre ?? "")
                    : "No se ha completado la tarea"}
                </p>
              </div>

              <div>
                <p className="tdm-section-label">Estado</p>
                <p className="tdm-section-text">{task.Estado}</p>
              </div>

              {task.Estado === "Devuelta" ? 
                <div>
                  <p className="tdm-section-label">Razón devolución</p>
                  <p className="tdm-section-text">{task.razonDevolucion ?? "Desconocida"}</p>
                </div>
                : null}
            </div>

            {/* Columna derecha */
}
            <div className="tdm-col-right">
              {/* Dependencia previa */
}
              <div className="tdm-card tdm-card-gray">
                <div className="tdm-card-icon-bubble">
                  <svg className="tdm-icon tdm-icon-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                </div>
                <div className="tdm-card-inner">
                  <p className="tdm-section-label">Dependencia previa (predecesora)</p>
                  {predecessor ? (
                    <div className="tdm-predecessor-item" onClick={() => onGoToTask(predecessor)}>
                      <p className="tdm-predecessor-title">
                        {predecessor.nombre_tarea} ({predecessor.codigo})
                      </p>
                      <p className={ "tdm-predecessor-status " + (predecessor.Estado === "Completada" ? "tdm-predecessor-status-ok" : "tdm-predecessor-status-blocked")}>
                        Estado: {predecessor.Estado}
                      </p>
                    </div>
                  ) : (
                    <p className="tdm-predecessor-empty">Sin dependencias previas.</p>
                  )}
                </div>
              </div>

              {/* Insumos entrada */
}
              <div className="tdm-card tdm-card-blue">
                <div className="tdm-card-title-row">
                  <svg className="tdm-icon tdm-icon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
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
                    {inputs.map((ins: TaskInsumoView) => (
                      <li key={ins.id} className="tdm-insumos-item" onClick={() => handleClickInsumo(ins)}>
                        <span className="tdm-insumo-title">
                          <strong>{ins.title}</strong> - {ins.texto ? ins.texto : "No subido"}
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

              {/* Entregables salida */
}
              <div className="tdm-card tdm-card-green">
                <div className="tdm-card-title-row">
                  <svg className="tdm-icon tdm-icon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
                    {outputs.map((out: TaskInsumoView) => (
                      <li key={out.id} className="tdm-insumos-item" onClick={() => handleClickInsumo(out)}>
                        <span className="tdm-insumo-title">
                          {out.title} - {out.texto ? out.texto : "No subido"}
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

              {/* Impacto / tareas dependientes */
}
              <div className="tdm-card tdm-card-gray">
                <div className="tdm-card-icon-bubble">
                  <svg className="tdm-icon tdm-icon-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </div>
                <div className="tdm-card-inner">
                  <p className="tdm-section-label">Impacto (tareas dependientes)</p>
                  {successors.length > 0 ? (
                    <ul className="tdm-successors-list">
                      {successors.map((succ) => {
                        const st = succ.Estado;
                        return (
                          <li key={succ.id} className="tdm-successor-item" onClick={() => onGoToTask(succ)}>
                            <p className="tdm-successor-title">
                              {succ.nombre_tarea} ({succ.codigo})
                            </p>
                            <span className={ "tdm-successor-status " + (st !== "Finalizada" ? "tdm-successor-status-blocked" : "tdm-successor-status-ok")}>
                              {st}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="tdm-successors-empty">No bloquea otras tareas.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */
}
          <div className="tdm-footer">
            <button type="button" className="tdm-btn tdm-btn-secondary" onClick={onClose}>
              Cerrar
            </button>

            <button type="button" className="tdm-btn tdm-btn-secondary" onClick={() => setLog(true)}>
              Log
            </button>

            {!isCompleted ? (
              <>
                <button type="button" className="tdm-btn tdm-btn-primary" disabled={disableComplete || task.Estado === "UserBlocked"} onClick={() => tryCloseTask(task)} title={buttonTitle}>
                  {buttonText}
                </button>

                <button type="button" className="tdm-btn tdm-btn-primary" disabled={disableComplete} onClick={() => {!(task.Estado === "UserBlocked") ? setBloquear(true) : blockTask(task, "")}} title={buttonTitle}>
                  {blocking ? "Procesando..." : task.Estado === "UserBlocked" ? "Desbloquear tarea" : "Bloquear Tarea"}
                </button>

                { predecessor ? 
                  <button type="button" className="tdm-btn tdm-btn-primary" onClick={() => {setDevolver(true)}} title={"Devolver antecesora"} disabled={disableComplete || task.Estado === "UserBlocked"}>
                    Devolver antecesora
                  </button> : null
                }
              </>
            ) : (
              <span className="tdm-pill-complete">✓ Tarea Completada</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de salidas (invocado correctamente) */
}
      <SalidaModal
        open={showSalidaModal}
        salidas={outputs}
        onClose={() => setShowSalidaModal(false)}
        onSubmit={handleSubmitSalidas}
        submitting={sending}
      />

      {/* Devolución modal */
}
      <ReturnReasonModal 
        open={devolver}
        onConfirm={returnTask}
        onClose={() => setDevolver(false)}
        task={task} 
        proceso={"Bloqueo"}/>

      <ReturnReasonModal 
        open={bloquear}
        onConfirm={blockTasks}
        onClose={() => setBloquear(false)}
        task={task} 
        proceso={"Devolución"}/>

      <TaskLogModal 
        open={log} 
        onClose={() => setLog(false)} 
        taskId={task.id!}  
        taskTitle={task.nombre_tarea}/>

      <DocumentViewerModal open={!!viewerFile} file={viewerFile} onClose={() => setViewerFile(null)} />
    </>
  );
};
