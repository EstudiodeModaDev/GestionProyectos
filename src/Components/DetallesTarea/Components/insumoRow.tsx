import type { TaskInsumoView } from "../../../Funcionalidades/insumos";

export interface TaskDetailModalProps {
  insumo: TaskInsumoView
  handleClickInsumo: (i: TaskInsumoView) => void
}

/**
 * Presenta las filas de los insumos
 *
 * @param props - Propiedades del modal de detalle.
 * @returns Modal con informacion operativa y acciones sobre la tarea seleccionada.
 */
export function InsumoRow({insumo, handleClickInsumo}: TaskDetailModalProps){

  return (
    <>
      <li key={insumo.id} className="tdm-insumos-item">
        <span className="tdm-insumo-title">
          <strong>{insumo.title}</strong> - {insumo.texto ? insumo.texto : "No subido"}
        </span>
        {insumo.tipo.toLocaleLowerCase() === "archivo" ? 
          <button type="button" className="tdm-inline-view-btn" onClick={(event) => {event.stopPropagation(); void handleClickInsumo(insumo);}} aria-label={`Ver insumo ${insumo.title}`} title="Ver archivo">
            <svg className="tdm-inline-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Ver</span>
          </button> : 
          null
        }
      </li>
    </>
  );
};
