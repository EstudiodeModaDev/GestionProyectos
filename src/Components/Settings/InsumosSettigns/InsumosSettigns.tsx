import * as React from "react";
import "../TasksSettings/TaskSettings.css";
import type { Plantilla } from "../Settings";
import type { plantillaInsumos } from "../../../models/Insumos";
import { InsumoDetailModal } from "./DetailInsumosTemplate";

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

/**
 * Lista los insumos configurados para una plantilla y abre su detalle editable.
 *
 * @param props - Datos de plantilla, estado del modal y acciones CRUD.
 * @returns Modal principal de administracion de insumos.
 */
/* =========================================================
   Modal principal: lista de insumos por plantilla
   ========================================================= */

export const InsumosPlantillaModal: React.FC<InsumosPlantillaModalProps> = ({open, plantilla, insumos, loading, onClose, state, setField, onCrearInsumo, onEditarInsumo, onEliminarInsumo, accion}) => {
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [selectedInsumo, setSelectedInsumo] = React.useState<plantillaInsumos | null>(null);

    if (!open) return null;

    

    /**
     * Reinicia el formulario para crear un nuevo insumo.
     */
    const resetStateForNew = () => {
        setField("id", plantilla.id);
        setField("nombre_insumo", "" as plantillaInsumos["nombre_insumo"]);
        setField("categoria", "" as plantillaInsumos["categoria"]);
        setField("proceso", plantilla.nombre as plantillaInsumos["proceso"]);
    };

    

    /**
     * Abre el modal de detalle en modo creacion.
     */
    const handleNuevoInsumo = () => {
        setSelectedInsumo(null);
        resetStateForNew();
        setDetailOpen(true);
    };

    

    /**
     * Abre el modal de detalle cargando los datos del insumo seleccionado.
     *
     * @param ins - Insumo elegido desde la lista.
     */
    const handleClickInsumo = (ins: plantillaInsumos) => {
        setSelectedInsumo(ins);
        setField("id", (ins.id ?? "") as plantillaInsumos["id"]);
        setField("nombre_insumo", (ins.nombre_insumo ?? "") as plantillaInsumos["nombre_insumo"]);
        setField("categoria", (ins.categoria ?? "") as plantillaInsumos["categoria"]);
        setField("proceso", (ins.proceso ?? "") as plantillaInsumos["proceso"]);
        setDetailOpen(true);
    };

    return (
        <>
        {/* Backdrop principal */
}
        <div className="tp-modal-backdrop" onClick={onClose} />

            {/* Panel principal */
}
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
                                    const id = ins.id ?? `${ins.proceso}-${ins.nombre_insumo}`;
                                    const nombre = ins.nombre_insumo ?? "Insumo sin título";
                                    const categoria = ins.categoria ?? "";
                                    const proceso = ins.proceso ?? "";

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

            {/* Modal de detalle de insumo */
}
        <InsumoDetailModal open={detailOpen} plantilla={plantilla} insumo={selectedInsumo} onClose={() => setDetailOpen(false)} state={state} setField={setField} onCrearInsumo={onCrearInsumo} onEditarInsumo={onEditarInsumo} onEliminarInsumo={onEliminarInsumo} insumos={insumos} accion={accion}/>
    </>
  );
};

