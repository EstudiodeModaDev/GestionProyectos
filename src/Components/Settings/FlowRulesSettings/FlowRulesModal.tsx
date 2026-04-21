import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { plantillaInsumos, ReglasFlujoTareas } from "../../../models/Insumos";
import { DetailFlowRule } from "./DetailFlowRule";
import "../Settings.css"

type Props = {
  open: boolean;
  proceso: string;
  tareas: TemplateTasks[];
  insumos: plantillaInsumos[];
  reglas: ReglasFlujoTareas[];
  loading?: boolean;
  onClose: () => void;

  onCreateRule: (payload: ReglasFlujoTareas) => Promise<ReglasFlujoTareas>;
  onEditRule: (id: string, payload: ReglasFlujoTareas) => Promise<ReglasFlujoTareas> ;
  onDeleteRule: (id: string) => Promise<void> | void;
};

/**
 * Lista las reglas de flujo configuradas y permite administrarlas.
 *
 * @param props - Datos del proceso, catalogos y callbacks CRUD.
 * @returns Modal principal de reglas de flujo.
 */
export function FlowRulesModal({
  open,
  proceso,
  tareas,
  insumos,
  reglas,
  loading = false,
  onClose,
  onCreateRule,
  onEditRule,
  onDeleteRule,
}: Props) {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ReglasFlujoTareas | null>(null);

  React.useEffect(() => {
    if (!open) {
      setDetailOpen(false);
      setSelected(null);
    }
  }, [open]);

  if (!open) return null;

  const insumosFlujo = insumos.filter((i) => !!i.PreguntaFlujo);

  

  /**
   * Busca la tarea de plantilla asociada a un codigo.
   *
   * @param codigo - Codigo de tarea a resolver.
   * @returns Tarea encontrada o `undefined`.
   */
  const getTaskName = (codigo?: string) =>
    tareas.find((t) => String(t.Codigo) === String(codigo));

  

  /**
   * Busca el insumo de flujo asociado a un identificador.
   *
   * @param id - Identificador del insumo.
   * @returns Insumo encontrado o `undefined`.
   */
  const getInsumoName = (id?: string) =>
    insumosFlujo.find((i) => String(i.Id) === String(id));

  

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
   * @param rule - Regla a editar.
   */
  const handleEdit = (rule: ReglasFlujoTareas) => {
    setSelected(rule);
    setDetailOpen(true);
  };

  

  /**
   * Confirma y elimina una regla existente.
   *
   * @param rule - Regla a eliminar.
   */
  const handleDelete = async (rule: ReglasFlujoTareas) => {
    if (!rule.Id) return;
    const ok = window.confirm(`¿Eliminar la regla ${rule.Title}?`);
    if (!ok) return;
    await onDeleteRule(rule.Id);
  };

  return (
    <>
      <div className="tp-modal__overlay" onClick={onClose} />
      <div className="tp-modal tp-modal--xl" role="dialog" aria-modal="true">
        <div className="tp-modal__header">
          <div>
            <h3 className="tp-modal__title">Reglas de flujo</h3>
            <p className="tp-modal__subtitle">
              Configura pregunta, condición y los dos destinos del flujo.
            </p>
          </div>

          <div className="tp-modal__actions">
            <button className="pl-btn pl-btn--primary" onClick={handleCreate}>
              Nueva regla
            </button>
            <button className="pl-btn pl-btn--ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="tp-modal__body">
          {loading ? (
            <div className="tp-empty">Cargando reglas...</div>
          ) : reglas.length === 0 ? (
            <div className="tp-empty">No hay reglas configuradas.</div>
          ) : (
            <div className="tp-table-wrap">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Tarea origen</th>
                    <th>Pregunta</th>
                    <th>Valor esperado</th>
                    <th>Si cumple</th>
                    <th>Si no cumple</th>
                    <th style={{ width: 180 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reglas.map((r) => {
                    const tareaOrigen = getTaskName(r.IdTemplateTaskOrigen);
                    const pregunta = getInsumoName(r.IdPlantillaInsumo);
                    const cumple = getTaskName(r.TareaSiCumple);
                    const noCumple = getTaskName(r.TareaSiNoCumple);

                    return (
                      <tr key={r.Id}>
                        <td>{tareaOrigen ? `${tareaOrigen.Codigo} - ${tareaOrigen.Title}` : r.IdTemplateTaskOrigen}</td>
                        <td>{pregunta?.Title ?? r.IdPlantillaInsumo}</td>
                        <td>{r.ValorEsperado}</td>
                        <td>{cumple ? `${cumple.Codigo} - ${cumple.Title}` : r.TareaSiCumple}</td>
                        <td>{noCumple ? `${noCumple.Codigo} - ${noCumple.Title}` : r.TareaSiNoCumple}</td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DetailFlowRule
        open={detailOpen}
        proceso={proceso}
        tareas={tareas}
        insumos={insumosFlujo}
        rule={selected}
        onClose={() => setDetailOpen(false)}
        onCreateRule={onCreateRule}
        onEditRule={onEditRule}
      />
    </>
  );
}
