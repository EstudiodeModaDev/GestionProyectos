import React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { Plantilla } from "../Settings";
import type { plantillaInsumos, plantillaTareaInsumo } from "../../../models/Insumos";
import { getNextTaskCode } from "../../../utils/Tasks";

type TaskDetailModalProps = {
  open: boolean;
  plantilla: Plantilla;
  tarea?: TemplateTasks | null;
  onClose: () => void;
  onSaveNueva: () => void | Promise<void>;
  onSaveEditar: (Id: string) => void | Promise<void>;
  onEliminarTarea: (id: string) => void | Promise<void>;
  state: TemplateTasks;
  setField: <K extends keyof TemplateTasks>(k: K, v: TemplateTasks[K]) => void;
  setState: (k: TemplateTasks) => void 
  cleanState: () => void
  rows: TemplateTasks[];
  proceso: string;
  insumos: plantillaInsumos[];
  links: plantillaTareaInsumo[];
  onAddLink: (proceso: string, tasCode: string, InsumoId: string, tipoUso: "Entrada" | "Salida") => void | Promise<void>;
  onDeleteLink: (id: string, proceso: string) => void | Promise<void>;
};

/**
 * Permite crear, editar y relacionar una tarea de plantilla con sus insumos.
 *
 * @param props - Estado del modal, formulario y callbacks de persistencia.
 * @returns Modal de detalle para la configuracion de una tarea.
 */
export default function TaskDetailModal({
  setState, onClose, onSaveNueva, onSaveEditar, onEliminarTarea, setField, onAddLink, onDeleteLink, cleanState,
  open, plantilla, tarea, state,  rows, insumos, links, proceso}: TaskDetailModalProps){
  
  const isEdit = Boolean(tarea);
  const [selectedInsumoId, setSelectedInsumoId] = React.useState<string>("");
  const [selectedTipoUso, setSelectedTipoUso] = React.useState<"Entrada" | "Salida">("Entrada");
  const [savingRel, setSavingRel] = React.useState(false);
  const [deletingRelId, setDeletingRelId] = React.useState<string | null>(null);

  const taskCode = state.Codigo ?? "";

  //Insumos relacionados a la tarea
  const linkedInsumos = React.useMemo(
      () => links.filter((l) => l.Title === taskCode),
      [links, taskCode]
  );

  const insumoById = React.useMemo(() => {
      const m = new Map<string, plantillaInsumos>();
      insumos.forEach((ins) => {
          if (ins.Id) m.set(ins.Id, ins);
      });
      return m;
  }, [insumos]);

  React.useEffect(() => {
    if (!open) return;

    if (tarea) {
      setState(tarea);
      return;
    }
    cleanState();
    setField("Codigo", getNextTaskCode(rows)); 
  }, [open, tarea, rows,]);

  

  /**
   * Guarda la tarea en modo creacion o edicion segun el contexto.
   *
   * @param e - Evento de envio del formulario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isEdit && state.Id) {
          await onSaveEditar(state.Id);
      } else {
          await onSaveNueva();
      }
  };

  

  /**
   * Elimina la tarea actual y cierra el modal.
   */
  const handleDeleteClick = async () => {
      if (!state.Id) return;
      await onEliminarTarea(state.Id);
      onClose();
  };

  // ================== Relaciones con insumos ==================

  

  /**
   * Crea una relacion entre la tarea actual y un insumo de plantilla.
   */
  const handleAddRelation = async () => {
    if (!taskCode || !selectedInsumoId) return;
    setSavingRel(true);
    try {
      await onAddLink(proceso, taskCode, selectedInsumoId, selectedTipoUso);
        setSelectedInsumoId("");
        setSelectedTipoUso("Entrada");
    } finally {
        setSavingRel(false);
    }
  };

  

  /**
   * Elimina una relacion existente entre tarea e insumo.
   *
   * @param id - Identificador del vinculo a borrar.
   */
  const handleDeleteRelation = async (id: string) => {
    setDeletingRelId(id);
    try {
      await onDeleteLink(id, proceso);
    } finally {
      setDeletingRelId(null);
    }
  };

  // ================== Render ==================
  if (!open) return null;

  return (
    <>
      <div className="tp-modal-backdrop tp-modal-backdrop--nested" onClick={onClose}/>
        <section className="tp-detail-modal" role="dialog" aria-modal="true" aria-labelledby="tp-detail-title">
          <div className="tp-detail-modal__panel">
            <header className="tp-detail-modal__header">
              <div>
                <h2 id="tp-detail-title" className="tp-detail-modal__title">{isEdit ? "Editar tarea" : "Nueva tarea"} </h2>
                <p className="tp-detail-modal__subtitle">Plantilla: {plantilla.nombre} · Código: {taskCode || "—"} </p>
              </div>

              <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">x</button>
            </header>

            <form className="tp-detail-form" onSubmit={handleSubmit}>
              {/* ===== Campos de la tarea ===== */
}
              <div className="tp-detail-form__grid">
              <label className="tp-field">
                <span className="tp-field__label">Código de la tarea</span>
                <input className="tp-field__input" value={state.Codigo ?? ""} readOnly/>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Título de la tarea</span>
                <input className="tp-field__input" value={state.Title ?? ""} onChange={(e) => setField("Title", e.target.value as TemplateTasks["Title"])} required/>
              </label>

              <label className="tp-field"> 
                <span className="tp-field__label">Fase</span>
                <input className="tp-field__input" value={state.Phase ?? ""} onChange={(e) => setField("Phase", e.target.value as TemplateTasks["Phase"])} required/>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Tipo de tarea</span>
                <select className="tp-field__input" value={state.TipoTarea ?? ""} onChange={(e) => setField("TipoTarea", e.target.value as TemplateTasks["TipoTarea"])}>
                  <option value="">Selecciona…</option>
                  <option value="Media">Media</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </label>

              <div className="tp-row-2">
                <label className="tp-field">
                  <span className="tp-field__label">Días para resolver</span>
                  <input className="tp-field__input tp-field__input_xs" type="number" min={0} value={state.Diaspararesolver ?? 0} onChange={(e) => setField("Diaspararesolver", Number(e.target.value) as TemplateTasks["Diaspararesolver"])}/>
                </label>

                <label className="tp-field tp-field--checkbox">
                  <span className="tp-field__label">¿Cuenta solo días hábiles?</span>
                  <input className="tp-field__checkbox" type="checkbox" checked={!!state.diasHabiles} onChange={(e) => setField("diasHabiles", e.target.checked)}/>
                </label>
              </div>

              <label className="tp-field">
                  <span className="tp-field__label">Depende de</span>
                  <select className="tp-field__input" value={state.Dependencia ?? ""} onChange={(e) => setField( "Dependencia", e.target.value as TemplateTasks["Dependencia"])}>
                      <option value="">Ninguna</option>
                      {rows.map((t) => {
                          const code = t.Codigo ?? "";
                          const title = t.Title ?? "";
                          return (
                              <option key={code} value={code}>{code} - {title}</option>
                          );
                      })}
                  </select>
              </label>
            </div>

            {/* ===== Bloque de insumos asociados ===== */
}
            <section className="tp-detail-insumos">
                <div className="tp-detail-insumos__header">
                    <h3 className="tp-detail-insumos__title">Insumos asociados a esta tarea</h3>
                    <p className="tp-detail-insumos__hint">Define qué insumos se usan como Entrada o Salida en esta tarea.</p>
                </div>

                {linkedInsumos.length === 0 ? (
                    <div className="tp-detail-insumos__empty">
                        <p>Esta tarea aún no tiene insumos asociados.</p>
                    </div>
                ) : (
                    <ul className="tp-detail-insumos__list">
                        {linkedInsumos.map((link) => {
                            const ins = link.IdInsumo ? insumoById.get(link.IdInsumo) : undefined;
                            const nombre = ins?.Title ?? "Insumo eliminado";
                            const tipoUso = (link.TipoInsumo as "Entrada" | "Salida") || "Entrada";

                            return (
                                <li className="tp-detail-insumos__item" key={link.Id ?? `${link.Title}-${link.IdInsumo}`}>
                                    <div className="tp-detail-insumos__item-main">
                                        <span className="tp-detail-insumos__item-title">{nombre}</span>
                                        <span className="tp-detail-insumos__item-sub">{tipoUso} · {link.Title}</span>
                                    </div>

                                    <div className="tp-detail-insumos__item-side">
                                        <span className={"tp-chip " + (tipoUso === "Entrada" ? "tp-chip--soft" : "tp-chip--primary")}>{tipoUso}</span>
                                        {link.Id && (
                                            <button type="button" className="tp-btn tp-btn--ghost tp-btn--xs" onClick={() => handleDeleteRelation(link.Id!)} disabled={deletingRelId === link.Id}>
                                                {deletingRelId === link.Id ? "Eliminando..." :"Quitar"}  
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Form para agregar nueva relación */
}
                <div className="tp-detail-insumos__add">
                    <div className="tp-detail-insumos__add-row">
                        <label className="tp-field tp-field--inline">
                            <span className="tp-field__label">Insumo</span>
                                <select className="tp-field__input" value={selectedInsumoId} onChange={(e) => setSelectedInsumoId(e.target.value)}>
                                <option value="">Selecciona un insumo…</option>
                                    {insumos.map((ins) =>
                                        ins.Id ? (
                                        <option key={ins.Id} value={ins.Id}>{ins.Title} ({ins.Categoria})</option>) : null
                                    )}
                            </select>
                        </label>

                        <label className="tp-field tp-field--inline">
                            <span className="tp-field__label">Tipo de uso</span>
                            <select className="tp-field__input" value={selectedTipoUso} onChange={(e) => setSelectedTipoUso(e.target.value as "Entrada" | "Salida")}>
                                <option value="Entrada">Entrada</option>
                                <option value="Salida">Salida</option>
                            </select>
                        </label>

                        <button type="button" className="tp-btn tp-btn--primary tp-btn--sm" onClick={handleAddRelation} disabled={!selectedInsumoId || savingRel}>
                            {savingRel ? "Agregando..." : "Añadir insumo"}
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */
}
            <footer className="tp-detail-form__footer">
                <div className="tp-detail-form__footer-left">
                    {isEdit && state.Id && (
                        <button type="button" className="tp-btn tp-btn--danger" onClick={handleDeleteClick}>
                            Eliminar tarea
                        </button>
                    )}
                </div>

                <div className="tp-detail-form__footer-right">
                    <button type="button" className="tp-btn tp-btn--ghost" onClick={onClose}>
                        Cancelar
                    </button>

                    <button type="submit" className="tp-btn tp-btn--primary">
                        {isEdit ? "Guardar cambios" : "Crear tarea"}
                    </button>
                </div>
            </footer>
          </form>
        </div>
      </section>
    </>
  );
};

