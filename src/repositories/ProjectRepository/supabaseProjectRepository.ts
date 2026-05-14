import type { ProjectSP } from "../../models/Projects";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterProject, ProjectRepository } from "./ProjectRepository";

export class SupabaseProjectRepository implements ProjectRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadProjects(filter?: filterProject): Promise<ProjectSP[]> {
    return this.api.call<ProjectSP[]>("projects.list", {...filter});
  }

  createProject(payload: ProjectSP): Promise<ProjectSP> {
    return this.api.call<ProjectSP>("projects.create", {
      resource: "projects",
      ...payload,
    });
  }

  updateProject(id: string, payload: Partial<ProjectSP>): Promise<ProjectSP> {
    return this.api.call<ProjectSP>("projects.update", {
      resource: "projects",
      id: id,
      ...payload,
    });
  }

}
