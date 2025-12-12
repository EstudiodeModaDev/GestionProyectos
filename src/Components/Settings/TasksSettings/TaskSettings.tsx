// src/Components/Plantillas/TasksSettings/TaskSettings.tsx
import * as React from "react";
import "./TaskSettings.css";
import type { Plantilla } from "../Settings";
import type { apertura } from "../../../models/AperturaTienda";
import type { plantillaInsumos, plantillaTareaInsumo } from "../../../models/Insumos";

/* =========================================================
   Tipos de props
   ========================================================= */

type TareasPlantillaModalProps = {
  open: boolean;
  plantilla: Plantilla;
  tareas: apertura[];
  loading: boolean;
  onClose: () => void;
  onGuardarTarea: () => void | Promise<void>;
  onEditTask: (Id: string) => void | Promise<void>;
  onEliminarTarea: (id: string) => void | Promise<void>;
  state: apertura;
  setField: <K extends keyof apertura>(k: K, v: apertura[K]) => void;
  proceso: string;
  insumos: plantillaInsumos[];
  links: plantillaTareaInsumo[];
  onAddLink: (proceso: string, tasCode: string, InsumoId: string, tipoUso: "Entrada" | "Salida") => void | Promise<void>;
  onDeleteLink: (id: string, proceso: string) => void | Promise<void>;
};

type TaskDetailModalProps = {
  open: boolean;
  plantilla: Plantilla;
  tarea: apertura | null;
  onClose: () => void;
  onSaveNueva: () => void | Promise<void>;
  onSaveEditar: (Id: string) => void | Promise<void>;
  onEliminarTarea: (id: string) => void | Promise<void>;
  state: apertura;
  setField: <K extends keyof apertura>(k: K, v: apertura[K]) => void;
  rows: apertura[];
  proceso: string;
  insumos: plantillaInsumos[];
  links: plantillaTareaInsumo[];
  onAddLink: (proceso: string, tasCode: string, InsumoId: string, tipoUso: "Entrada" | "Salida") => void | Promise<void>;
  onDeleteLink: (id: string, proceso: string) => void | Promise<void>;
};

/* =========================================================
   Helper: siguiente código Tn
   ========================================================= */

export function getNextTaskCode(rows: apertura[]): string {
  const prefix = "T";

  const numbers = rows
    .map((t) => t.Codigo)
    .filter((c): c is string => typeof c === "string" && c.startsWith(prefix))
    .map((c) => parseInt(c.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));

  const max = numbers.length ? Math.max(...numbers) : 0;
  const next = max + 1;

  return `T${next}`;
}

/* =========================================================
   Modal principal: lista de tareas
   ========================================================= */

export const TareasPlantillaModal: React.FC<TareasPlantillaModalProps> = ({open, plantilla, tareas, loading, onClose, onGuardarTarea, state, setField, onEditTask, onEliminarTarea, insumos, links, onAddLink, onDeleteLink, proceso}) => {
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<apertura | null>(null);

    if (!open) return null;

    const resetStateForNew = () => {
        setField("Id", undefined as any);
        setField("Title", "" as apertura["Title"]);
        setField("TipoTarea", "" as apertura["TipoTarea"]);
        setField("Phase", "" as apertura["Phase"]);
        setField("Diaspararesolver", "" as apertura["Diaspararesolver"]);
        setField("Codigo", "" as apertura["Codigo"]);
        setField("Responsable", "" as apertura["Responsable"]);
        setField("CorreoResponsable", "" as apertura["CorreoResponsable"]);
        setField("Dependencia", "" as apertura["Dependencia"]);
    };

    const handleNuevaTarea = () => {
        setSelectedTask(null);
        resetStateForNew();
        setDetailOpen(true);
    };

    const handleClickTarea = (t: apertura) => {
        setSelectedTask(t);
        setField("Codigo", (t.Codigo ?? "") as apertura["Codigo"]);
        setField("Dependencia", (t.Dependencia ?? "") as apertura["Dependencia"]);
        setField("Diaspararesolver", (t.Diaspararesolver ?? "") as apertura["Diaspararesolver"]);
        setField("Id", (t.Id ?? "") as apertura["Id"]);
        setField("TipoTarea", (t.TipoTarea ?? "") as apertura["TipoTarea"]);
        setField("Title", (t.Title ?? "") as apertura["Title"]);
        setField("Responsable", (t.Responsable ?? "") as apertura["Responsable"]);
        setField("CorreoResponsable", (t.CorreoResponsable ?? "") as apertura["CorreoResponsable"]);
        setField("Phase", (t.Phase ?? "") as apertura["Phase"]);
        setDetailOpen(true);
    };

    const handleSaveNueva = async () => {
        await onGuardarTarea();
        setDetailOpen(false);
    };

    const handleSaveEditar = async (id: string) => {
        await onEditTask(id);
        setDetailOpen(false);
    };

    return (
        <>
            {/* Backdrop principal */}
            <div className="tp-modal-backdrop" onClick={onClose} />

            {/* Panel principal */}
                <section className="tp-modal" role="dialog" aria-modal="true" aria-labelledby="tp-modal-title">
                    <div className="tp-modal__panel">
                        <header className="tp-modal__header">
                            <div>
                                <h2 id="tp-modal-title" className="tp-modal__title">Tareas de la plantilla</h2>
                                <p className="tp-modal__subtitle">{plantilla.nombre}</p>
                            </div>

                            <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">
                                ✕
                            </button>
                        </header>

                        <div className="tp-modal__toolbar">
                            <span className="tp-modal__counter">
                            {loading ? "Cargando tareas..." : `${tareas.length} tareas`}
                        </span>

                    <button type="button" className="tp-btn tp-btn--primary" onClick={handleNuevaTarea}>
                        <span className="tp-btn__icon" aria-hidden="true">
                            +
                        </span>
                        Nueva tarea
                    </button>
                </div>

                <div className="tp-modal__body">
                    {loading ? (
                        <div className="tp-skeleton-list">
                            <div className="tp-skeleton-row" />
                            <div className="tp-skeleton-row" />
                            <div className="tp-skeleton-row" />
                        </div>
                    ) : tareas.length === 0 ? (
                        <div className="tp-empty">
                            <p>No hay tareas configuradas en esta plantilla.</p>
                            <button type="button"className="tp-btn tp-btn--ghost" onClick={handleNuevaTarea}>Crear la primera tarea</button>
                        </div>
                    ) : (
                        <ul className="tp-task-list">
                            {tareas.map((t) => {
                                const id = t.Id;
                                const title = t.Title ?? "Tarea sin título";
                                const type = t.TipoTarea ?? "";
                                const phase = t.Phase ?? "";
                                const dias = t.Diaspararesolver ?? "";

                                return (
                                    <li key={id}>
                                        <button type="button" className="tp-task-row" onClick={() => handleClickTarea(t)}>
                                            <div className="tp-task-row__main">
                                                <span className="tp-task-row__title">{title}</span>
                                                {type && (
                                                    <span className="tp-task-row__meta">{type}</span>
                                                )}
                                            </div>

                                            <div className="tp-task-row__side">
                                                {phase && (
                                                    <span className="tp-chip tp-chip--primary">
                                                    {phase}
                                                    </span>
                                                )}
                                                {dias && (
                                                    <span className="tp-chip tp-chip--soft">
                                                    {dias} días
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

      {/* Modal de detalle (tercer modal) */}
      <TaskDetailModal open={detailOpen} plantilla={plantilla} tarea={selectedTask} onClose={() => setDetailOpen(false)} onSaveNueva={handleSaveNueva} onSaveEditar={handleSaveEditar} onEliminarTarea={onEliminarTarea} state={state} setField={setField} rows={tareas} insumos={insumos} links={links} onAddLink={onAddLink} onDeleteLink={onDeleteLink} proceso={proceso}/>
    </>
  );
};

/* =========================================================
   Modal de detalle de tarea + bloque de insumos
   ========================================================= */

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({open, plantilla, tarea, onClose, onSaveNueva, onSaveEditar, onEliminarTarea, state, setField, rows, insumos, links, onAddLink, onDeleteLink, proceso}) => {
    const isEdit = Boolean(tarea);
    // Estado local para relaciones insumo-tarea
    const [selectedInsumoId, setSelectedInsumoId] = React.useState<string>("");
    const [selectedTipoUso, setSelectedTipoUso] = React.useState<"Entrada" | "Salida">("Entrada");
    const [savingRel, setSavingRel] = React.useState(false);
    const [deletingRelId, setDeletingRelId] = React.useState<string | null>(null);

    const taskCode = state.Codigo ?? "";

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
            setField("Title", (tarea.Title ?? "") as apertura["Title"]);
            setField("TipoTarea", (tarea.TipoTarea ?? "") as apertura["TipoTarea"]);
            setField("Phase", (tarea.Phase ?? "") as apertura["Phase"]);
            setField("Diaspararesolver", (tarea.Diaspararesolver ?? "") as apertura["Diaspararesolver"]);
            setField("Id", (tarea.Id ?? "") as apertura["Id"]);
            setField("Codigo", (tarea.Codigo ?? "") as apertura["Codigo"]);
            setField("Dependencia", (tarea.Dependencia ?? "") as apertura["Dependencia"]);
        } else {
            setField("Title", "" as apertura["Title"]);
            setField("TipoTarea", "" as apertura["TipoTarea"]);
            setField("Phase", "" as apertura["Phase"]);
            setField("Diaspararesolver", "" as apertura["Diaspararesolver"]);
            setField("Dependencia", "" as apertura["Dependencia"]);
            setField("Codigo", getNextTaskCode(rows));
            setField("Id", undefined as any);
        }
    }, [open, tarea, rows, setField]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && state.Id) {
            await onSaveEditar(state.Id);
        } else {
            await onSaveNueva();
        }
    };

    const handleDeleteClick = async () => {
        if (!state.Id) return;
        const ok = window.confirm(`¿Seguro que deseas eliminar la tarea "${state.Title}" (${state.Codigo})?\nEsta acción no se puede deshacer.`);
        if (!ok) return;

        await onEliminarTarea(state.Id);
        onClose();
    };

  // ================== Relaciones con insumos ==================



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

  const handleDeleteRelation = async (id: string) => {
    setDeletingRelId(id);
    try {
      await onDeleteLink(id, proceso);
    } finally {
      setDeletingRelId(null);
    }
  };

  // ================== Render ==================

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

                        <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">✕</button>   
                    </header>

                    <form className="tp-detail-form" onSubmit={handleSubmit}>
                        {/* ===== Campos de la tarea ===== */}
                        <div className="tp-detail-form__grid">
                            <label className="tp-field">
                                <span className="tp-field__label">Código de la tarea</span>
                                <input className="tp-field__input" value={state.Codigo ?? ""} readOnly/>
                            </label>

                            <label className="tp-field">
                                <span className="tp-field__label">Título de la tarea</span>
                                <input className="tp-field__input" value={state.Title ?? ""} onChange={(e) => setField("Title", e.target.value as apertura["Title"])} required/>
                            </label>

                            <label className="tp-field"> 
                                <span className="tp-field__label">Fase</span>
                                <input className="tp-field__input" value={state.Phase ?? ""} onChange={(e) => setField("Phase", e.target.value as apertura["Phase"])} required/>
                            </label>

                            <label className="tp-field">
                                <span className="tp-field__label">Tipo de tarea</span>
                                    <select className="tp-field__input" value={state.TipoTarea ?? ""} onChange={(e) => setField("TipoTarea", e.target.value as apertura["TipoTarea"])}>
                                        <option value="">Selecciona…</option>
                                        <option value="Media">Media</option>
                                        <option value="Crítica">Crítica</option>
                                    </select>
                            </label>

                            <label className="tp-field">
                                <span className="tp-field__label">Días para resolver</span>
                                <input className="tp-field__input" type="number" min={0} value={state.Diaspararesolver ?? ""} onChange={(e) => setField("Diaspararesolver", e.target.value as apertura["Diaspararesolver"])}/>
                            </label>

                            <label className="tp-field">
                                <span className="tp-field__label">Depende de</span>
                                <select className="tp-field__input" value={state.Dependencia ?? ""} onChange={(e) => setField( "Dependencia", e.target.value as apertura["Dependencia"])}>
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

                        {/* ===== Bloque de insumos asociados ===== */}
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

                            {/* Form para agregar nueva relación */}
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

                        {/* ===== Footer ===== */}
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
        <div/>
    </>
  );
};
