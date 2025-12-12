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

export const PlantillasPanel: React.FC<Props> = ({ plantillas }) => {
  const [openTareas, setOpenTareas] = React.useState(false);
  const [openInsumos, setOpenInsumos] = React.useState(false);
  const [plantillaSel, setPlantillaSel] = React.useState<Plantilla | null>(null);

  const handleTareas = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenInsumos(false);
    setOpenTareas(true);
  };

  const handleInsumos = (p: Plantilla) => {
    setPlantillaSel(p);
    setOpenTareas(false);
    setOpenInsumos(true);
  };

  const handleCloseModals = () => {
    setOpenTareas(false);
    setOpenInsumos(false);
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
            </div>
          </div>
        ))}
      </div>

      {/* Wrapper se monta si hay al menos un modal abierto */}
      {plantillaSel && (openTareas || openInsumos) && (
        <>
          {plantillaSel.codigo === "apertura" && (
            <AperturaTareaModalWrapper plantilla={plantillaSel} openTasks={openTareas} openInsumos={openInsumos} onClose={handleCloseModals}/>
          )}
        </>
      )}
    </section>
  );
};
