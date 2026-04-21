import * as React from "react";
import { useAuth } from "../auth/authProvider";
import { GraphRest } from "./graphRest";
import { ProyectosServices } from "../services/Projets.service";
import { TareasProyectosService } from "../services/ProjectTasks.service";
import { PlantillaInsumoService } from "../services/PlantillaInsumos.service";
import { InsumoProyectoService } from "../services/InsumoProyecto.service";
import { PlantillaTareaInsumoService } from "../services/PlantillaTareaInsumo.service";
import { TareaInsumoProyectoServicio } from "../services/TareaInsumoProyecto.service";
import { ResponsableReglaTareaService } from "../services/ResponsableReglaTarea.service";
import { JefeZonaService } from "../services/JefeZona.service";
import { MarcasService } from "../services/Marcas.service";
import { ZonasService } from "../services/Zonas.service";
import { ResponsableReglaTareaDetalleService } from "../services/ResponsableReglaTareaDetalle.service";
import { MailService } from "../services/Notifications.service";
import { ReglasFlujoTareaService } from "../services/ReglasFlujoTarea.service";
import { LogTareaService } from "../services/LogTarea.service";
import { TemplateTaskService } from "../services/TemplateTasks.service";
import { ResponsableTareaProyectoService } from "../services/responsableTareaProyecto.service";
import { TaskBibliotecaAttachmentsService } from "../services/AttachmentLibrary.service";
/* ================== Tipos de config ================== */
export type SiteConfig = {
  hostname: string;
  sitePath: string; 
};

export type UnifiedConfig = {
  test: SiteConfig;  // sitio de pruebas
};

/* ================== Tipos del contexto ================== */
export type GraphServices = {
  graph: GraphRest;

  // TEST
  proyectos : ProyectosServices,
  templateTask: TemplateTaskService,
  tasks: TareasProyectosService,
  plantillaInsumos: PlantillaInsumoService,
  insumoProyecto: InsumoProyectoService,
  plantillaTareaInsumo: PlantillaTareaInsumoService,
  tareaInsumoProyecto: TareaInsumoProyectoServicio,
  responsableRegla: ResponsableReglaTareaService,
  responsableReglaDetalle: ResponsableReglaTareaDetalleService
  jefeZona: JefeZonaService, 
  marcas: MarcasService,
  zonas: ZonasService
  responsableProyecto: ResponsableTareaProyectoService
  mail: MailService,
  reglasFlujo: ReglasFlujoTareaService,
  logTarea: LogTareaService
  taskFilesInsumos: TaskBibliotecaAttachmentsService
};


/* ================== Contexto ================== */
const GraphServicesContext = React.createContext<GraphServices | null>(null);

/* ================== Default config (puedes cambiar paths) ================== */
const DEFAULT_CONFIG: UnifiedConfig = {
  test: {
    hostname: "estudiodemoda.sharepoint.com",
    sitePath: "/sites/TransformacionDigital/IN/Test",
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

    const test: SiteConfig = {
      hostname: config?.test?.hostname ?? base.test.hostname,
      sitePath: normPath(config?.test?.sitePath ?? base.test.sitePath),
    };

    return { test, };
  }, [config]);

  // Cliente Graph
  const graph = React.useMemo(() => new GraphRest(getToken), [getToken]);

  // Instanciar servicios (HD usando cfg.hd, PazYSalvos usando cfg.test)
  const services = React.useMemo<GraphServices>(() => {

    // HD
    const proyectos                 = new ProyectosServices(graph,);
    const templateTask              = new TemplateTaskService(graph,);
    const tasks                     = new TareasProyectosService(graph);
    const plantillaInsumos          = new PlantillaInsumoService(graph);
    const insumoProyecto            = new InsumoProyectoService(graph,);
    const plantillaTareaInsumo      = new PlantillaTareaInsumoService(graph,);
    const tareaInsumoProyecto       = new TareaInsumoProyectoServicio(graph,);
    const responsableRegla          = new ResponsableReglaTareaService(graph,)
    const responsableReglaDetalle   = new ResponsableReglaTareaDetalleService(graph)
    const jefeZona                  = new JefeZonaService(graph)
    const marcas                    = new MarcasService(graph)
    const zonas                     = new ZonasService(graph)
    const responsableProyecto       = new ResponsableTareaProyectoService(graph)
    const mail                      = new MailService(graph)
    const reglasFlujo               = new ReglasFlujoTareaService(graph)
    const logTarea                  = new LogTareaService(graph)
    const taskFilesInsumos          = new TaskBibliotecaAttachmentsService(graph, cfg.test.hostname, cfg.test.sitePath, "Insumos")

    return {
      graph, proyectos, templateTask, tasks, plantillaInsumos, insumoProyecto, plantillaTareaInsumo, tareaInsumoProyecto, responsableRegla,
      mail, responsableReglaDetalle, taskFilesInsumos, jefeZona, marcas, zonas, responsableProyecto, reglasFlujo, logTarea
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

