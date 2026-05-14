import * as React from "react";
import type { marcas } from "../../../models/generalConfigs";
import { SingleFieldSettingsPageWrapper } from "./SingleFieldSettingsPageWrapper";
import { useMarcas } from "../../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";

const MARCAS_CONFIG = {
  title: "Configurar marcas",
  description: "Manten actualizadas las marcas visibles en formularios y reglas.",
  fieldLabel: "Nombre de marca",
} as const;

export const MarcasSettingsPage: React.FC = () => {
  const marcas = useMarcas();

  React.useEffect(() => {
    void marcas.loadMarcasBD();
  }, []);

  return (
    <SingleFieldSettingsPageWrapper<marcas>
      title={MARCAS_CONFIG.title}
      description={MARCAS_CONFIG.description}
      fieldLabel={MARCAS_CONFIG.fieldLabel}
      fieldKey="nombre_marca"
      items={marcas.marcas}
      onCreate={marcas.createMarcas}
      backTo="/settings"
    />
  );
};
