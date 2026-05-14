import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import "../Settings.css"
import type { plantillaInsumos, ReglasFlujoTareas } from "../../../models/Insumos";
import { showError, showWarning } from "../../../utils/toast";

type Props = {
  open: boolean;
  proceso: string;
  tareas: TemplateTasks[];
  insumos: plantillaInsumos[];
  rule: ReglasFlujoTareas | null;
  onClose: () => void;
  onCreateRule: (payload: ReglasFlujoTareas) => Promise<ReglasFlujoTareas>;
  onEditRule: (id: string, payload: ReglasFlujoTareas) => Promise<ReglasFlujoTareas>;
};

const emptyRule: ReglasFlujoTareas = {
  nombre_regla: "",
  id_template_task_origen: null,
  id_plantilla_insumo: null,
  condicion: "equals",
  valor_esperado: "",
  tarea_si_cumple: null,
  tarea_si_no_cumple: null,
  is_active: true,
  prioridad: 1,
};

/**
 * Permite crear o editar una regla de flujo basada en una pregunta de insumo.
 *
 * @param props - Estado del modal, catalogos y callbacks de persistencia.
 * @returns Modal con el formulario detallado de una regla de flujo.
 */
export function DetailFlowRule({open, tareas, insumos, rule, onClose, onCreateRule, onEditRule,}: Props) {
  const [state, setState] = React.useState<ReglasFlujoTareas>(emptyRule);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    if (rule) {
      setState({
        ...rule,
        condicion: rule.condicion ?? "equals",
        is_active: rule.is_active ?? true,
        prioridad: rule.prioridad ?? 1,
      });
    } else {
      setState(emptyRule);
    }
  }, [open, rule]);

  if (!open) return null;

  

  /**
   * Actualiza una propiedad puntual del formulario de la regla.
   *
   * @param key - Campo a modificar.
   * @param value - Nuevo valor del campo.
   */
  const setField = <K extends keyof ReglasFlujoTareas>(
    key: K,
    value: ReglasFlujoTareas[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const selectedQuestion = insumos.find(
    (i) => String(i.id) === String(state.id_plantilla_insumo)
  );

  let opciones: string[] = [];
  try {
    opciones = JSON.parse(selectedQuestion?.opciones_json ?? "[]");
    if (!Array.isArray(opciones)) opciones = [];
  } catch {
    opciones = [];
  }

  /**
   * Valida el formulario y guarda la regla en modo creacion o edicion.
   */
  const handleSave = async () => {
    if (!state.id_template_task_origen) {
      showWarning("Debes seleccionar la tarea origen.");
      return;
    }

    if (!state.id_plantilla_insumo) {
      showWarning("Debes seleccionar la pregunta.");
      return;
    }

    if (!state.valor_esperado?.trim()) {
      showWarning("Debes definir el valor esperado.");
      return;
    }

    if (!state.tarea_si_cumple) {
      showWarning("Debes seleccionar la tarea destino si cumple.");
      return;
    }

    if (!state.tarea_si_no_cumple) {
      showWarning("Debes seleccionar la tarea destino si no cumple.");
      return;
    }

    if (state.tarea_si_cumple === state.tarea_si_no_cumple) {
      showWarning("Los destinos no pueden ser iguales.");
      return;
    }

    setSaving(true);
    try {
      const payload: ReglasFlujoTareas = {
        ...state,
        nombre_regla: `${state.id_template_task_origen}-${state.id_plantilla_insumo}`,
        condicion: "equals",
        is_active: true,
        prioridad: 1,
      };

      if (rule?.id) {
        await onEditRule(rule.id, payload);
      } else {
        await onCreateRule(payload);
      }

      onClose();
    } catch (e) {
      console.error(e);
      showError("No fue posible guardar la regla.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tp-modal__overlay tp-modal__overlay--nested" onClick={onClose} />
      <div className="tp-modal tp-modal--lg tp-modal--nested" role="dialog" aria-modal="true">
        <div className="tp-modal__header">
          <div>
            <h3 className="tp-modal__title">
              {rule ? "Editar regla de flujo" : "Nueva regla de flujo"}
            </h3>
            <p className="tp-modal__subtitle">
              Una pregunta, una condición y dos destinos.
            </p>
          </div>

          <div className="tp-modal__actions">
            <button className="pl-btn pl-btn--ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="tp-modal__body">
          <div className="tp-grid tp-grid--2">
            <label className="tp-field">
              <span className="tp-field__label">Tarea origen</span>
              <select
                className="tp-field__input"
                value={state.id_template_task_origen ?? ""}
                onChange={(e) => setField("id_template_task_origen", Number(e.target.value))}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.id ?? t.codigo} value={t.id}>
                    {t.codigo} - {t.nombre_tarea}
                  </option>
                ))}
              </select>
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Pregunta de flujo</span>
              <select
                className="tp-field__input"
                value={state.id_plantilla_insumo ?? ""}
                onChange={(e) => {
                  setField("id_plantilla_insumo", Number(e.target.value));
                  setField("valor_esperado", "");
                }}
              >
                <option value="">Selecciona una pregunta</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre_insumo}
                  </option>
                ))}
              </select>
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Condición</span>
              <input
                className="tp-field__input"
                value="equals"
                disabled
                readOnly
              />
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Valor esperado</span>
              {opciones.length > 0 ? (
                <select
                  className="tp-field__input"
                  value={state.valor_esperado ?? ""}
                  onChange={(e) => setField("valor_esperado", e.target.value)}
                >
                  <option value="">Selecciona un valor</option>
                  {opciones.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="tp-field__input"
                  value={state.valor_esperado ?? ""}
                  onChange={(e) => setField("valor_esperado", e.target.value)}
                  placeholder="Valor esperado"
                />
              )}
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Tarea destino si cumple</span>
              <select
                className="tp-field__input"
                value={state.tarea_si_cumple ?? ""}
                onChange={(e) => setField("tarea_si_cumple", Number(e.target.value))}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.id ?? t.codigo} value={t.id}>
                    {t.codigo} - {t.nombre_tarea}
                  </option>
                ))}
              </select>
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Tarea destino si no cumple</span>
              <select
                className="tp-field__input"
                value={state.tarea_si_no_cumple ?? ""}
                onChange={(e) => setField("tarea_si_no_cumple", Number(e.target.value))}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.id ?? t.codigo} value={t.id}>
                    {t.codigo} - {t.nombre_tarea}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tp-actions-row">
            <button
              className="pl-btn pl-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar regla"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
