import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { responsableReglaTarea, responsableReglaTareaDetalle } from "../../../models/responsables";
import "../Settings.css";
import "./css.css";
import { DetailResponsableRegla } from "./DetailResponsableRegla";

type Props = {
  open: boolean;
  tareas: TemplateTasks[];
  reglas: responsableReglaTarea[];
  detalles: responsableReglaTareaDetalle[];
  loading?: boolean;
  onClose: () => void;
  onCreateRegla: (payload: responsableReglaTarea) => Promise<responsableReglaTarea | null> | void;
  onEditRegla: (id: string, payload: responsableReglaTarea) => Promise<responsableReglaTarea | null>;
  onDeleteRegla: (id: string) => Promise<void> | void;
  onCreateDetalle: (reglaId: string, payload: responsableReglaTareaDetalle) => Promise<responsableReglaTareaDetalle>;
  onDeleteDetalle: (detalleId: string) => Promise<void> | void;
};

/**
 * Lista las reglas de asignacion de responsables y permite administrarlas.
 *
 * @param props - Catalogos, reglas cargadas y callbacks CRUD.
 * @returns Modal principal de configuracion de responsables por tarea.
 */
export function ResponsablesReglaModal({open, tareas, reglas, detalles, loading = false, onClose, onCreateRegla, onEditRegla, onDeleteRegla, onCreateDetalle, onDeleteDetalle,}: Props) {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<responsableReglaTarea | null>(null);

  React.useEffect(() => {
    if (!open) {
      setDetailOpen(false);
      setSelected(null);
    }
  }, [open]);

  if (!open) return null;

  const detallesPorRegla = React.useMemo(() => {
    const map = new Map<string, responsableReglaTareaDetalle[]>();

    for (const detalle of detalles) {
      const key = String(detalle.reglaId);
      const current = map.get(key) ?? [];
      current.push(detalle);
      map.set(key, current);
    }

    return map;
  }, [detalles]);

  

  /**
   * Obtiene los detalles asociados a una regla concreta.
   *
   * @param reglaId - Identificador de la regla.
   * @returns Responsables asociados a la regla.
   */
  const getDetallesRegla = (reglaId?: string) => detallesPorRegla.get(String(reglaId)) ?? [];

  

  /**
   * Cuenta cuantos responsables tiene una regla.
   *
   * @param reglaId - Identificador de la regla.
   * @returns Numero de detalles asociados.
   */
  const getCantidadDetalles = (reglaId?: string) => getDetallesRegla(reglaId).length;

  

  /**
   * Construye un resumen textual de los responsables asignados a una regla.
   *
   * @param reglaId - Identificador de la regla.
   * @returns Resumen corto para la tabla principal.
   */
  const getDetalleResumen = (reglaId?: string) => {
    const items = getDetallesRegla(reglaId)
      .map((d) => d.Nombre?.trim() || d.Correo?.trim() || "Sin nombre")
      .filter(Boolean);

    if (!items.length) return "Sin encargados";
    if (items.length <= 2) return items.join(", ");
    return `${items[0]}, ${items[1]} y ${items.length - 2} mas`;
  };

  const totalEncargados = detalles.length;

  

  /**
   * Abre el detalle en modo creacion.
   */
  const handleCreate = () => {
    setSelected(null);
    setDetailOpen(true);
  };

  

  /**
   * Abre el detalle cargando la regla seleccionada.
   *
   * @param regla - Regla a editar.
   */
  const handleEdit = (regla: responsableReglaTarea) => {
    setSelected(regla);
    setDetailOpen(true);
  };

  

  /**
   * Confirma y elimina una regla de responsables.
   *
   * @param regla - Regla a eliminar.
   */
  const handleDelete = async (regla: responsableReglaTarea) => {
    if (!regla.Id) return;
    const ok = window.confirm(`Seguro que deseas eliminar la regla de la tarea ${regla.Title}?`);
    if (!ok) return;

    await onDeleteRegla(regla.Id);
  };

  return (
    <>
      <div className="tp-modal__overlay" onClick={onClose} />
      <div className="tp-modal tp-modal--xl tp-resp-modal" role="dialog" aria-modal="true" aria-label="Configuracion de encargados">
        <div className="tp-modal__header tp-resp-modal__header">
          <div className="tp-resp-modal__hero">
            <span className="tp-resp-modal__eyebrow">Configuracion operativa</span>
            <h3 className="tp-modal__title tp-resp-modal__title">Encargados por tarea</h3>
            <p className="tp-modal__subtitle tp-resp-modal__subtitle">Administra responsables por tarea, marca y ubicacion desde una vista mas clara.</p>
          </div>

          <div className="tp-resp-modal__stats">
            <div className="tp-resp-stat">
              <span className="tp-resp-stat__label">Reglas</span>
              <strong className="tp-resp-stat__value">{reglas.length}</strong>
            </div>
            <div className="tp-resp-stat">
              <span className="tp-resp-stat__label">Encargados</span>
              <strong className="tp-resp-stat__value">{totalEncargados}</strong>
            </div>
          </div>

          <div className="tp-modal__actions tp-resp-modal__actions">
            <button className="pl-btn pl-btn--primary" onClick={handleCreate}>
              Nueva regla
            </button>
            <button className="pl-btn pl-btn--ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="tp-modal__body tp-resp-modal__body">
          <div className="tp-resp-modal__toolbar">
            <div className="tp-resp-pill-group">
              <span className="tp-resp-pill">
                <strong>{tareas.length}</strong>
                tareas disponibles
              </span>
              <span className="tp-resp-pill">
                <strong>{reglas.length}</strong>
                reglas activas
              </span>
            </div>
          </div>

          {loading ? (
            <div className="tp-empty tp-resp-empty">Cargando reglas...</div>
          ) : reglas.length === 0 ? (
            <div className="tp-empty tp-resp-empty">No hay reglas de encargados configuradas.</div>
          ) : (
            <div className="tp-table-wrap tp-resp-table-wrap">
              <table className="tp-table tp-resp-table">
                <thead>
                  <tr>
                    <th>Codigo tarea</th>
                    <th>Marca</th>
                    <th>Zona / Ciudad</th>
                    <th>Encargados</th>
                    <th style={{ width: 180 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reglas.map((r) => (
                    <tr key={r.Id} className="tp-resp-table__row">
                      <td>
                        <div className="tp-resp-task-cell">
                          <strong>{r.Title}</strong>
                          <span>Regla de asignacion</span>
                        </div>
                      </td>
                      <td>
                        <span className="tp-resp-chip">{r.Marca || "Sin marca"}</span>
                      </td>
                      <td>
                        <div className="tp-resp-location-cell">
                          <strong>{r.Ciudad || "Sin ciudad"}</strong>
                          <span>Ubicacion aplicada</span>
                        </div>
                      </td>
                      <td>
                        <div className="tp-resp-assignees-cell">
                          <span className="tp-resp-count">{getCantidadDetalles(r.Id)}</span>
                          <span className="tp-resp-assignees-text">{getDetalleResumen(r.Id)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="tp-actions-inline">
                          <button className="pl-btn pl-btn--ghost" onClick={() => handleEdit(r)}>
                            Editar
                          </button>
                          <button className="pl-btn pl-btn--danger" onClick={() => handleDelete(r)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DetailResponsableRegla
        open={detailOpen}
        tareas={tareas}
        detalles={selected ? getDetallesRegla(selected.Id) : []}
        regla={selected}
        onClose={() => setDetailOpen(false)}
        onCreateRegla={onCreateRegla}
        onEditRegla={onEditRegla}
        onCreateDetalle={onCreateDetalle}
        onDeleteDetalle={onDeleteDetalle}
      />
    </>
  );
}
