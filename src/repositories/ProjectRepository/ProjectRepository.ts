import type { ProjectSP } from "../../models/Projects";

export type filterProject = {
  estado?: string
  id?: string
}

export interface ProjectRepository {
  loadProjects(filter?: filterProject): Promise<ProjectSP[]>;
  createProject(payload: ProjectSP): Promise<ProjectSP>;
  updateProject(id: string, payload: Partial<ProjectSP>): Promise<ProjectSP>;
}
