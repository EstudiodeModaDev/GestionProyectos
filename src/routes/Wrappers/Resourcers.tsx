import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGraphServices } from "../../graph/graphContext";
import type { ProjectSP } from "../../models/Projects";
import { ResourceAllocation } from "../../Components/AsignacionRecursos/AsignacionRecursos";

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
  const { proyectos } = useGraphServices();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const found = await proyectos.get(projectId);
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
  }, [projectId, proyectos]);

  if (!projectId) return <Navigate to="/dashboard" replace />;
  if (loading) return <p>Cargando proyecto...</p>;
  if (error || !project) return <p>No se pudo cargar el proyecto.</p>;

  return <ResourceAllocation project={project} />;
}
