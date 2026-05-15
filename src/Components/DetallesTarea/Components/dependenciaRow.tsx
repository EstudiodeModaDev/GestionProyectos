import type { projectTasks } from "../../../models/AperturaTienda";

type Props = {
  task: projectTasks
  onGoToTask: (task: projectTasks) => void;
}
/**
 * Presenta el detalle completo de una tarea, sus insumos, dependencias y acciones.
 *
 * @param props - Propiedades del modal de detalle.
 * @returns Modal con informacion operativa y acciones sobre la tarea seleccionada.
 */
export function DependenciaRow({task, onGoToTask}: Props){
  return (
    <>
      <div className="tdm-predecessor-item" onClick={() => onGoToTask(task)}>
        <p className="tdm-predecessor-title">
          {task.nombre_tarea} ({task.codigo})
        </p>
        <p className={"tdm-predecessor-status " + (task.Estado === "Completada" ? "tdm-predecessor-status-ok" : "tdm-predecessor-status-blocked")}>
          Estado: {task.Estado}
        </p>
      </div>
    </>
  );
};
