import type { projectTasks } from "../../../models/AperturaTienda";

type Props = {
  tasks: projectTasks[]
  title: string
  onGoToTask: (task: projectTasks) => void;
  noTasksMessage: string
}

export function DependenciasCard({tasks, title, onGoToTask, noTasksMessage}: Props){
  return (
    <>
      <div className="tdm-card tdm-card-gray">
          <div className="tdm-card-icon-bubble">
            <svg className="tdm-icon tdm-icon-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
          </div>
          <div className="tdm-card-inner">
            <p className="tdm-section-label">{title}</p>
              {tasks.length > 0 ? (
                <ul className="tdm-successors-list">
                  {tasks.map((t) => {
                    const st = t.Estado;
                    return (
                      <li key={t.id} className="tdm-successor-item" onClick={() => onGoToTask(t)}>
                        <p className="tdm-successor-title">
                          {t.nombre_tarea} ({t.codigo})
                        </p>
                        <span className={ "tdm-successor-status " + (st !== "Finalizada" ? "tdm-successor-status-blocked" : "tdm-successor-status-ok")}>
                          {st}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="tdm-successors-empty">{noTasksMessage}</p>
              )}
          </div>
        </div>
    </>
  );
};
