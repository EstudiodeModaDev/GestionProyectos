/**
 * Punto de entrada orquestador del dominio de tareas de proyecto.
 */
export { useTasks } from "./hooks/useProjectTasks";
export { useTaskForm } from "./hooks/useTaskForm";
export { useTaskFilters } from "./hooks/useTaskFilters";
export { useTaskDates } from "./hooks/useTaskDates";
export { useTasksRepository } from "./hooks/useTasksRepository";
export { useTaskProgress } from "./hooks/useTaskProgress";
export { useTaskCriticalPaths } from "./hooks/useTaskCriticalPaths";
export type { TaskFiltersState } from "./utils/taskFilters";
