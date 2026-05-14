type Props = {
  loading: boolean;
  onClose: () => void;
};

export function NuevoProyectoModalHeader({ loading, onClose }: Props) {
  return (
    <>
      <header className="modal__header">
        <div>
          <h2 className="modal__title">Nuevo Proyecto de Apertura</h2>
        </div>
        <button type="button" className="modal__close" aria-label="Cerrar" disabled={loading} onClick={onClose}>
          x
        </button>
      </header>

      <hr className="modal__divider" />
    </>
  );
}
