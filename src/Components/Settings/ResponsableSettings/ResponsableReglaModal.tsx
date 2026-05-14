import * as React from "react";
import type { TemplateTasks } from "../../../models/AperturaTienda";
import type { responsableReglaTarea, responsableReglaTareaDetalle } from "../../../models/responsables";
import type { filterResponsibleDetail } from "../../../repositories/ResponsibleDetailReposiitory/responsibleDetailRespository";
import type { filterTemplateTaskResponsible } from "../../../repositories/TemplateTaskResponsibleRepository/templateTaskResponsibleRepository";
import "../Settings.css";
import "./css.css";
import { ConfirmActionModal } from "../../confirmationModal/ConfirmActionModal";
import { DetailResponsableRegla } from "./DetailResponsableRegla";
import { ResponsableReglaPreview } from "./ResponsableReglaPreview";
import { ResponsableReglaRuleStream } from "./ResponsableReglaRuleStream";
import { ResponsableReglaTaskSidebar } from "./ResponsableReglaTaskSidebar";

type Props = {
  open: boolean;
  tareas: TemplateTasks[];
  reglas: responsableReglaTarea[];
  detalles: responsableReglaTareaDetalle[];
  loading?: boolean;
  loadingReglas?: boolean;
  loadingDetalles?: boolean;
  onClose: () => void;
  onLoadReglas: (filter?: filterTemplateTaskResponsible) => Promise<responsableReglaTarea[] | undefined>;
  onLoadDetalles: (filter?: filterResponsibleDetail) => Promise<responsableReglaTareaDetalle[] | undefined>;
  onCreateRegla: (payload: responsableReglaTarea) => Promise<responsableReglaTarea | null> | void;
  onEditRegla: (id: string, payload: responsableReglaTarea) => Promise<responsableReglaTarea | null>;
  onDeleteRegla: (id: number) => Promise<void> | void;
  onCreateDetalle: (reglaId: string, payload: responsableReglaTareaDetalle) => Promise<responsableReglaTareaDetalle>;
  onDeleteDetalle: (detalleId: string) => Promise<void> | void;
};

/**
 * Lista las reglas de asignacion de responsables y permite administrarlas.
 *
 * @param props - Catalogos, reglas cargadas y callbacks CRUD.
 * @returns Modal principal de configuracion de responsables por tarea.
 */
export function ResponsablesReglaModal({
  open,
  tareas,
  reglas,
  detalles,
  loading = false,
  loadingReglas = false,
  loadingDetalles = false,
  onClose,
  onLoadReglas,
  onLoadDetalles,
  onCreateRegla,
  onEditRegla,
  onDeleteRegla,
  onCreateDetalle,
  onDeleteDetalle,
}: Props) {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<responsableReglaTarea | null>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(null);
  const [focusedRuleId, setFocusedRuleId] = React.useState<string | null>(null);
  const [ruleToDelete, setRuleToDelete] = React.useState<responsableReglaTarea | null>(null);

  const selectedTask = React.useMemo(
    () => tareas.find((tarea) => Number(tarea.id ?? 0) === selectedTaskId) ?? null,
    [selectedTaskId, tareas]
  );

  const focusedRule = React.useMemo(
    () => reglas.find((item) => item.id === focusedRuleId) ?? reglas[0] ?? null,
    [focusedRuleId, reglas]
  );

  const refreshTaskRules = React.useCallback(
    async (taskId?: number | null) => {
      if (!taskId) {
        return [];
      }

      return (await onLoadReglas({ template_task_id: taskId })) ?? [];
    },
    [onLoadReglas]
  );

  const refreshRuleDetails = React.useCallback(
    async (regla?: responsableReglaTarea | null) => {
      if (!regla?.id) {
        await onLoadDetalles(undefined);
        return [];
      }

      return (await onLoadDetalles({
        reglaId: Number(regla.id),
        id_marca: regla.id_marca,
        id_zona: regla.id_zona,
      })) ?? [];
    },
    [onLoadDetalles]
  );

  React.useEffect(() => {
    if (!open) {
      setDetailOpen(false);
      setSelected(null);
      setSelectedTaskId(null);
      setFocusedRuleId(null);
      return;
    }

    if (tareas.length > 0) {
      setSelectedTaskId((current) => current ?? Number(tareas[0].id ?? 0));
    }
  }, [open, tareas]);

  React.useEffect(() => {
    if (!open || !selectedTaskId) {
      return;
    }

    setSelected(null);
    setFocusedRuleId(null);
    void refreshTaskRules(selectedTaskId);
    void refreshRuleDetails(null);
  }, [open, refreshRuleDetails, refreshTaskRules, selectedTaskId]);

  React.useEffect(() => {
    if (!reglas.length) {
      setFocusedRuleId(null);
      return;
    }

    setFocusedRuleId((current) => {
      const exists = reglas.some((item) => item.id === current);
      return exists ? current : reglas[0].id ?? null;
    });
  }, [reglas]);

  React.useEffect(() => {
    if (!open || !focusedRule) {
      return;
    }

    void refreshRuleDetails(focusedRule);
  }, [focusedRule, open, refreshRuleDetails]);

  if (!open) return null;

  /**
   * Abre el detalle en modo creacion.
   */
  const handleCreate = () => {
    setSelected(selectedTaskId ? { template_task_id: selectedTaskId, id_marca: null, id_zona: null } : null);
    setDetailOpen(true);
  };

  const handleOpenTask = (taskId: number) => {
    setSelectedTaskId(taskId);
  };

  const handleFocusRule = (regla: responsableReglaTarea) => {
    setFocusedRuleId(regla.id ?? null);
  };

  const handleOpenRule = (regla: responsableReglaTarea) => {
    setSelected(regla);
    setDetailOpen(true);
  };

  /**
   * Confirma y elimina una regla de responsables.
   *
   * @param regla - Regla a eliminar.
   */
  const handleDelete = async (regla: responsableReglaTarea) => {
    if (!regla.id) return;
    setRuleToDelete(regla);
  };

  const handleCreateRegla = async (payload: responsableReglaTarea) => {
    const created = (await onCreateRegla(payload)) ?? null;
    const nextTaskId = Number(created?.template_task_id ?? payload.template_task_id ?? selectedTaskId ?? 0);

    if (nextTaskId) {
      setSelectedTaskId(nextTaskId);
      await refreshTaskRules(nextTaskId);
    }

    if (created?.id) {
      setFocusedRuleId(created.id);
      await refreshRuleDetails(created);
    }

    return created;
  };

  const handleEditRegla = async (id: string, payload: responsableReglaTarea) => {
    const updated = await onEditRegla(id, payload);
    const nextTaskId = Number(updated?.template_task_id ?? payload.template_task_id ?? selectedTaskId ?? 0);

    if (nextTaskId) {
      setSelectedTaskId(nextTaskId);
      await refreshTaskRules(nextTaskId);
    }

    const nextRuleId = updated?.id ?? id;
    setFocusedRuleId(nextRuleId);
    await refreshRuleDetails(updated ?? { ...payload, id: nextRuleId });
    return updated;
  };

  const handleCreateDetalle = async (reglaId: string, payload: responsableReglaTareaDetalle) => {
    const created = await onCreateDetalle(reglaId, payload);
    await refreshRuleDetails(selected?.id === reglaId ? selected : focusedRule);
    return created;
  };

  const handleDeleteDetalle = async (detalleId: string) => {
    await onDeleteDetalle(detalleId);
    await refreshRuleDetails(selected ?? focusedRule);
  };

  return (
    <>
      <div className="tp-modal__overlay" onClick={onClose} />
      <div className="tp-modal tp-modal--xl tp-resp-modal" role="dialog" aria-modal="true" aria-label="Configuracion de encargados">

        <div className="tp-modal__body tp-resp-modal__body">
          {loading ? (
            <div className="tp-empty tp-resp-empty">Cargando reglas...</div>
          ) : tareas.length === 0 ? (
            <div className="tp-empty tp-resp-empty">No hay tareas disponibles para configurar encargados.</div>
          ) : (
            <div className="tp-resp-shell">
              <ResponsableReglaTaskSidebar
                selectedTaskId={selectedTaskId}
                tareas={tareas}
                onSelectTask={handleOpenTask}
              />

              <section className="tp-resp-stage">
                <div className="tp-resp-stage__header">
                  <div>
                    <span className="tp-resp-stage__eyebrow">Tarea seleccionada</span>
                    <h4 className="tp-section__title">
                      {selectedTask ? `${selectedTask.codigo} - ${selectedTask.nombre_tarea}` : "Selecciona una tarea"}
                    </h4>
                    <p className="tp-modal__subtitle">
                      {selectedTask
                        ? "Cada seleccion consulta la base de datos para mostrar sus reglas y encargados vigentes."
                        : "Selecciona una tarea del panel izquierdo para continuar."}
                    </p>
                  </div>

                  {selectedTask ? (
                    <button className="pl-btn pl-btn--primary" type="button" onClick={handleCreate}>
                      Nueva regla
                    </button>
                  ) : null}
                </div>

                {!selectedTask ? (
                  <div className="tp-empty tp-resp-empty">Selecciona una tarea para ver sus reglas.</div>
                ) : (
                  <div className="tp-resp-stage__body">
                    <ResponsableReglaRuleStream
                      selectedTaskRules={reglas}
                      focusedRuleId={focusedRule?.id ?? null}
                      loading={loadingReglas}
                      onFocusRule={handleFocusRule}
                    />

                    <ResponsableReglaPreview
                      focusedRule={focusedRule}
                      focusedRuleDetails={focusedRule ? detalles : []}
                      loading={loadingDetalles}
                      onOpenRule={handleOpenRule}
                      onDeleteRule={handleDelete}
                    />
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      <DetailResponsableRegla
        open={detailOpen}
        tareas={tareas}
        detalles={selected?.id && focusedRule?.id === selected.id ? detalles : []}
        regla={selected}
        onClose={() => setDetailOpen(false)}
        onCreateRegla={handleCreateRegla}
        onEditRegla={handleEditRegla}
        onCreateDetalle={handleCreateDetalle}
        onDeleteDetalle={handleDeleteDetalle}
      />

      <ConfirmActionModal
        open={Boolean(ruleToDelete)}
        text={ruleToDelete
          ? `Seguro que deseas eliminar la regla de la tarea ${tareas.find((t) => Number(t.id ?? 0) === Number(ruleToDelete.template_task_id ?? 0))?.nombre_tarea ?? String(ruleToDelete.template_task_id ?? "")}?`
          : ""}
        onCancel={() => setRuleToDelete(null)}
        onConfirm={async () => {
          if (!ruleToDelete?.id) return;
          await onDeleteRegla(Number(ruleToDelete.id));
          await refreshTaskRules(ruleToDelete.template_task_id);
          await refreshRuleDetails(null);
          setRuleToDelete(null);
        }}
      />
    </>
  );
}
