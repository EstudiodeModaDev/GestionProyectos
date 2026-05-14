import type { LogTarea } from "../../models/LogTarea";

export type filterTaskLog = {
  id_tarea: string
}

export interface taskLogRepository {
  loadTaskLogs(filter?: filterTaskLog): Promise<LogTarea[]>;
  createLog(payload: LogTarea): Promise<LogTarea>;
}
