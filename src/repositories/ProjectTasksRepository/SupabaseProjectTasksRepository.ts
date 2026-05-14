import type { projectTasks } from "../../models/AperturaTienda";
import type { SupabaseApiService } from "../../services/supabase.service";

import type { ProjectTasksFilters, ProjectTasksRepository } from "./ProjectTasksRepository";

export class SupabaseProjectTaskReposity implements ProjectTasksRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadTasks(f: ProjectTasksFilters): Promise<projectTasks[]> {
    return this.api.call<projectTasks[]>("projectTasks.list", {...f});
  }

  createTasks(payload: projectTasks): Promise<projectTasks> {
    return this.api.call<projectTasks>("projectTasks.create", {
      resource: "projectTasks",
      ...payload,
    });
  }

  editTasks(id: string, payload: projectTasks): Promise<projectTasks> {
    return this.api.call<projectTasks>("projectTasks.update", {
      resource: "projectTasks",
      id: id,
      ...payload,
    });
  }
}
