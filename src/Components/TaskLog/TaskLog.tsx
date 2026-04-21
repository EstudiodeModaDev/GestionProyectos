import * as React from "react";
import "./TaskLog.css";
import type { LogTarea } from "../../models/LogTarea";
import { loadTaskLog } from "../../Funcionalidades/TaskLog/taskLogActions";
import { useGraphServices } from "../../graph/graphContext";

type TaskLogModalProps = {
  open: boolean;
  onClose: () => void;
  taskTitle?: string;
  taskId: string;
};

/**
 * Convierte una fecha ISO en un texto legible para la tabla del historial.
 *
 * @param value - Fecha a formatear.
 * @returns Fecha y hora en formato local o el valor original si no es valido.
 */
function formatDate(value?: string) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Muestra el historial de acciones registradas para una tarea.
 *
 * @param props - Propiedades del modal.
 * @returns Modal con el listado de eventos asociados a la tarea seleccionada.
 */
export function TaskLogModal({open, onClose, taskTitle, taskId}: TaskLogModalProps) {
  const [logs, setLogs] = React.useState<LogTarea[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const graph = useGraphServices()

  

  /**
   * Carga los registros del log asociados a la tarea abierta en el modal.
   */
  const loadLogs = async () => {
    setLoading(true)
    const loadedLogs = await loadTaskLog(taskId, graph)
    if(!loadedLogs.error){
      setLogs(loadedLogs.data)
      setLoading(false)
      return
    }
    setLoading(false)
    alert("Algo ha salido mal cargando los logs " + loadedLogs.error)
  };

  React.useEffect(() => {
    if (!open) return;

    

    /**
     * Cierra el modal cuando el usuario presiona la tecla Escape.
     *
     * @param e - Evento del teclado.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;

    

    /**
     * Ejecuta la carga inicial del historial cuando el modal se abre.
     */
    const run = async () => {
      await loadLogs();
    };

    run();
  }, [open, taskId]);

  if (!open) return null;

  return (
    <div className="tasklog-backdrop" onClick={onClose}> 
     <div className="tasklog-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="tasklog-title">
        <div className="tasklog-header">
          <div className="tasklog-headerText">
            <h2 id="tasklog-title" className="tasklog-title">
              Historial de la tarea
            </h2>
            {taskTitle ? <p className="tasklog-subtitle">{taskTitle}</p> : null}
          </div>

          <button type="button" className="tasklog-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="tasklog-body">
          {loading ? (
            <div className="tasklog-state">Cargando historial...</div>
          ) : logs.length === 0 ? (
            <div className="tasklog-state">
              No hay registros para esta tarea.
            </div>
          ) : (
            <div className="tasklog-tableWrap">
              <table className="tasklog-table">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Realizado por</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.Id ?? `${log.IdTarea}-${log.FechaAccion}-${index}`}>
                      <td>{log.Title || "-"}</td>
                      <td>{log.RealizadoPor || "-"}</td>
                      <td>{formatDate(log.FechaAccion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tasklog-footer">
          <button type="button" className="tasklog-btn tasklog-btnPrimary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
