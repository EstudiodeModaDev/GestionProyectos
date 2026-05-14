import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { plantillaInsumos, ReglasFlujoTareas } from "../../../models/Insumos";
import { ConfirmActionModal } from "../../confirmationModal/ConfirmActionModal";
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
  const [ruleToDelete, setRuleToDelete] = React.useState<ReglasFlujoTareas | null>(null);

  React.useEffect(() => {
    if (!open) {
      setDetailOpen(false);
      setSelected(null);
    }
  }, [open]);

  if (!open) return null;

  const insumosFlujo = insumos.filter((i) => !!i.pregunta_flujo);

  

  /**
   * Busca la tarea de plantilla asociada a un codigo.
   *
   * @param codigo - Codigo de tarea a resolver.
   * @returns Tarea encontrada o `undefined`.
   */
  const getTaskName = (codigo?: number) =>
    tareas.find((t) => String(t.id) === String(codigo));

  

  /**
   * Busca el insumo de flujo asociado a un identificador.
   *
   * @param id - Identificador del insumo.
   * @returns Insumo encontrado o `undefined`.
   */
  const getInsumoName = (id?: number) =>
    insumosFlujo.find((i) => String(i.id) === String(id));

  

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
    if (!rule.id) return;
    setRuleToDelete(rule);
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
                    const tareaOrigen = getTaskName(r.id_template_task_origen ?? 0);
                    const pregunta = getInsumoName(r.id_plantilla_insumo ?? 0);
                    const cumple = getTaskName(r.tarea_si_cumple ?? 0);
                    const noCumple = getTaskName(r.tarea_si_no_cumple ?? 0);

                    return (
                      <tr key={r.id}>
                        <td>{tareaOrigen ? `${tareaOrigen.codigo} - ${tareaOrigen.nombre_tarea}` : r.id_template_task_origen}</td>
                        <td>{pregunta?.nombre_insumo ?? r.id_plantilla_insumo}</td>
                        <td>{r.valor_esperado}</td>
                        <td>{cumple ? `${cumple.codigo} - ${cumple.nombre_tarea}` : r.tarea_si_cumple}</td>
                        <td>{noCumple ? `${noCumple.codigo} - ${noCumple.nombre_tarea}` : r.tarea_si_no_cumple}</td>
                        <td>
                          <div className="tp-actions-inline">
                            <button className="pl-btn pl-btn--ghost" onClick={() => handleEdit(r)}>
                              Editar
                            </button>
                            <button className="pl-btn pl-btn--danger" onClick={() => handleDelete(r)}>
                              {r.is_active ? "Desactivar" : "Activar"}
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

      <ConfirmActionModal
        open={Boolean(ruleToDelete)}
        text={ruleToDelete ? `¿Seguro que deseas ${ruleToDelete.is_active ? "desactivar" : "activar"} la regla ${ruleToDelete.nombre_regla}?` : ""}
        onCancel={() => setRuleToDelete(null)}
        onConfirm={async () => {
          if (!ruleToDelete?.id) return;
          await onDeleteRule(ruleToDelete.id);
          setRuleToDelete(null);
        }}
      />
    </>
  );
}
