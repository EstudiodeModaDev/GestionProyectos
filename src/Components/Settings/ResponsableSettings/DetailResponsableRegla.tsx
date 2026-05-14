import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { responsableReglaTarea, responsableReglaTareaDetalle } from "../../../models/responsables";
import "../Settings.css"
import "./css.css"
import { useMarcas } from "../../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";
import { useZonas } from "../../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import { ConfirmActionModal } from "../../confirmationModal/ConfirmActionModal";
import { showError, showSuccess, showWarning } from "../../../utils/toast";

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
  id_marca: null,
  id_zona: null,
  template_task_id: null,
};

const detalleVacio: responsableReglaTareaDetalle = {
  regla_id: "",
  correo: "",
  nombre: "",
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
  const [detalleToDelete, setDetalleToDelete] = React.useState<string | null>(null);
  const marcas = useMarcas()
  const zonas = useZonas()

  React.useEffect(() => {
    if (!open) return;
  
    void marcas?.loadMarcasBD()
    void zonas.loadZonas()

    if (regla) {
      setState({ ...regla});
    } else {setState({...reglaVacia,});}

    setDetalle({ ...detalleVacio, regla_id: String(regla?.id ?? "") });
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
    if (!state.template_task_id) {
      showWarning("Debes seleccionar una tarea.");
      return;
    }

    setSaving(true);
    try {
      const payload: responsableReglaTarea = {...state, template_task_id: state.template_task_id,};

      if (regla?.id) {
        await onEditRegla(regla.id, payload);
      } else {
        await onCreateRegla(payload);
      }

      showSuccess("Regla guardada correctamente.");
      onClose();
    } catch (e) {
      console.error(e);
      showError("No fue posible guardar la regla.");
    } finally {
      setSaving(false);
    }
  };

  

  /**
   * Agrega un nuevo encargado a la regla actualmente persistida.
   */
  const handleAddDetalle = async () => {
    if (!regla?.id) {
      showWarning("Primero debes guardar la regla.");
      return;
    }

    if (!detalle.nombre?.trim() || (!detalle.correo?.trim() && detalle.nombre.toLocaleLowerCase().trim() !== "jefe de zona")) {
      showWarning("Debes ingresar nombre y correo.");
      return;
    }

    setSavingDetalle(true);
    try {
      await onCreateDetalle(regla.id, { ...detalle, regla_id: regla.id });

      setDetalle({ ...detalleVacio, regla_id: regla.id });
    } catch (e) {
      console.error(e);
      showError("No fue posible agregar el encargado.");
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
    setDetalleToDelete(id);
  };

  return (
    <>
      <div className="tp-modal__overlay tp-modal__overlay--nested" onClick={onClose} />
      <div className="tp-modal tp-modal--lg tp-modal--nested" role="dialog" aria-modal="true" aria-label="Detalle de regla de encargados">
        <div className="tp-modal__header">
          <div>
            <h3 className="tp-modal__title">{regla?.id ? "Editar regla de encargados" : "Configurar encargados de la tarea"}</h3>
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
                <select className="tp-field__input" value={state.template_task_id ?? ""} onChange={(e) => handleSetField("template_task_id", Number(e.target.value))}>
                  <option value="">Selecciona una tarea</option>
                  {tareas.map((t) => (
                    <option key={t.id ?? t.codigo} value={t.id}>
                      {t.codigo} - {t.nombre_tarea}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Marca</span>
                <select className="tp-field__input" value={state.id_marca ?? ""} onChange={(e) => handleSetField("id_marca", Number(e.target.value))}>
                  <option value="">Selecciona una marca</option>
                  {marcas.marcas.map((t) => (
                    <option key={t.id ?? t.nombre_marca} value={t.id}>
                      {t.nombre_marca}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Zona</span>
                <select className="tp-field__input" value={state.id_zona ?? ""} onChange={(e) => handleSetField("id_zona", Number(e.target.value))}>
                  <option value="">Selecciona una zona</option>
                  {zonas.zones.map((t) => (
                    <option key={t.id ?? t.zonas} value={t.id}>
                      {t.zonas}
                    </option>
                  ))}
                </select>
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

            {!regla?.id ? (
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
                          <tr key={d.id}>
                            <td>{d.nombre}</td>
                            <td>{d.correo}</td>
                            <td>
                              <button className="pl-btn pl-btn--danger" onClick={() => handleDeleteDetalle(d.id)}>
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
                    <input className="tp-field__input" value={detalle.nombre ?? ""} onChange={(e) => handleSetDetalleField("nombre", e.target.value)} placeholder="Nombre del encargado"/>
                  </label>

                  <label className="tp-field">
                    <span className="tp-field__label">Correo</span>
                    <input className="tp-field__input" value={detalle.correo ?? ""}  onChange={(e) => handleSetDetalleField("correo", e.target.value)} placeholder="correo@empresa.com"/>
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

      <ConfirmActionModal
        open={Boolean(detalleToDelete)}
        text="¿Eliminar este encargado?"
        onCancel={() => setDetalleToDelete(null)}
        onConfirm={async () => {
          if (!detalleToDelete) return;
          await onDeleteDetalle(detalleToDelete);
          setDetalleToDelete(null);
        }}
      />
    </>
  );

}
