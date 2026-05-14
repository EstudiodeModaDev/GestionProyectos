import type { TemplateTasks } from "../../../models/AperturaTienda";

type Props = {
  selectedTaskId: number | null;
  tareas: TemplateTasks[];
  onSelectTask: (taskId: number) => void;
};

export function ResponsableReglaTaskSidebar({selectedTaskId, tareas, onSelectTask,}: Props) {
  return (
    <aside className="tp-resp-shell__sidebar">
      <div className="tp-resp-shell__sidebar-header">
        <h4 className="tp-section__title">Mapa de tareas</h4>
        <span className="tp-resp-shell__meta">{tareas.length}</span>
      </div>

      <div className="tp-resp-shell__sidebar-list">
        {tareas.map((tarea) => {
          const taskId = Number(tarea.id ?? 0);

          return (
          <button
            key={tarea.id ?? tarea.codigo}
            type="button"
            className={`tp-resp-task-tile ${selectedTaskId === taskId ? "tp-resp-task-tile--active" : ""}`}
            onClick={() => onSelectTask(taskId)}
            >
              <div className="tp-resp-task-tile__head">
                <span className="tp-resp-task-tile__code">{tarea.codigo}</span>
              <span className="tp-resp-task-tile__state">{selectedTaskId === taskId ? "Seleccionada" : "Disponible"}</span>
              </div>

              <strong className="tp-resp-task-tile__title">{tarea.nombre_tarea}</strong>
            <span className="tp-resp-task-tile__area">{tarea.area_responsable || "Sin area responsable"}</span>
          </button>
          );
        })}
      </div>
    </aside>
  );
}
