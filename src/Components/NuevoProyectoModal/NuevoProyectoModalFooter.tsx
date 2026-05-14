import type { NuevoProyectoFooterProps } from "./NuevoProyectoModal.types";

export function NuevoProyectoModalFooter({
  loading,
  loadingMessage,
  disabled,
  onCancel,
}: NuevoProyectoFooterProps) {
  return (
    <div className="modal__footer">
      {loading ? (
        <div className="modal__loading">
          <div className="modal__spinner" />
          <p>{loadingMessage}</p>
        </div>
      ) : null}

      <button type="button" className="btn modal__btn-cancel" onClick={onCancel} disabled={disabled}>
        Cancelar
      </button>

      <button type="submit" className="btn btn--primary modal__btn-primary" disabled={disabled}>
        {!disabled ? "Crear Proyecto" : "Creando proyecto, por favor espere..."}
      </button>
    </div>
  );
}
