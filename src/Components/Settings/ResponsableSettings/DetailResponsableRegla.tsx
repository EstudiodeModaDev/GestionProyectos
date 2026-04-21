import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { responsableReglaTarea, responsableReglaTareaDetalle } from "../../../models/responsables";
import "../Settings.css"
import "./css.css"

type Props = {
  open: boolean;
  tareas: TemplateTasks[];
  regla: responsableReglaTarea | null;
  detalles: responsableReglaTareaDetalle[];
  onClose: () => void;

  onCreateRegla: (payload: responsableReglaTarea) => Promise<responsableReglaTarea | null> | void;
  onEditRegla: (id: string, payload: responsableReglaTarea) => Promise<responsableReglaTarea | null> | void;

  onCreateDetalle: (reglaId: string, payload: responsableReglaTareaDetalle) => Promise<responsableReglaTareaDetalle> | void;
  onDeleteDetalle: (detalleId: string) => Promise<void> | void;
};

const reglaVacia: responsableReglaTarea = {
  Title: "",
  Ciudad: "",
  Marca: "",
};

const detalleVacio: responsableReglaTareaDetalle = {
  Title: "",
  Nombre: "",
  Correo: "",
  reglaId: 0,
};

/**
 * Permite editar una regla de responsables y administrar sus encargados.
 *
 * @param props - Estado del modal, regla activa y callbacks CRUD.
 * @returns Modal de detalle para configuracion de responsables.
 */
export function DetailResponsableRegla({open, tareas, regla, detalles, onClose, onCreateRegla, onEditRegla, onCreateDetalle, onDeleteDetalle,}: Props) {
  const [state, setState] = React.useState<responsableReglaTarea>(reglaVacia);
  const [saving, setSaving] = React.useState(false);

  const [detalle, setDetalle] = React.useState<responsableReglaTareaDetalle>(detalleVacio);
  const [savingDetalle, setSavingDetalle] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    if (regla) {
      setState({ ...regla});
    } else {setState({...reglaVacia,});}

    setDetalle({...detalleVacio, reglaId: Number(regla?.Id) ?? 0,});
  }, [open, regla]);

  if (!open) return null;

  

  /**
   * Actualiza un campo del formulario principal de la regla.
   *
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const handleSetField = <K extends keyof responsableReglaTarea>(key: K, value: responsableReglaTarea[K]) => {setState((prev) => ({ ...prev, [key]: value }));};

  

  /**
   * Actualiza un campo del formulario temporal de encargado.
   *
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const handleSetDetalleField = <K extends keyof responsableReglaTareaDetalle>(key: K, value: responsableReglaTareaDetalle[K]) => {setDetalle((prev) => ({ ...prev, [key]: value }));};

  

  /**
   * Valida y guarda la regla principal.
   */
  const handleSaveRegla = async () => {
    if (!state.Title?.trim()) {
      alert("Debes seleccionar una tarea.");
      return;
    }

    setSaving(true);
    try {
      const payload: responsableReglaTarea = {...state, Title: state.Title,};

      if (regla?.Id) {
        await onEditRegla(regla.Id, payload);
      } else {
        await onCreateRegla(payload);
      }

      alert("Regla guardada correctamente.");
      onClose();
    } catch (e) {
      console.error(e);
      alert("No fue posible guardar la regla.");
    } finally {
      setSaving(false);
    }
  };

  

  /**
   * Agrega un nuevo encargado a la regla actualmente persistida.
   */
  const handleAddDetalle = async () => {
    if (!regla?.Id) {
      alert("Primero debes guardar la regla.");
      return;
    }

    if (!detalle.Nombre?.trim() || !detalle.Correo?.trim()) {
      alert("Debes ingresar nombre y correo.");
      return;
    }

    setSavingDetalle(true);
    try {
      await onCreateDetalle(regla.Id, {...detalle, Title: regla.Title, reglaId: Number(regla.Id),});

      setDetalle({...detalleVacio, reglaId: Number(regla.Id),});
    } catch (e) {
      console.error(e);
      alert("No fue posible agregar el encargado.");
    } finally {
      setSavingDetalle(false);
    }
  };

  

  /**
   * Elimina un encargado asociado a la regla.
   *
   * @param id - Identificador del detalle a eliminar.
   */
  const handleDeleteDetalle = async (id?: string) => {
    if (!id) return;
    const ok = window.confirm("¿Eliminar este encargado?");
    if (!ok) return;

    await onDeleteDetalle(id);
  };

  return (
    <>
      <div className="tp-modal__overlay tp-modal__overlay--nested" onClick={onClose} />
      <div className="tp-modal tp-modal--lg tp-modal--nested" role="dialog" aria-modal="true" aria-label="Detalle de regla de encargados">
        <div className="tp-modal__header">
          <div>
            <h3 className="tp-modal__title">{regla ? "Editar regla de encargados" : "Nueva regla de encargados"}</h3>
            <p className="tp-modal__subtitle"> Configura la tarea y sus responsables. </p>
          </div>

          <div className="tp-modal__actions">
            <button className="pl-btn pl-btn--ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="tp-modal__body">
          <section className="tp-section">
            <h4 className="tp-section__title">Datos de la regla</h4>

            <div className="tp-grid tp-grid--2">
              <label className="tp-field">
                <span className="tp-field__label">Tarea</span>
                <select className="tp-field__input" value={state.Title ?? ""} onChange={(e) => handleSetField("Title", e.target.value)}>
                  <option value="">Selecciona una tarea</option>
                  {tareas.map((t) => (
                    <option key={t.Id ?? t.Codigo} value={t.Codigo}>
                      {t.Codigo} - {t.Title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Marca</span>
                <input className="tp-field__input" value={state.Marca ?? ""} onChange={(e) => handleSetField("Marca", e.target.value)} placeholder="Marca"/>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Zona</span>
                <input className="tp-field__input" value={state.Ciudad ?? ""} onChange={(e) => handleSetField("Ciudad", e.target.value)} placeholder="Zona"/>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Ciudad</span>
                <input className="tp-field__input" value={state.Ciudad ?? ""} onChange={(e) => handleSetField("Ciudad", e.target.value)} placeholder="Ciudad"/>
              </label>
            </div>

            <div className="tp-actions-row">
              <button className="pl-btn pl-btn--primary" onClick={handleSaveRegla} disabled={saving}>
                {saving ? "Guardando..." : "Guardar regla"}
              </button>
            </div>
          </section>

          <section className="tp-section">
            <h4 className="tp-section__title">Encargados</h4>

            {!regla?.Id ? (
              <div className="tp-empty">
                Guarda primero la regla para poder agregar encargados.
              </div>
            ) : (
              <>
                <div className="tp-table-wrap">
                  <table className="tp-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th style={{ width: 140 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.length === 0 ? (
                        <tr>
                          <td colSpan={3}>
                            <div className="tp-empty">
                              No hay encargados asociados.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        detalles.map((d) => (
                          <tr key={d.Id}>
                            <td>{d.Nombre}</td>
                            <td>{d.Correo}</td>
                            <td>
                              <button className="pl-btn pl-btn--danger" onClick={() => handleDeleteDetalle(d.Id)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="tp-grid tp-grid--2 tp-grid--detalle">
                  <label className="tp-field">
                    <span className="tp-field__label">Nombre</span>
                    <input className="tp-field__input" value={detalle.Nombre ?? ""} onChange={(e) => handleSetDetalleField("Nombre", e.target.value)} placeholder="Nombre del encargado"/>
                  </label>

                  <label className="tp-field">
                    <span className="tp-field__label">Correo</span>
                    <input className="tp-field__input" value={detalle.Correo ?? ""}  onChange={(e) => handleSetDetalleField("Correo", e.target.value)} placeholder="correo@empresa.com"/>
                  </label>
                </div>

                <div className="tp-actions-row">
                  <button className="pl-btn pl-btn--primary" onClick={handleAddDetalle} disabled={savingDetalle}>
                    {savingDetalle ? "Agregando..." : "Agregar encargado"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );

}
