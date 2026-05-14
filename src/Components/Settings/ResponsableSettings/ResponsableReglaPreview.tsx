import React from "react";
import { useMarcas } from "../../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";
import { useZonas } from "../../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import type { responsableReglaTarea, responsableReglaTareaDetalle } from "../../../models/responsables";

type Props = {
  focusedRule: responsableReglaTarea | null;
  focusedRuleDetails: responsableReglaTareaDetalle[];
  loading?: boolean;
  onOpenRule: (regla: responsableReglaTarea) => void;
  onDeleteRule: (regla: responsableReglaTarea) => void | Promise<void>;
};

export function ResponsableReglaPreview({focusedRule, focusedRuleDetails, loading = false, onOpenRule, onDeleteRule,}: Props) {
  const marcas = useMarcas()
  const zonas = useZonas()

  React.useEffect(() => {
    void marcas.loadMarcasBD()
    void zonas.loadZones()
  }, []);

  return (
    <div className="tp-resp-preview">
      <div className="tp-resp-preview__header">
        <div>
          <span className="tp-resp-stage__eyebrow">Detalle de regla</span>
          <h5 className="tp-resp-rule-stream__title">
            {focusedRule ? "Resumen de responsables" : "Sin regla seleccionada"}
          </h5>
        </div>
      </div>

      {!focusedRule ? (
        <div className="tp-empty tp-resp-empty">Selecciona una regla para ver sus responsables.</div>
      ) : (
        <div className="tp-resp-preview__card">
          <div className="tp-resp-preview__stats">
            <div className="tp-resp-preview__stat">
              <span className="tp-resp-preview__stat-label">Marca</span>
              <strong>{marcas.marcas.find((m) => m.id === focusedRule.id_marca)?.nombre_marca ?? "Todas"}</strong>
            </div>
            <div className="tp-resp-preview__stat">
              <span className="tp-resp-preview__stat-label">Zona</span>
              <strong>{zonas.zones.find((m) => m.id === focusedRule.id_zona)?.zonas ?? "Todas"}</strong>
            </div>
            <div className="tp-resp-preview__stat">
              <span className="tp-resp-preview__stat-label">Encargados</span>
              <strong>{focusedRuleDetails.length}</strong>
            </div>
          </div>

          <div className="tp-resp-preview__people">
            {loading ? (
              <div className="tp-empty tp-resp-empty">Cargando encargados...</div>
            ) : focusedRuleDetails.length === 0 ? (
              <div className="tp-empty tp-resp-empty">Esta regla aun no tiene encargados asociados.</div>
            ) : (
              focusedRuleDetails.map((detalle) => (
                <article key={detalle.id ?? `${detalle.regla_id}-${detalle.correo}`} className="tp-resp-person-card">
                  <div className="tp-resp-person-card__avatar">
                    {(detalle.nombre ?? detalle.correo ?? "?").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="tp-resp-person-card__copy">
                    <strong>{detalle.nombre || "Sin nombre"}</strong>
                    <span>{detalle.correo || "Sin correo"}</span>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="tp-resp-preview__actions">
            <button className="pl-btn pl-btn--primary" type="button" onClick={() => onOpenRule(focusedRule)}>
              Abrir detalle
            </button>
            <button className="pl-btn pl-btn--danger" type="button" onClick={() => onDeleteRule(focusedRule)}>
              Eliminar regla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
