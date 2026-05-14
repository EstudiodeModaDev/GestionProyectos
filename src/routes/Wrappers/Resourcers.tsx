import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import type { ProjectSP } from "../../models/Projects";
import { ResourceAllocation } from "../../Components/AsignacionRecursos/AsignacionRecursos";
import { useRepositories } from "../../repositories/repositoriesContext";
import { createVoidProject } from "../../Funcionalidades/commons/project";

type Props = {
  setSelectedProject: (p: ProjectSP) => void;
  project: ProjectSP | null;
};

/**
 * Carga el proyecto solicitado por ruta y muestra la vista de asignación de recursos.
 * @param props - Proyecto actual y función para actualizar la selección global.
 * @returns Vista de recursos o un estado de carga/error según corresponda.
 */
export function ResourcesPage({ setSelectedProject, project }: Props) {
  const { projectId } = useParams();
  const repositories = useRepositories()

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        let found: ProjectSP | null = createVoidProject()
        const candidates = await repositories.projects?.loadProjects({id: projectId});

        if(candidates && candidates?.length > 0){
          found = candidates[0]
        }


        if (!cancelled) setSelectedProject(found);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error cargando proyecto");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId,]);

  if (!projectId) return <Navigate to="/dashboard" replace />;
  if (loading) return <p>Cargando proyecto...</p>;
  if (error || !project) return <p>No se pudo cargar el proyecto.</p>;

  return <ResourceAllocation project={project} />;
}
