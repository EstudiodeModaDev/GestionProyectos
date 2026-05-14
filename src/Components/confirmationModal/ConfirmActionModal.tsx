import * as React from "react";
import "./ConfirmModal.css";

type ConfirmActionModalProps = {
  open: boolean;
  text: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
};

/**
 * Muestra una confirmacion reutilizable para acciones destructivas o sensibles.
 *
 * @param props - Configuracion visual y callbacks del modal.
 * @returns Modal simple de confirmacion con acciones confirmar/cancelar.
 */
export function ConfirmActionModal({
  open,
  text,
  onConfirm,
  onCancel,
  title = "Confirmar accion",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
}: ConfirmActionModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, open, onCancel]);

  if (!open) return null;

  return (
    <div
      className={`rrm-overlay ${loading ? "rrm-overlay--busy" : ""}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className={`rrm-modal ${loading ? "rrm-modal--busy" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-busy={loading}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="rrm-header">
          <div className="rrm-titleWrap">
            <h3 className="rrm-title">{title}</h3>
            {loading ? (
              <p className="rrm-subtitle">Procesando tu solicitud. Espera un momento.</p>
            ) : null}
          </div>

          <button type="button" className="rrm-close" onClick={onCancel} disabled={loading} aria-label="Cerrar" title="Cerrar">
            x
          </button>
        </header>

        <div className="rrm-body">
          <p className="rrm-message">{text}</p>
          {loading ? (
            <div className="rrm-loading" aria-live="polite">
              <span className="rrm-spinner" aria-hidden="true" />
              <span>Realizando accion...</span>
            </div>
          ) : null}
        </div>

        <div className="rrm-actions">
          <button className="rrm-btn rrm-btnGhost" onClick={onCancel} disabled={loading} type="button">
            {cancelText}
          </button>

          <button className="rrm-btn rrm-btnPrimary" onClick={onConfirm} disabled={loading} type="button">
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
