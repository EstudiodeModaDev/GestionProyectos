// src/Components/Plantillas/TasksSettings/TaskSettings.tsx
import * as React from "react";
import "./TaskSettings.css";
import type { Plantilla } from "../Settings";
import type { plantillaInsumos, plantillaTareaInsumo } from "../../../models/Insumos";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import TaskDetailModal from "./TemplateTaskModal";

/* =========================================================
   Tipos de props
   ========================================================= */

type TareasPlantillaModalProps = {
  open: boolean;
  plantilla: Plantilla;
  tareas: TemplateTasks[];
  loading: boolean;
  onClose: () => void;
  onGuardarTarea: () => void | Promise<void>;
  onEditTask: (Id: string) => void | Promise<void>;
  onEliminarTarea: (id: string) => void | Promise<void>;
  state: TemplateTasks;
  setField: <K extends keyof TemplateTasks>(k: K, v: TemplateTasks[K]) => void;
  setState: (t: TemplateTasks) => void
  cleanState: () => void
  proceso: string;
  insumos: plantillaInsumos[];
  links: plantillaTareaInsumo[];
  onAddLink: (proceso: string, tasCode: string, InsumoId: string, tipoUso: "Entrada" | "Salida") => void | Promise<void>;
  onDeleteLink: (id: string, proceso: string) => void | Promise<void>;
};

/**
 * Lista las tareas de una plantilla y abre su modal de detalle.
 *
 * @param props - Datos de plantilla, catalogos y acciones CRUD de tareas.
 * @returns Modal principal para administrar tareas de plantilla.
 */
export const TareasPlantillaModal: React.FC<TareasPlantillaModalProps> = ({cleanState, setState, open, plantilla, tareas, loading, onClose, onGuardarTarea, state, setField, onEditTask, onEliminarTarea, insumos, links, onAddLink, onDeleteLink, proceso}) => {
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<TemplateTasks | null>(null);

    if (!open) return null;

    /**
     * Abre el detalle en modo creacion de tarea.
     */
    const handleNuevaTarea = () => {
        setSelectedTask(null);
        cleanState();
        setDetailOpen(true);
    };

    /**
     * Abre el detalle cargando la tarea seleccionada.
     *
     * @param t - Tarea elegida desde la lista.
     */
    const handleClickTarea = (t: TemplateTasks) => {
        setSelectedTask(t);
        setState(t)
        setDetailOpen(true);
    };

    

    /**
     * Guarda una tarea nueva y cierra el modal de detalle.
     */
    const handleSaveNueva = async () => {
        await onGuardarTarea();
        setDetailOpen(false);
    };


    /**
     * Guarda los cambios de una tarea existente y cierra el modal de detalle.
     *
     * @param id - Identificador de la tarea editada.
     */
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
                                const id = t.id;
                                const title = String(t.codigo  + " - " + t.nombre_tarea) ?? "Tarea sin título";
                                const type = t.tipo_tarea ?? "";
                                const phase = t.fase ?? "";
                                const dias = t.dias_para_resolver ?? "";

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

      {/* Modal de detalle (tercer modal) */
}
      <TaskDetailModal 
        open={detailOpen} 
        plantilla={plantilla} 
        tarea={selectedTask} 
        onClose={() => setDetailOpen(false)} 
        onSaveNueva={handleSaveNueva} 
        onSaveEditar={handleSaveEditar} 
        onEliminarTarea={onEliminarTarea} 
        state={state} 
        setField={setField} 
        rows={tareas} 
        insumos={insumos} 
        links={links} 
        onAddLink={onAddLink} 
        onDeleteLink={onDeleteLink} 
        proceso={proceso} 
        setState={setState} 
        cleanState={cleanState}/>
    </>
  );
};

