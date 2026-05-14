import type { LogTarea } from "../../models/LogTarea";
import type { SupabaseApiService } from "../../services/supabase.service";
import type { filterTaskLog, taskLogRepository, } from "./TaskLogRepository";

export class SupabaseTaskLogRepository implements taskLogRepository {
  private readonly api: SupabaseApiService;

  constructor(api: SupabaseApiService) {
    this.api = api;
  }

  loadTaskLogs(filter?: filterTaskLog): Promise<LogTarea[]> {
    return this.api.call<LogTarea[]>("taskLog.list", {...filter});
  }

  createLog(payload: LogTarea): Promise<LogTarea> {
    return this.api.call<LogTarea>("taskLog.create", {
      resource: "taskLog",
      ...payload,
    });
  }
}
