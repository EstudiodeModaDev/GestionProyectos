import type { TaskInsumoView } from "../../../Funcionalidades/insumos"
import { InsumoRow } from "./insumoRow"

type Props = {
  title: string
  style: string
  loading: boolean
  error: string | null
  inputs: TaskInsumoView[]
  handleClickInsumo: (i: TaskInsumoView) => void
}

/**
 * Presenta el detalle completo de los insumos de una tarea.
 *
 * @param props - Propiedades del modal de detalle.
 * @returns Modal con informacion operativa y acciones sobre la tarea seleccionada.
 */
export function InsumoTypeCard({title, style, loading, error, inputs, handleClickInsumo}: Props){

  return (
    <>
      <div className={`tdm-card ${style}`}>
          <div className="tdm-card-title-row">
            <svg className="tdm-icon tdm-icon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span className="tdm-card-title-text tdm-card-title-blue">
              {title}
            </span>
          </div>

          {loading ? (
            <p className="tdm-card-body-text">Cargando insumos...</p>
          ) : error ? (
            <p className="tdm-card-body-text tdm-error-text">
              Error al cargar insumos: {error}
            </p>
          ) : inputs.length ? (
            <ul className="tdm-insumos-list">
              {inputs.map((ins: TaskInsumoView) => (
                <InsumoRow 
                  insumo={ins} 
                  handleClickInsumo={handleClickInsumo}/>
              ))}
            </ul>
          ) : (
            <p className="tdm-card-body-text">
              No hay insumos configurados para esta tarea.
            </p>
          )}
        </div>
    </>
  );
};
