import type { projectTasks } from "../../models/AperturaTienda";
import type { SupabaseApiService } from "../../services/supabase.service";

import type { ProjectTasksFilters, ProjectTasksRepository } from "./ProjectTasksRepository";

function normalizeNullableDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null") return null;
  return value;
}

function normalizeTaskPayload(payload: Partial<projectTasks>) {
  return {
    ...payload,
    fecha_cierre: normalizeNullableDate(payload.fecha_cierre),
    fecha_resolucion: normalizeNullableDate(payload.fecha_resolucion),
    fecha_inicio: normalizeNullableDate(payload.fecha_inicio),
  };
}

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
      ...normalizeTaskPayload(payload),
    });
  }

  editTasks(id: string, payload: Partial<projectTasks>): Promise<projectTasks> {
    return this.api.call<projectTasks>("projectTasks.update", {
      resource: "projectTasks",
      id: id,
      ...normalizeTaskPayload(payload),
    });
  }
}
