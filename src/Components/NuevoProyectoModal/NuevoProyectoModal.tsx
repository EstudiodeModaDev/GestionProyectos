import React from "react";
import "./NuevoProyectoModal.css";
import { useGraphServices } from "../../graph/graphContext";
import { useProjects } from "../../Funcionalidades/Proyectos";

import { useTasks } from "../../Funcionalidades/Tasks";
import { useInsumosProyecto, usePlantillaInsumos, useTareaInsumoProyecto, useTareaPlantillaInsumo } from "../../Funcionalidades/Insumos";
import { useAperturaTiendaPlantilla } from "../../Funcionalidades/AperturaTienda";


interface NuevoProyectoModalProps {open: boolean; onClose: () => void;}

export const NuevoProyectoModal: React.FC<NuevoProyectoModalProps> = ({open, onClose,}) => {
  const {proyectos, apertura: aperturaSvc, tasks, plantillaInsumos, insumoProyecto, plantillaTareaInsumo, tareaInsumoProyecto} = useGraphServices()
  const {state, setField, handleSubmit, loading} = useProjects(proyectos)
  const {loadInsumosPlantilla} = usePlantillaInsumos(plantillaInsumos)
  const {rows: tareasCrear} = useAperturaTiendaPlantilla(aperturaSvc)
  const {createAllInsumosFromTemplate} = useInsumosProyecto(insumoProyecto)
  const {createAllTemplate, loading: submitting} = useTasks(tasks)
  const {loadTareaInsumosPlantilla} = useTareaPlantillaInsumo(plantillaTareaInsumo)
  const {createAllInsumosTareaFromTemplate} = useTareaInsumoProyecto(tareaInsumoProyecto)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await handleSubmit(e);
    const tasksCreated = await createAllTemplate(e, tareasCrear, created.Id!, new Date(created.FechaInicio));
    const plantillaInsumosArr = await loadInsumosPlantilla("Apertura tienda");
    const plantillaTareaArr = await loadTareaInsumosPlantilla("Apertura tienda");
    const insumosCreated = await createAllInsumosFromTemplate(e, plantillaInsumosArr, created.Id!);
    await createAllInsumosTareaFromTemplate(e, plantillaTareaArr, insumosCreated.data);
    console.log("Tareas creadas ", tasksCreated);
    onClose();
  };

  if (!open) return null;


  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />

      <div className="modal__panel" role="dialog" aria-modal="true">
        {/* Header */}
        <header className="modal__header">
          <div>
            <h2 className="modal__title">Nuevo Proyecto de Apertura</h2>
          </div>
          <button type="button" className="modal__close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </header>

        <hr className="modal__divider" />

        {/* Form */}
        <form onSubmit={(e) => handleCreate(e)} className="modal__form">
            <div className="field">
                <label className="field__label">Nombre del proyecto</label>
                <input type="text" className="field__input" value={state.Title} onChange={(e) => setField("Title", e.target.value)} placeholder="" required/>
            </div>

            <div className="modal__grid">
                <div className="field">
                    <label className="field__label">Líder Asignado</label>
                    <input type="text" className="field__input" value={state.Lider} placeholder="" required readOnly/>
                </div>

                <div className="field">
                    <label className="field__label">Fecha de Lanzamiento (Meta)</label>
                    <input type="date" className="field__input" value={state.Fechadelanzamiento} onChange={(e) => setField("Fechadelanzamiento", e.target.value)} required/>
                </div>
            </div>

            <div className="field">
                <label className="field__label">Fecha de Inicio del Proyecto</label>
                <input type="date" className="field__input" value={state.FechaInicio} onChange={(e) => setField("FechaInicio", e.target.value)} required/>
            </div>

          {/* Footer botones */}
            <div className="modal__footer">
                <button type="button" className="btn modal__btn-cancel" onClick={onClose} disabled={loading || submitting}> 
                    Cancelar
                </button>
                <button type="submit" className="btn btn--primary modal__btn-primary" disabled={loading || submitting}>
                    {!loading ? "Crear Proyecto" : "Creando proyecto..."}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
