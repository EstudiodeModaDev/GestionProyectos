import type { projectTasks } from "../../models/AperturaTienda";

export type ProjectTasksFilters = {
  id_tarea_plantilla?: number,
  id_proyecto?: number,
  estado?: string
}

export interface ProjectTasksRepository {
  loadTasks(filters?: ProjectTasksFilters): Promise<projectTasks[]>;
  createTasks(payload: projectTasks): Promise<projectTasks>;
  editTasks(id: string, payload: Partial<projectTasks>): Promise<projectTasks>
}
