import * as React from "react";
import "./Settings.css";
import { AperturaTareaModalWrapper } from "./WrapperSettings/AperturaTareaModalWrapper";

//Tipos
export type Plantilla = {
  id: string;
  nombre: string;
  codigo: string;
  tareasListName: string;
};

type Props = {
  plantillas: Plantilla[];
};

/**
 * Muestra las plantillas configuradas y permite abrir sus modulos de administracion.
 *
 * @param props - Conjunto de plantillas disponibles.
 * @returns Panel de acceso a tareas, insumos, responsables y reglas de flujo.
 */
export const PlantillasPanel: React.FC<Props> = ({ plantillas }) => {
  const [openTareas, setOpenTareas] = React.useState(false);
  const [openInsumos, setOpenInsumos] = React.useState(false);
  const [openFlowRules, setOpenFlowRules] = React.useState(false);
  const [openResponsables, setOpenResponsables] = React.useState(false);
  const [plantillaSel, setPlantillaSel] = React.useState<Plantilla | null>(null);

  

  /**
   * Abre la configuracion de tareas para la plantilla seleccionada.
   *
   * @param p - Plantilla activa.
   */
  const handleTareas = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenInsumos(false);
    setOpenResponsables(false)
    setOpenTareas(true);
  };

  

  /**
   * Abre la configuracion de responsables para la plantilla seleccionada.
   *
   * @param p - Plantilla activa.
   */
  const handleResponsables = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenInsumos(false);
    setOpenTareas(false);
    setOpenResponsables(true)
  };

  

  /**
   * Abre la configuracion de insumos para la plantilla seleccionada.
   *
   * @param p - Plantilla activa.
   */
  const handleInsumos = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenTareas(false);
    setOpenInsumos(true);
    setOpenResponsables(false)
  };

  

  /**
   * Cierra todos los modales dependientes de la plantilla actual.
   */
  const handleCloseModals = () => {
    setOpenTareas(false);
    setOpenInsumos(false);
    setOpenResponsables(false)
    setOpenFlowRules(false);
  };

  

  /**
   * Abre la configuracion de reglas de flujo para la plantilla seleccionada.
   *
   * @param p - Plantilla activa.
   */
  const handleFlowRules = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenTareas(false);
    setOpenInsumos(false);
    setOpenResponsables(false);
    setOpenFlowRules(true);
  };

  return (
    <section className="plantillas-panel">
      <h1 className="plantillas-title">Plantillas disponibles</h1>

      <div className="plantillas-list">
        {plantillas.map((p) => (
          <div key={p.id} className="plantilla-card">
            <div className="plantilla-card__header">
              <h2 className="plantilla-card__title">{p.nombre}</h2>
            </div>

            <div className="plantilla-card__actions">
              <button className="pl-btn pl-btn--primary" onClick={() => handleTareas(p)}>
                Ver tareas
              </button>

              <button className="pl-btn pl-btn--ghost" onClick={() => handleInsumos(p)}>
                Ver insumos
              </button>

              <button className="pl-btn pl-btn--ghost" onClick={() => handleResponsables(p)}>
                Ver encargados
              </button>

              <button className="pl-btn pl-btn--ghost" onClick={() => handleFlowRules(p)}>
                Ver reglas de flujo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Wrapper se monta si hay al menos un modal abierto */
}
      {plantillaSel && (openTareas || openInsumos || openResponsables || openFlowRules) && (
        <>
          {plantillaSel.codigo === "apertura" && (
            <AperturaTareaModalWrapper openFlowRules={openFlowRules} plantilla={plantillaSel} openTasks={openTareas} openInsumos={openInsumos} onClose={handleCloseModals} openResponsables={openResponsables}/>
          )}
        </>
      )}
    </section>
  );
};
