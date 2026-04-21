import React from "react";
import { useGraphServices } from "../../graph/graphContext";

import type { ProjectSP } from "../../models/Projects";
import { useProjects } from "../../Funcionalidades/Projects/useProjects";


interface NuevoProyectoModalProps {open: boolean; onClose: () => void; Selected:ProjectSP }

/**
 * Permite actualizar el nombre visible de un proyecto existente.
 *
 * @param props - Propiedades del modal de renombrado.
 * @returns Modal con el formulario de cambio de nombre.
 */
export const RenombrarProyectoModal: React.FC<NuevoProyectoModalProps> = ({open, onClose, Selected}) => {
    const {proyectos} = useGraphServices()
    const {state, setField, changeName, loading} = useProjects(proyectos)

    React.useEffect(() => {
        if(Selected){
            setField("Title", Selected.Title )
        }
    }, [Selected]);

    if (!open) return null;


    return (
        <div className="modal">
            <div className="modal__backdrop" onClick={onClose} />

            <div className="modal__panel" role="dialog" aria-modal="true">
                {/* Header */
}
                <header className="modal__header">
                    <div>
                        <h2 className="modal__title">Renombrar Proyecto</h2>
                    </div>
                    <button type="button" className="modal__close" aria-label="Cerrar" onClick={onClose}>
                        ×
                    </button>
                </header>

                <hr className="modal__divider" />

                {/* Form */
}
                <form onSubmit={() => {changeName(Selected.Id ?? "", state.Title); onClose()}} className="modal__form">
                    <div className="field">
                        <label className="field__label">Nuevo nombre del proyecto</label>
                        <input type="text" className="field__input" value={state.Title} onChange={(e) => setField("Title", e.target.value)} placeholder="" required/>
                    </div>

                {/* Footer botones */
}
                    <div className="modal__footer">
                        <button type="button" className="btn modal__btn-cancel" onClick={onClose} disabled={loading}> 
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn--primary modal__btn-primary" disabled={loading}>
                            {!loading ? "Guardar nombre" : "Renombrando proyecto..."}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
