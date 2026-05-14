import * as React from "react";
import type { areas } from "../../../models/generalConfigs";
import { SingleFieldSettingsPageWrapper } from "./SingleFieldSettingsPageWrapper";
import { useAreas } from "../../../Funcionalidades/generalConfigs/areasConfig/useAreas";

const AREAS_CONFIG = {
  title: "Configurar areas encargadas",
  description: "Gestiona las areas duenas del seguimiento y ejecucion operativa.",
  fieldLabel: "Nombre del area",
} as const;

export const AreasSettingsPage: React.FC = () => {
  const areas = useAreas()

  React.useEffect(() => {
    void areas.loadAreasBD();
  }, []);

  return (
    <SingleFieldSettingsPageWrapper<areas>
      title={AREAS_CONFIG.title}
      description={AREAS_CONFIG.description}
      fieldLabel={AREAS_CONFIG.fieldLabel}
      fieldKey="nombre_area"
      items={areas.areas}
      onCreate={areas.createAreas}
      backTo="/settings"
    />
  );
};
