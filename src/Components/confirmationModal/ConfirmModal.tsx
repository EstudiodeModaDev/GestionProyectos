import * as React from "react";
import "./ConfirmModal.css"
import type { projectTasks } from "../../models/AperturaTienda";

type ReturnReasonModalProps = {
  open: boolean;
  proceso: string;
  title?: string;

  minLength?: number;
  maxLength?: number;

  loading?: boolean;
  confirmText?: string;

  onConfirm: (t: projectTasks, reason: string) => Promise<void> | void;
  onClose: () => void;
  task: projectTasks
};

/**
 * Solicita una razon textual antes de ejecutar una accion sensible sobre una tarea.
 *
 * @param props - Configuracion del modal y callbacks de confirmacion.
 * @returns Modal de confirmacion con campo obligatorio de motivo.
 */
export function ReturnReasonModal({proceso, task, open, title = "Motivo", minLength = 5, maxLength = 2000, loading = false, confirmText = "Confirmar", onConfirm, onClose,}: ReturnReasonModalProps) {
  const [reason, setReason] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
    }
  }, [open,]);

  // Cerrar con ESC
  React.useEffect(() => {
    if (!open) return;

    /**
     * Cierra el modal cuando el usuario presiona Escape.
     *
     * @param e - Evento del teclado.
     */
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const trimmed = reason.trim();
  const isTooShort = trimmed.length < minLength;
  const isTooLong = trimmed.length > maxLength;
  const invalid = isTooShort || isTooLong;

  const placeHolder = `Describe el motivo de ${proceso}`

  const errorMsg = !touched ? "" : isTooShort ? `Escribe al menos ${minLength} caracteres.` : isTooLong ? `Maximo ${maxLength} caracteres.` : "";

  /**
   * Valida el motivo y ejecuta la accion confirmada por el usuario.
   */
  const handleConfirm = async () => {
    setTouched(true);
    if (invalid || loading) return;
    await onConfirm(task, trimmed);
  };

  if (!open) return null;

  return (
    <div className="rrm-overlay" role="presentation" onMouseDown={(e) => {if (e.target === e.currentTarget) onClose();}}>
      <div className="rrm-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <header className="rrm-header">
          <div className="rrm-titleWrap">
            <h3 className="rrm-title">{title}</h3>
            <p className="rrm-subtitle">Describe el motivo para continuar.</p>
          </div>

          <button type="button" className="rrm-close" onClick={onClose} disabled={loading} aria-label="Cerrar" title="Cerrar">
            ×
          </button>
        </header>

        <div className="rrm-body">
          <label className="rrm-label" htmlFor="reason"> Motivo </label>

         <textarea
            id="rrm-reason"
            className="rrm-textarea"
            value={reason}
            maxLength={maxLength}
            placeholder={placeHolder}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={loading}
            rows={5}
          />


          <div className="rrm-meta">
            <span className={`rrm-error ${errorMsg ? "show" : ""}`}>{errorMsg}</span>
            <span className="rrm-counter">
              {trimmed.length}/{maxLength}
            </span>
          </div>
        </div>

        <div className="rrm-actions">

          <button className="rrm-btn rrm-btnPrimary"  onClick={handleConfirm} disabled={loading || invalid} type="button">
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
