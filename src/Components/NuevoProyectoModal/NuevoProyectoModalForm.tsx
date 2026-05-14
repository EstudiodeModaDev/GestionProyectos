import type { NuevoProyectoFormProps } from "./NuevoProyectoModal.types";

export function NuevoProyectoModalForm({
  nombreProyecto,
  marcaId,
  zonaId,
  fechaInicio,
  fechaLanzamiento,
  lider,
  marcas,
  zonas,
  disabled,
  onNombreProyectoChange,
  onMarcaChange,
  onZonaChange,
  onFechaInicioChange,
  onFechaLanzamientoChange,
}: NuevoProyectoFormProps) {
  return (
    <>
      <div className="field">
        <label className="field__label">Nombre del proyecto</label>
        <input type="text" className="field__input" value={nombreProyecto} onChange={(e) => onNombreProyectoChange(e.target.value)} required />
      </div>

      <div className="field">
        <label className="field__label">Marca del proyecto</label>
        <select name="marcas" className="field__input" value={marcaId} onChange={(e) => onMarcaChange(e.target.value)} disabled={disabled}>
          <option value="">Escoger marca...</option>
          {marcas
            .map((opcion) => (
              <option key={opcion.nombre_marca} value={opcion.id}>
                {opcion.nombre_marca}
              </option>
            ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label">Zona del proyecto</label>
        <select name="zonas" className="field__input" value={zonaId} onChange={(e) => onZonaChange(e.target.value)} disabled={disabled}>
          <option value="">Escoger zona...</option>
          {zonas
            .map((opcion) => (
              <option key={opcion.zonas} value={opcion.id}>
                {opcion.zonas}
              </option>
            ))}
        </select>
      </div>

      <div className="modal__grid">
        <div className="field">
          <label className="field__label">Fecha de Inicio del Proyecto</label>
          <input type="date" className="field__input" value={fechaInicio} onChange={(e) => onFechaInicioChange(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field__label">Fecha de Lanzamiento (Meta)</label>
          <input type="date" className="field__input" value={fechaLanzamiento} onChange={(e) => onFechaLanzamientoChange(e.target.value)} required />
        </div>
      </div>

      <div className="field">
        <label className="field__label">Lider Asignado</label>
        <input type="text" className="field__input" value={lider} required readOnly />
      </div>
    </>
  );
}
