import React from "react";
import type { TaskColumnFilterKey } from "../types";

type Props = {
  column: TaskColumnFilterKey;
  value: string;
  options: string[];
  onClose: () => void;
  onApply: (value: string) => void;
};

const LABELS: Record<TaskColumnFilterKey, string> = {
  tarea: "Tarea",
  area: "Area",
  responsable: "Responsable",
  estado: "Estado",
};

/**
 * Muestra las opciones de filtrado disponibles para una columna de la tabla.
 *
 * @param props - Columna activa, valor seleccionado y callbacks del modal.
 * @returns Modal con buscador y opciones aplicables al filtro.
 */
export const ColumnFilterModal: React.FC<Props> = ({column, value, options, onClose, onApply,}) => {
  const [query, setQuery] = React.useState("");
  const titleId = React.useId();

  React.useEffect(() => {
    

    /**
     * Cierra el modal cuando se presiona Escape.
     *
     * @param event - Evento global del teclado.
     */
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const visibleOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const label = LABELS[column];

  return (
    <div className="desv__modal-shell" role="presentation">
      <div className="desv__modal-backdrop" onClick={onClose} />
      <section
        className="desv__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="desv__modal-header">
          <div>
            <p className="desv__modal-eyebrow">Filtro de columna</p>
            <h3 id={titleId} className="desv__modal-title">
              Filtrar por {label}
            </h3>
          </div>
          <button type="button" className="desv__modal-close" aria-label="Cerrar" onClick={onClose}>
            x
          </button>
        </header>

        <div className="desv__modal-body">
          <label className="desv__modal-search">
            <span>Buscar valor</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}`}
            />
          </label>

          <div className="desv__modal-actions">
            <button
              type="button"
              className="desv__filter-chip"
              data-active={value === "all"}
              onClick={() => onApply("all")}
            >
              Todos
            </button>
          </div>

          <div className="desv__modal-list" role="listbox" aria-label={`Opciones de ${label}`}>
            {visibleOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="desv__modal-option"
                data-active={value === option}
                onClick={() => onApply(option)}
              >
                <span>{option}</span>
                {value === option ? <strong>Activo</strong> : null}
              </button>
            ))}

            {!visibleOptions.length ? (
              <p className="desv__modal-empty">No hay coincidencias para esta busqueda.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};
