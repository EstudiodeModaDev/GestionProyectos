import type { TemplateTasks } from "../../models/AperturaTienda";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { TemplateTaskRepository } from "./templateTaskRepository";

export class SupabaseTemplateTaskRepository implements TemplateTaskRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadTasks(): Promise<TemplateTasks[]> {
    return this.api.call<TemplateTasks[]>("templateTasks.list", {});
  }

  createTask(payload: TemplateTasks): Promise<TemplateTasks> {
    return this.api.call<TemplateTasks>("templateTasks.create", {
      resource: "templateTasks",
      ...payload,
    });
  }

  updateTask(id: string, payload: TemplateTasks): Promise<TemplateTasks> {
    return this.api.call<TemplateTasks>("templateTasks.update", {
      resource: "templateTasks",
      id: id,
      ...payload,
    });
  }

  async inactivateTask(): Promise<void> {
    return
  }
}
