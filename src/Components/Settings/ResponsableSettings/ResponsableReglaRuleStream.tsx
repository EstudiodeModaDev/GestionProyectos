import React from "react";
import { useMarcas } from "../../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";
import { useZonas } from "../../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import type { responsableReglaTarea } from "../../../models/responsables";

type Props = {
  selectedTaskRules: responsableReglaTarea[];
  focusedRuleId: string | null;
  loading?: boolean;
  onFocusRule: (regla: responsableReglaTarea) => void;
};

export function ResponsableReglaRuleStream({selectedTaskRules, focusedRuleId, loading = false, onFocusRule,}: Props) {
  const marcas = useMarcas()
  const zonas = useZonas()

  React.useEffect(() => {
    void marcas.loadMarcasBD()
    void zonas.loadZones()
  }, []);
  return (
    <div className="tp-resp-rule-stream">
      <div className="tp-resp-rule-stream__header">
        <h5 className="tp-resp-rule-stream__title">Reglas</h5>
        <span className="tp-resp-shell__meta">{selectedTaskRules.length}</span>
      </div>

      {loading ? (
        <div className="tp-empty tp-resp-empty">Cargando reglas de la tarea...</div>
      ) : selectedTaskRules.length === 0 ? (
        <div className="tp-empty tp-resp-empty">Esta tarea no tiene reglas configuradas.</div>
      ) : (
        <div className="tp-resp-rule-stream__list">
          {selectedTaskRules.map((regla, index) => (
            <button key={regla.id ?? `${regla.template_task_id}-${index}`} type="button" className={`tp-resp-rule-card ${focusedRuleId === regla.id ? "tp-resp-rule-card--active" : ""}`}
              onClick={() => onFocusRule(regla)}
            >
              <div className="tp-resp-rule-card__head">
                <strong>Regla {index + 1}</strong>
              </div>
              <span className="tp-resp-rule-card__meta">Marca {marcas.marcas.find((m) => m.id === regla.id_marca)?.nombre_marca ?? "Todas"}</span>
              <span className="tp-resp-rule-card__meta">Zona {zonas.zones.find((z) => z.id === regla.id_zona)?.zonas ?? "No aplica"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
