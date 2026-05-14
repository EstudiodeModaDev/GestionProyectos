import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMarcas } from "../../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";
import { useZonas } from "../../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import { useJefesZonaSettings } from "../../../Funcionalidades/taskResponsible/useJefesZonaSettings";
import { JefesZonaConfigModal } from "./JefesZonaConfigModal";
import "./GeneralSettings.css";

const JEFES_ZONA_CONFIG = {
  title: "Configurar jefes de zona",
  description: "Administra la matriz de responsables por marca y zona para la resolucion automatica de encargados.",
} as const;

export function JefesZonaSettingsPage() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { marcas, loadMarcasBD } = useMarcas();
  const { zones, loadZones } = useZonas();
  const {
    items,
    loadJefesZona,
    createJefeZona,
    updateJefeZona,
    deleteJefeZona,
    loading,
    error,
    saving,
    mutationError,
  } = useJefesZonaSettings();

  React.useEffect(() => {
    void loadJefesZona();
    void loadMarcasBD();
    void loadZones();
  }, []);

  return (
    <section className="general-settings-page">
      <header className="general-settings-page__header">
        <button className="pl-btn pl-btn--ghost general-settings-page__back-btn" type="button" onClick={() => navigate("/settings")}>
          Volver a settings
        </button>
        <span className="general-settings-page__eyebrow">Settings</span>
        <h1 className="general-settings-page__title">{JEFES_ZONA_CONFIG.title}</h1>
        <p className="general-settings-page__text">{JEFES_ZONA_CONFIG.description}</p>
      </header>

      <div className="general-settings-grid">
        <article className="general-settings-card">
          <div className="general-settings-card__topline" />
          <div>
            <h2 className="general-settings-card__title">{JEFES_ZONA_CONFIG.title}</h2>
            <p className="general-settings-card__text">{JEFES_ZONA_CONFIG.description}</p>
          </div>

          <div className="general-settings-card__meta">
            <span className="general-settings-card__meta-label">Registros configurados</span>
            <strong>{items.length}</strong>
          </div>

          {loading ? <p className="general-settings-card__text">Cargando configuraciones...</p> : null}
          {error ? <p className="general-settings-card__text">{error}</p> : null}
          {mutationError ? <p className="general-settings-card__text">{mutationError}</p> : null}

          <button className="pl-btn pl-btn--primary" type="button" onClick={() => setOpen(true)}>
            Abrir configuracion
          </button>
        </article>
      </div>

      <JefesZonaConfigModal
        open={open}
        items={items}
        marcas={marcas}
        zonas={zones}
        loading={loading}
        saving={saving}
        error={error ?? mutationError}
        onClose={() => setOpen(false)}
        onCreate={createJefeZona}
        onUpdate={updateJefeZona}
        onDelete={deleteJefeZona}
      />
    </section>
  );
}
