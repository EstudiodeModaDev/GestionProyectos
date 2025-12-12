import * as React from "react";
import "../TasksSettings/TaskSettings.css";
import type { Plantilla } from "../Settings";
import type { plantillaInsumos } from "../../../models/Insumos";

type InsumosPlantillaModalProps = {
  open: boolean;
  plantilla: Plantilla;
  insumos: plantillaInsumos[];
  loading: boolean;
  onClose: () => void;
  state: plantillaInsumos;
  setField: <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) => void;
  onCrearInsumo: (proceso: string) => void | Promise<void>;
  onEditarInsumo: (id: string, proceso: string) => void | Promise<void>;
  onEliminarInsumo: (id: string, proceso: string) => void | Promise<void>;
  accion: string
};

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

/* =========================================================
   Modal principal: lista de insumos por plantilla
   ========================================================= */

export const InsumosPlantillaModal: React.FC<InsumosPlantillaModalProps> = ({open, plantilla, insumos, loading, onClose, state, setField, onCrearInsumo, onEditarInsumo, onEliminarInsumo, accion}) => {
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [selectedInsumo, setSelectedInsumo] = React.useState<plantillaInsumos | null>(null);

    if (!open) return null;

    const resetStateForNew = () => {
        setField("Id", undefined as any);
        setField("Title", "" as plantillaInsumos["Title"]);
        setField("Categoria", "" as plantillaInsumos["Categoria"]);
        setField("Proceso", plantilla.nombre as plantillaInsumos["Proceso"]);
    };

    const handleNuevoInsumo = () => {
        setSelectedInsumo(null);
        resetStateForNew();
        setDetailOpen(true);
    };

    const handleClickInsumo = (ins: plantillaInsumos) => {
        setSelectedInsumo(ins);
        setField("Id", (ins.Id ?? "") as plantillaInsumos["Id"]);
        setField("Title", (ins.Title ?? "") as plantillaInsumos["Title"]);
        setField("Categoria", (ins.Categoria ?? "") as plantillaInsumos["Categoria"]);
        setField("Proceso", (ins.Proceso ?? "") as plantillaInsumos["Proceso"]);
        setDetailOpen(true);
    };

    return (
        <>
        {/* Backdrop principal */}
        <div className="tp-modal-backdrop" onClick={onClose} />

            {/* Panel principal */}
            <section className="tp-modal" role="dialog" aria-modal="true" aria-labelledby="ip-modal-title">
                <div className="tp-modal__panel">
                    <header className="tp-modal__header">
                        <div>
                            <h2 id="ip-modal-title" className="tp-modal__title">Insumos de la plantilla</h2>
                            <p className="tp-modal__subtitle">{plantilla.nombre}</p>
                        </div>

                        <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">
                            ✕
                        </button>
                    </header>

                    <div className="tp-modal__toolbar">
                        <span className="tp-modal__counter">
                            {loading ? "Cargando insumos..." : `${insumos.length} insumos`}
                        </span>

                        <button type="button" className="tp-btn tp-btn--primary" onClick={handleNuevoInsumo} >
                            <span className="tp-btn__icon" aria-hidden="true">
                                +
                            </span>
                            Nuevo insumo
                        </button>
                    </div>

                    <div className="tp-modal__body">
                        {loading ? (
                            <div className="tp-skeleton-list">
                                <div className="tp-skeleton-row" />
                                <div className="tp-skeleton-row" />
                                <div className="tp-skeleton-row" />
                            </div>
                        ) : insumos.length === 0 ? (
                            <div className="tp-empty">
                                <p>No hay insumos configurados para esta plantilla.</p>
                                <button type="button" className="tp-btn tp-btn--ghost" onClick={handleNuevoInsumo}>
                                    Crear el primer insumo
                                </button>
                            </div>
                        ) : (
                            <ul className="tp-task-list">
                                {insumos.map((ins) => {
                                    const id = ins.Id ?? `${ins.Proceso}-${ins.Title}`;
                                    const nombre = ins.Title ?? "Insumo sin título";
                                    const categoria = ins.Categoria ?? "";
                                    const proceso = ins.Proceso ?? "";

                                    return (
                                        <li key={id}>
                                            <button type="button" className="tp-task-row" onClick={() => handleClickInsumo(ins)}>
                                                <div className="tp-task-row__main">
                                                    <span className="tp-task-row__title">{nombre}</span>
                                                    {proceso && (
                                                        <span className="tp-task-row__meta">
                                                            {proceso}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="tp-task-row__side">
                                                    {categoria && (
                                                        <span className="tp-chip tp-chip--primary">
                                                            {categoria}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal de detalle de insumo */}
        <InsumoDetailModal open={detailOpen} plantilla={plantilla} insumo={selectedInsumo} onClose={() => setDetailOpen(false)} state={state} setField={setField} onCrearInsumo={onCrearInsumo} onEditarInsumo={onEditarInsumo} onEliminarInsumo={onEliminarInsumo} insumos={insumos} accion={accion}/>
    </>
  );
};

/* =========================================================
   Modal detalle de insumo
   ========================================================= */

const InsumoDetailModal: React.FC<InsumoDetailModalProps> = ({open, plantilla, insumo, onClose, state, setField, onCrearInsumo, onEditarInsumo, onEliminarInsumo, accion}) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && state.Id) {
      await onEditarInsumo(state.Id, accion);
    } else {
      await onCrearInsumo(accion);
    }

    onClose();
  };

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
                        ✕
                    </button>
                </header>

                <form className="tp-detail-form" onSubmit={handleSubmit}>
                    <div className="tp-detail-form__grid">
                        <label className="tp-field">
                            <span className="tp-field__label">Nombre del insumo</span>
                            <input className="tp-field__input" value={state.Title} onChange={(e) => setField("Title", e.target.value as plantillaInsumos["Title"])} required/>
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
