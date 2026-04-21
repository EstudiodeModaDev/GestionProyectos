import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../Components/Dashboard/Dashboard";
import { KanbanPage } from "./Wrappers/KanbanPage";
import { ResourcesPage } from "./Wrappers/Resourcers";
import { PlantillasPanel } from "../Components/Settings/Settings";
import type { ProjectSP } from "../models/Projects";
import { GanttPage } from "./Wrappers/GanttPage";
import { MetricsPage } from "./Wrappers/MetricsPage";

type Props = {
  setSelectedProject: (p: ProjectSP) => void;
  project: ProjectSP | null;
};

/**
 * Define las rutas principales de la aplicación.
 * @param props - Propiedades compartidas entre vistas dependientes del proyecto seleccionado.
 * @returns Árbol de rutas configurado para la aplicación.
 */
export default function AppRoutes({ setSelectedProject, project }: Props) {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/kanban/:projectId" element={<KanbanPage setSelectedProject={setSelectedProject} project={project} />}/>
      <Route path="/gantt/:projectId" element={<GanttPage setSelectedProject={setSelectedProject} project={project} />}/>
      <Route path="/resource/:projectId" element={<ResourcesPage setSelectedProject={setSelectedProject} project={project} />}/>
      <Route path="/settings" element={<PlantillasPanel plantillas={[{id: "1", nombre: "Apertura de tiendas", codigo: "apertura", tareasListName: "Tareas Apertura Tienda"}]} />} />
      <Route path="/metrics/:projectId" element={<MetricsPage setSelectedProject={setSelectedProject} project={project} />}/>
    </Routes>
  );
}
