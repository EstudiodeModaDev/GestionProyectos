import * as React from "react";
import { useAuth } from "../auth/authProvider";
import { GraphRest } from "./graphRest";
import { ProyectosServices } from "../services/Projets.service";
import { AperturaTiendaService } from "../services/Plantillas.service";
import { TareasProyectosService } from "../services/Tasks.service";
import { PlantillaInsumoService } from "../services/PlantillaInsumos.service";
import { InsumoProyectoService } from "../services/InsumoProyecto.service";
import { PlantillaTareaInsumoService } from "../services/PlantillaTareaInsumo.service";
import { TareaInsumoProyectoServicio } from "../services/TareaInsumoProyecto.service";
/* ================== Tipos de config ================== */
export type SiteConfig = {
  hostname: string;
  sitePath: string; 
};

export type UnifiedConfig = {
  ch: SiteConfig;    // sitio principal (CH)
  test: SiteConfig;  // sitio de pruebas (Paz y salvos)
  lists: {
    // TI
    // TEST
    proyectos: string;
    apertura: string;
    tasks: string;
    plantillaInsumos: string;
    insumoProyecto: string;
    plantillaTareaInsumo: string,
    tareaInsumoProyecto: string
  };
};

/* ================== Tipos del contexto ================== */
export type GraphServices = {
  graph: GraphRest;

  // TI
  // TEST
  proyectos : ProyectosServices,
  apertura: AperturaTiendaService,
  tasks: TareasProyectosService,
  plantillaInsumos: PlantillaInsumoService,
  insumoProyecto: InsumoProyectoService,
  plantillaTareaInsumo: PlantillaTareaInsumoService,
  tareaInsumoProyecto: TareaInsumoProyectoServicio
};

/* ================== Contexto ================== */
const GraphServicesContext = React.createContext<GraphServices | null>(null);

/* ================== Default config (puedes cambiar paths) ================== */
const DEFAULT_CONFIG: UnifiedConfig = {
  ch: {
    hostname: "estudiodemoda.sharepoint.com",
    sitePath: "/sites/TransformacionDigital/IN/CH",
  },
  test: {
    hostname: "estudiodemoda.sharepoint.com",
    sitePath: "/sites/TransformacionDigital/IN/Test",
  },
  lists: {
    // CH

    // TEST
    proyectos: "Proyectos",
    apertura: "Tareas Apertura Tienda",
    tasks: "Tasks",
    plantillaInsumos: "InsumosPlantilla",
    insumoProyecto: "InsumosProyecto",
    plantillaTareaInsumo: "InsumoTareaPlantilla",
    tareaInsumoProyecto: "TareaInsumoProyecto"
  },
};

/* ================== Provider ================== */
type ProviderProps = {
  children: React.ReactNode;
  config?: Partial<UnifiedConfig>;
};

export const GraphServicesProvider: React.FC<ProviderProps> = ({ children, config }) => {
  const { getToken } = useAuth();

  // Mergeo de config
  const cfg: UnifiedConfig = React.useMemo(() => {
    const base = DEFAULT_CONFIG;

    const normPath = (p: string) => (p.startsWith("/") ? p : `/${p}`);

    const ch: SiteConfig = {
      hostname: config?.ch?.hostname ?? base.ch.hostname,
      sitePath: normPath(config?.ch?.sitePath ?? base.ch.sitePath),
    };

    const test: SiteConfig = {
      hostname: config?.test?.hostname ?? base.test.hostname,
      sitePath: normPath(config?.test?.sitePath ?? base.test.sitePath),
    };

    const lists = { ...base.lists, ...(config?.lists ?? {}) };

    return { ch, test, lists };
  }, [config]);

  // Cliente Graph
  const graph = React.useMemo(() => new GraphRest(getToken), [getToken]);

  const services = React.useMemo<GraphServices>(() => {
    const { ch, lists, test } = cfg;
    const proyectos             = new ProyectosServices(graph, test.hostname, test.sitePath, lists.proyectos)
    const apertura              = new AperturaTiendaService(graph, test.hostname, test.sitePath, lists.apertura)
    const tasks                 = new TareasProyectosService(graph, test.hostname, test.sitePath, lists.tasks)
    const plantillaInsumos      = new PlantillaInsumoService(graph, test.hostname, test.sitePath)
    const insumoProyecto        = new InsumoProyectoService(graph, test.hostname, test.sitePath, lists.insumoProyecto)
    const plantillaTareaInsumo  = new PlantillaTareaInsumoService(graph, test.hostname, test.sitePath, lists.plantillaTareaInsumo)
    const tareaInsumoProyecto   = new TareaInsumoProyectoServicio(graph, test.hostname, test.sitePath, lists.tareaInsumoProyecto)

    return {
      graph,
        
      //CH

      
      // TEST
      proyectos, apertura, tasks, plantillaInsumos, insumoProyecto, plantillaTareaInsumo, tareaInsumoProyecto

    };
  }, [graph, cfg]);

  return (
    <GraphServicesContext.Provider value={services}>
      {children}
    </GraphServicesContext.Provider>
  );
};

/* ================== Hook de consumo ================== */
export function useGraphServices(): GraphServices {
  const ctx = React.useContext(GraphServicesContext);
  if (!ctx) throw new Error("useGraphServices debe usarse dentro de <GraphServicesProvider>.");
  return ctx;
}
