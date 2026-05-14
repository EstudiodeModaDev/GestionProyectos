import * as React from "react";
import { useSupabaseApi } from "../Funcionalidades/Supabase/useSupabaseApi";
import type { PlantillaInsumosRepository } from "./plantillaInsumoRepository/PlantillaInsumosRepository";
import { SupabasePlantillaInsumosRepository } from "./plantillaInsumoRepository/SupabasePlantillaInsumosRepository";
import type { TemplateTaskRepository } from "./templateTaskRepository/templateTaskRepository";
import { SupabaseTemplateTaskRepository } from "./templateTaskRepository/SupabaseTempletaTaskRepository";
import type { GeneralConfigRepository } from "./generalConfigRepository/generalConfigReposity";
import { SupabaseZonaRepository } from "./generalConfigRepository/zonasRepository/SupabaseZonaRepository";
import { SupabaseMarcasRepository } from "./generalConfigRepository/marcasRepository/SupabaseMarcasRepository";
import { SupabaseAreasRepository } from "./generalConfigRepository/areasRepository/SupabaseAreasRepository";
import type { RulesFlujoRepository } from "./reglasFlujoRepository/templateTaskRepository";
import { SupabaseReglasFlujoRepository } from "./reglasFlujoRepository/SupabaseReglasFlujoRepository";
import { SupabaseTemplateTaskResponsibleRepository } from "./TemplateTaskResponsibleRepository/SupabaseTempletaTaskResponsibleRepository";
import { SupabaseDetailResponsibleRepository } from "./ResponsibleDetailReposiitory/SupabaseDetailResponsibleRepository";
import { SupabaseJefeZonaTaskRepository } from "./jefeZonaRepository/SupabaseTempletaTaskRepository";
import type { JefeZonaRepository } from "./jefeZonaRepository/jefeZonaRepository";
import type { templateTaskInsumoRepository } from "./templateTaskInsumoRepository/templateTaskInsumoRepository";
import { SupabaseTemplateTaskInsumoRepository } from "./templateTaskInsumoRepository/SupabaseTempletaTaskRepository";
import type { ProjectRepository } from "./ProjectRepository/ProjectRepository";
import { SupabaseProjectRepository } from "./ProjectRepository/supabaseProjectRepository";
import type { ProjectTasksRepository } from "./ProjectTasksRepository/ProjectTasksRepository";
import { SupabaseProjectTaskReposity } from "./ProjectTasksRepository/SupabaseProjectTasksRepository";
import type { ProjectTaskResponsibleRepository } from "./ProjectTaskResponsibleRepository/templateTaskResponsibleRepository";
import { SupabaseProjectTaskResponsibleRepository } from "./ProjectTaskResponsibleRepository/SupabaseProjectTaskResponsibleRepository";
import type { InsumosProyectosRepository } from "./insumosProyectoRepository/insumosProyectoRepository";
import { SupabaseProjectInsumosRepository } from "./insumosProyectoRepository/SupabasePlantillaInsumosRepository";
import type { TareaInsumoProyectoRepository } from "./TareaInsumoProyectoRepository/TareaInsumoProyectoRepository";
import { SupabaseTareaInsumoProyectoRepository } from "./TareaInsumoProyectoRepository/SupabaseTempletaTaskResponsibleRepository";
import type { taskLogRepository } from "./taskLogRepository/TaskLogRepository";
import { SupabaseTaskLogRepository } from "./taskLogRepository/SupabaseTaskLogRepository";

type RepositorySource = "supabase";

export type AppRepositories = {
  plantillaInsumos: PlantillaInsumosRepository | null;
  templateTask: TemplateTaskRepository | null;
  zonas: GeneralConfigRepository | null
  marcas: GeneralConfigRepository | null
  areas: GeneralConfigRepository | null
  reglasFlujo: RulesFlujoRepository | null
  responsablesPlantilla: SupabaseTemplateTaskResponsibleRepository | null
  responsablesDetalles: SupabaseDetailResponsibleRepository | null
  jefeZona: JefeZonaRepository | null
  plantillaTareaInsumo: templateTaskInsumoRepository | null
  projects: ProjectRepository | null
  projectTasks: ProjectTasksRepository | null
  projectTaskReponsible: ProjectTaskResponsibleRepository | null
  projectInsumo: InsumosProyectosRepository | null
  proyectoTareaInsumo: TareaInsumoProyectoRepository | null
  logTareas: taskLogRepository | null
};

type RepositoriesProviderProps = {
  children: React.ReactNode;
  sources?: Partial<{
    plantillaInsumos: RepositorySource;
    templateTask: RepositorySource;
    zonas: RepositorySource;
    marcas: RepositorySource;
    areas: RepositorySource;
    reglasFlujo: RepositorySource;
    responsablesPlantilla: RepositorySource
    responsablesDetalles: RepositorySource
    jefeZona: RepositorySource
    plantillaTareaInsumo: RepositorySource
    project: RepositorySource
    projectTasks: RepositorySource
    projectTaskReponsible: RepositorySource
    projectInsumo: RepositorySource
    proyectoTareaInsumo: RepositorySource
    taskLog: RepositorySource
  }>;
};

const RepositoriesContext = React.createContext<AppRepositories | null>(null);

export const RepositoriesProvider: React.FC<RepositoriesProviderProps> = ({
  children,
  sources,
}) => {
  const supabaseApi = useSupabaseApi();

  const repositories = React.useMemo<AppRepositories>(() => {
    const plantillaInsumosSource = sources?.plantillaInsumos ?? "supabase";
    const templateTaskSource = sources?.templateTask ?? "supabase";
    const zonasSource = sources?.zonas ?? "supabase";
    const marcasSource = sources?.marcas ?? "supabase";
    const areasSource = sources?.areas ?? "supabase";
    const reglasFlujoSource = sources?.reglasFlujo ?? "supabase";
    const responsablesPlantillaSource = sources?.reglasFlujo ?? "supabase";
    const responsablesDetallesSource = sources?.reglasFlujo ?? "supabase"
    const jefeZonaSource = sources?.jefeZona ?? "supabase"
    const plantillaTareaInsumoSource = sources?.plantillaInsumos ?? "supabase"
    const projectSource = sources?.project ?? "supabase"
    const projectTasksSource = sources?.projectTasks ?? "supabase"
    const projectTaskReponsibleSource = sources?.projectTaskReponsible ?? "supabase"
    const projectInsumoSource = sources?.projectInsumo ?? "supabase"
    const proyectoTareaInsumoSource = sources?.proyectoTareaInsumo ?? "supabase"
    const taskLogSource = sources?.proyectoTareaInsumo ?? "supabase"


    return {
      plantillaInsumos: plantillaInsumosSource === "supabase" ? new SupabasePlantillaInsumosRepository(supabaseApi): null,
      templateTask: templateTaskSource === "supabase" ? new SupabaseTemplateTaskRepository(supabaseApi): null,
      zonas: zonasSource === "supabase" ? new SupabaseZonaRepository(supabaseApi): null,
      marcas: marcasSource === "supabase" ? new SupabaseMarcasRepository(supabaseApi): null,
      areas: areasSource === "supabase" ? new SupabaseAreasRepository(supabaseApi): null,
      reglasFlujo: reglasFlujoSource === "supabase" ? new SupabaseReglasFlujoRepository(supabaseApi): null,
      responsablesPlantilla: responsablesPlantillaSource === "supabase" ? new SupabaseTemplateTaskResponsibleRepository(supabaseApi): null,
      responsablesDetalles: responsablesDetallesSource === "supabase" ? new SupabaseDetailResponsibleRepository(supabaseApi): null,    
      jefeZona: jefeZonaSource === "supabase" ? new SupabaseJefeZonaTaskRepository(supabaseApi): null,    
      plantillaTareaInsumo: plantillaTareaInsumoSource === "supabase" ? new SupabaseTemplateTaskInsumoRepository(supabaseApi): null,    
      projects: projectSource === "supabase" ? new SupabaseProjectRepository(supabaseApi): null,    
      projectTasks: projectTasksSource === "supabase" ? new SupabaseProjectTaskReposity(supabaseApi): null,    
      projectTaskReponsible: projectTaskReponsibleSource === "supabase" ? new SupabaseProjectTaskResponsibleRepository(supabaseApi): null,  
      projectInsumo: projectInsumoSource === "supabase" ? new SupabaseProjectInsumosRepository(supabaseApi): null,  
      proyectoTareaInsumo: proyectoTareaInsumoSource === "supabase" ? new SupabaseTareaInsumoProyectoRepository(supabaseApi): null,  
      logTareas: taskLogSource === "supabase" ? new SupabaseTaskLogRepository(supabaseApi): null,  

    };
  }, [supabaseApi, sources?.plantillaInsumos]);

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
};

export function useRepositories(): AppRepositories {
  const ctx = React.useContext(RepositoriesContext);

  if (!ctx) {
    throw new Error("useRepositories must be used within <RepositoriesProvider>");
  }

  return ctx;
}
