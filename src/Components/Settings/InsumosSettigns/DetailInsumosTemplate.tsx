import React from "react";
import type { Plantilla } from "../Settings";
import type { plantillaInsumos } from "../../../models/Insumos";

type InsumoDetailModalProps = {
  open: boolean;
  plantilla: Plantilla;
  insumo: plantillaInsumos | null;
  onClose: () => void;
  state: plantillaInsumos;
  setField: <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) => void;
  onCrearInsumo: (proceso: string) => void | Promise<void>;
  onEditarInsumo: (id: string, proceso: string) => void | Promise<void>;
  onEliminarInsumo: (id: string, proceso: string) => void | Promise<void>;
  insumos: plantillaInsumos[];
  accion: string
};

/**
 * Permite crear, editar o eliminar un insumo de plantilla.
 *
 * @param props - Estado del modal y callbacks de persistencia.
 * @returns Modal de detalle para administracion de insumos.
 */
export const InsumoDetailModal: React.FC<InsumoDetailModalProps> = ({open, plantilla, insumo, onClose, state, setField, onCrearInsumo, onEditarInsumo, onEliminarInsumo, accion}) => {
    const isEdit = Boolean(insumo);

    React.useEffect(() => {
        if (!open) return;

        if (insumo) {
            setField("Id", (insumo.Id ?? "") as plantillaInsumos["Id"]);
            setField("Title", (insumo.Title ?? "") as plantillaInsumos["Title"]);
            setField("Proceso", (insumo.Proceso ?? accion) as plantillaInsumos["Proceso"]);
        } else {
            setField("Id", undefined as any);
            setField("Title", "" as plantillaInsumos["Title"]);
            setField("Proceso", accion as plantillaInsumos["Proceso"]);
        }

        setField("Categoria", "Archivo" as plantillaInsumos["Categoria"]);
    }, [open, insumo, accion]);

  if (!open) return null;

  

  /**
   * Guarda el insumo en modo creacion o edicion segun el contexto actual.
   *
   * @param e - Evento de envio del formulario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && state.Id) {
      await onEditarInsumo(state.Id, accion);
    } else {
      await onCrearInsumo(accion);
    }

    onClose();
  };

  

  /**
   * Confirma y elimina el insumo actualmente seleccionado.
   */
  const handleDeleteClick = async () => {
    if (!state.Id) return;

    const ok = window.confirm(
      `¿Seguro que deseas eliminar el insumo "${state.Title}"?\n` +
        "Esta acción no se puede deshacer."
    );

    if (!ok) return;

    await onEliminarInsumo(state.Id, accion);
    onClose();
  };

  return (
    <>
      <div className="tp-modal-backdrop tp-modal-backdrop--nested" onClick={onClose}/>
        <section className="tp-detail-modal" role="dialog" aria-modal="true" aria-labelledby="ip-detail-title">
            <div className="tp-detail-modal__panel">
                <header className="tp-detail-modal__header">
                    <div>
                        <h2 id="ip-detail-title" className="tp-detail-modal__title">
                            {isEdit ? "Editar insumo" : "Nuevo insumo"}
                        </h2>
                        <p className="tp-detail-modal__subtitle">
                            Plantilla / Acción: {plantilla.nombre}
                        </p>
                    </div>

                    <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">
                        x
                    </button>
                </header>

                <form className="tp-detail-form" onSubmit={handleSubmit}>
                    <div className="tp-detail-form__grid">
                        <label className="tp-field">
                            <span className="tp-field__label">Nombre del insumo</span>
                            <input className="tp-field__input" value={state.Title} onChange={(e) => setField("Title", e.target.value as plantillaInsumos["Title"])} required/>
                        </label>

                        <label className="tp-field">
                            <span className="tp-field__label">Tipo del insumo</span>
                            <select className="tp-field__input" value={state.Categoria} onChange={(e) => setField("Categoria", e.target.value as plantillaInsumos["Categoria"])} required>
                              <option value="">Selecciona el tipo de categoria</option>
                              <option value="Archivo">Archivo</option>
                              <option value="Texto">Texto</option>
                              <option value="Opcion">Opcion</option>
                            </select>
                        </label>
                    </div>

                    <footer className="tp-detail-form__footer">
                        {isEdit && (
                            <button type="button" className="tp-btn tp-btn--danger" onClick={handleDeleteClick}>
                                Eliminar
                            </button>
                        )}

                        <div className="tp-detail-form__footer-right">
                            <button type="button" className="tp-btn tp-btn--ghost" onClick={onClose}>
                                Cancelar
                            </button>

                            <button type="submit" className="tp-btn tp-btn--primary">
                                {isEdit ? "Guardar cambios" : "Crear insumo"}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </section>
    </>
  );
};

