import * as React from "react";
import { useAuth } from "../auth/authProvider";
import { GraphRest } from "./graphRest";
import { MailService } from "../services/Notifications.service";
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
  mail: MailService,
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
  const { getGraphToken } = useAuth();

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
  const graph = React.useMemo(() => new GraphRest(getGraphToken), [getGraphToken]);

  // Instanciar servicios (HD usando cfg.hd, PazYSalvos usando cfg.test)
  const services = React.useMemo<GraphServices>(() => {

    // HD
    const mail                      = new MailService(graph)

    return {
      graph, mail,  };
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

