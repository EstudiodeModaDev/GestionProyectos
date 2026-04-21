import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import "../Settings.css"
import type { plantillaInsumos, ReglasFlujoTareas } from "../../../models/Insumos";

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
  Title: "",
  IdTemplateTaskOrigen: "",
  IdPlantillaInsumo: "",
  Condicion: "equals",
  ValorEsperado: "",
  TareaSiCumple: "",
  TareaSiNoCumple: "",
  Activa: "Si",
  Prioridad: "1",
};

/**
 * Permite crear o editar una regla de flujo basada en una pregunta de insumo.
 *
 * @param props - Estado del modal, catalogos y callbacks de persistencia.
 * @returns Modal con el formulario detallado de una regla de flujo.
 */
export function DetailFlowRule({
  open,
  tareas,
  insumos,
  rule,
  onClose,
  onCreateRule,
  onEditRule,
}: Props) {
  const [state, setState] = React.useState<ReglasFlujoTareas>(emptyRule);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    if (rule) {
      setState({
        ...rule,
        Condicion: rule.Condicion ?? "equals",
        Activa: rule.Activa ?? "Si",
        Prioridad: rule.Prioridad ?? "1",
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
    (i) => String(i.Id) === String(state.IdPlantillaInsumo)
  );

  let opciones: string[] = [];
  try {
    opciones = JSON.parse(selectedQuestion?.OpcionesJson ?? "[]");
    if (!Array.isArray(opciones)) opciones = [];
  } catch {
    opciones = [];
  }

  

  /**
   * Valida el formulario y guarda la regla en modo creacion o edicion.
   */
  const handleSave = async () => {
    if (!state.IdTemplateTaskOrigen) {
      alert("Debes seleccionar la tarea origen.");
      return;
    }

    if (!state.IdPlantillaInsumo) {
      alert("Debes seleccionar la pregunta.");
      return;
    }

    if (!state.ValorEsperado?.trim()) {
      alert("Debes definir el valor esperado.");
      return;
    }

    if (!state.TareaSiCumple) {
      alert("Debes seleccionar la tarea destino si cumple.");
      return;
    }

    if (!state.TareaSiNoCumple) {
      alert("Debes seleccionar la tarea destino si no cumple.");
      return;
    }

    if (state.TareaSiCumple === state.TareaSiNoCumple) {
      alert("Los destinos no pueden ser iguales.");
      return;
    }

    setSaving(true);
    try {
      const payload: ReglasFlujoTareas = {
        ...state,
        Title: `${state.IdTemplateTaskOrigen}-${state.IdPlantillaInsumo}`,
        Condicion: "equals",
        Activa: "Si",
        Prioridad: "1",
      };

      if (rule?.Id) {
        await onEditRule(rule.Id, payload);
      } else {
        await onCreateRule(payload);
      }

      onClose();
    } catch (e) {
      console.error(e);
      alert("No fue posible guardar la regla.");
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
                value={state.IdTemplateTaskOrigen ?? ""}
                onChange={(e) => setField("IdTemplateTaskOrigen", e.target.value)}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.Id ?? t.Codigo} value={t.Codigo}>
                    {t.Codigo} - {t.Title}
                  </option>
                ))}
              </select>
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Pregunta de flujo</span>
              <select
                className="tp-field__input"
                value={state.IdPlantillaInsumo ?? ""}
                onChange={(e) => {
                  setField("IdPlantillaInsumo", e.target.value);
                  setField("ValorEsperado", "");
                }}
              >
                <option value="">Selecciona una pregunta</option>
                {insumos.map((i) => (
                  <option key={i.Id} value={i.Id}>
                    {i.Title}
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
                  value={state.ValorEsperado ?? ""}
                  onChange={(e) => setField("ValorEsperado", e.target.value)}
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
                  value={state.ValorEsperado ?? ""}
                  onChange={(e) => setField("ValorEsperado", e.target.value)}
                  placeholder="Valor esperado"
                />
              )}
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Tarea destino si cumple</span>
              <select
                className="tp-field__input"
                value={state.TareaSiCumple ?? ""}
                onChange={(e) => setField("TareaSiCumple", e.target.value)}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.Id ?? t.Codigo} value={t.Codigo}>
                    {t.Codigo} - {t.Title}
                  </option>
                ))}
              </select>
            </label>

            <label className="tp-field">
              <span className="tp-field__label">Tarea destino si no cumple</span>
              <select
                className="tp-field__input"
                value={state.TareaSiNoCumple ?? ""}
                onChange={(e) => setField("TareaSiNoCumple", e.target.value)}
              >
                <option value="">Selecciona una tarea</option>
                {tareas.map((t) => (
                  <option key={t.Id ?? t.Codigo} value={t.Codigo}>
                    {t.Codigo} - {t.Title}
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
