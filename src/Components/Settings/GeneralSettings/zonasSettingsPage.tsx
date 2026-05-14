import * as React from "react";
import type { zonas } from "../../../models/generalConfigs";
import { useZonas } from "../../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import { SingleFieldSettingsPageWrapper } from "./SingleFieldSettingsPageWrapper";

const ZONAS_CONFIG = {
  title: "Configurar zonas",
  description: "Administra el catalogo territorial que luego usan asignaciones y reportes.",
  fieldLabel: "Nombre de zona",
} as const;

export const ZonasSettingsPage: React.FC = () => {
  const { zones, loadZones, createZones, loading, error, loadError, status } = useZonas();

  React.useEffect(() => {
    void loadZones();
  }, []);

  return (
    <SingleFieldSettingsPageWrapper<zonas>
      title={ZONAS_CONFIG.title}
      description={ZONAS_CONFIG.description}
      fieldLabel={ZONAS_CONFIG.fieldLabel}
      fieldKey="zonas"
      items={zones}
      loading={status.loading || loading}
      error={loadError ?? error}
      backTo="/settings"
      backLabel="Volver a settings"
      onCreate={createZones}
    />
  );
};
