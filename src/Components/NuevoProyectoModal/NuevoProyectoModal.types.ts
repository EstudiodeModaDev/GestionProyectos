import type { marcas, zonas } from "../../models/generalConfigs";

export interface NuevoProyectoModalProps {
  open: boolean;
  onClose: () => void;
}

export type FaseInsumo = "Entrada" | "Salida" | "Ambas";

export type SalidaItem = {
  id: string;
  title: string;
};

export type NuevoProyectoFormProps = {
  nombreProyecto: string;
  marcaId: string;
  zonaId: string;
  fechaInicio: string;
  fechaLanzamiento: string;
  lider: string;
  marcas: marcas[];
  zonas: zonas[];
  disabled: boolean;
  onNombreProyectoChange: (value: string) => void;
  onMarcaChange: (value: string) => void;
  onZonaChange: (value: string) => void;
  onFechaInicioChange: (value: string) => void;
  onFechaLanzamientoChange: (value: string) => void;
};

export type NuevoProyectoFooterProps = {
  loading: boolean;
  loadingMessage: string;
  disabled: boolean;
  onCancel: () => void;
};
