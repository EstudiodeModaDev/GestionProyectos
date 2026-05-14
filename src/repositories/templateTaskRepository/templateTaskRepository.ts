import type { TemplateTasks } from "../../models/AperturaTienda";

export interface TemplateTaskRepository {
  loadTasks(): Promise<TemplateTasks[]>;
  createTask(payload: TemplateTasks): Promise<TemplateTasks>;
  updateTask(id: string, payload: TemplateTasks): Promise<TemplateTasks>;
  inactivateTask(id: string): Promise<void>;
}
