import React from "react";
import "./NuevoProyectoModal.css";
import { useGraphServices } from "../../graph/graphContext";
import { useInsumosProyecto, usePlantillaInsumos, useTareaInsumoProyecto, useTareaPlantillaInsumo, type TaskInsumoView,} from "../../Funcionalidades/Insumos";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useProjects } from "../../Funcionalidades/Projects/useProjects";
import { useTemplateTaks } from "../../Funcionalidades/TemplateTasks/useTemplateTasks";
import { useMarcas, useZonas } from "../../Funcionalidades/commons/useDesplegables";
import { SalidaModal, type SalidaValues } from "../DetallesTarea/UploadInsumos";

import type { InsumoProyecto } from "../../models/Insumos";

interface NuevoProyectoModalProps {
  open: boolean;
  onClose: () => void;
}

type FaseInsumo = "Entrada" | "Salida" | "Ambas";

type SalidaItem = {
  id: string;
  title: string;
};

/**
 * Orquesta la creacion completa de un proyecto, sus tareas e insumos iniciales.
 *
 * @param props - Propiedades del modal de creacion.
 * @returns Formulario de alta de proyecto y, cuando aplica, modal de entrega inicial.
 */
export const NuevoProyectoModal: React.FC<NuevoProyectoModalProps> = ({ open, onClose }) => {
  const { proyectos, templateTask: aperturaSvc, tasks,  plantillaInsumos, insumoProyecto, plantillaTareaInsumo, tareaInsumoProyecto, marcas, zonas,} = useGraphServices();

  const projectsController = useProjects(proyectos);
  const templateTasks = useTemplateTaks(aperturaSvc);
  const tasksController = useTasks(tasks);
  const { loadTemplateTasks, templateTasks: templateTasksCache } = templateTasks;

  const {insumos: plantillaInsumosCache, loadInsumosPlantilla,} = usePlantillaInsumos(plantillaInsumos);
  const {insumos: plantillaTareaCache, loadTareaInsumosPlantilla } = useTareaPlantillaInsumo(plantillaTareaInsumo);
  const { createAllInsumosFromTemplate, saveInsumoFile } = useInsumosProyecto(insumoProyecto);
  const { createAllInsumosTareaFromTemplate, getInsumosParaSubir } = useTareaInsumoProyecto(tareaInsumoProyecto);

  const { options: marcasOptions, reload: reloadMarcas } = useMarcas(marcas);
  const { options: zonasOptions, reload: reloadZonas } = useZonas(zonas);

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [toUpload, setToUpload] = React.useState<InsumoProyecto[]>([]);
  const [submittingUploads, setSubmittingUploads] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    void loadTemplateTasks();
    void reloadMarcas();
    void reloadZonas();
    void loadInsumosPlantilla("Apertura tienda");
    void loadTareaInsumosPlantilla("Apertura tienda");
  }, [open,]);

  const closeAll = React.useCallback(() => {
    setUploadOpen(false);
    setToUpload([]);
    setSubmittingUploads(false);
    setLoading(false);
    setLoadingMessage("");
    projectsController.resetForm();
    onClose();
  }, [onClose, projectsController]);


  /**
   * Ejecuta el flujo de creacion del proyecto y sus dependencias operativas.
   *
   * @param e - Evento de envio del formulario.
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const marca = projectsController.state.Marca;
    if (!marca) {
      alert("No se ha seleccionado marca");
      setLoading(false);
      return;
    }

    try {
      setLoadingMessage("Creando el proyecto...");
      const created = await projectsController.handleSubmit(e);
      if (!created?.Id) throw new Error("No se pudo crear el proyecto");

      const projectId = created.Id;
      const templateTasksArr = templateTasksCache.length > 0 ? templateTasksCache : await loadTemplateTasks();

      // 1) crear tareas
      setLoadingMessage("Creando las tareas del proyecto...");
      await tasksController.createAllFromTemplate(templateTasksArr ?? [], projectId, new Date(created.FechaInicio), marca, created.Zona);

      // 2) crear insumos del proyecto desde plantilla
      setLoadingMessage("Creando los insumos del proyecto...");
      const plantillaInsumosArr = plantillaInsumosCache.length > 0 ? plantillaInsumosCache : await loadInsumosPlantilla("Apertura tienda");
      const plantillaTareaArr = plantillaTareaCache.length > 0 ? plantillaTareaCache : await loadTareaInsumosPlantilla("Apertura tienda");

      const insumosCreated = await createAllInsumosFromTemplate(e, plantillaInsumosArr, projectId);
      if (!insumosCreated.ok || Object.keys(insumosCreated.data).length === 0) {
        throw new Error("No se pudieron crear los insumos del proyecto");
      }

      // 3) relacionar tarea-insumo
      setLoadingMessage("Relacionando las tareas con sus insumos...");
      await createAllInsumosTareaFromTemplate(e, plantillaTareaArr, insumosCreated.data, projectId);

      setLoadingMessage("Preparando insumos iniciales...");
      let insumosParaSubir = await getInsumosParaSubir(projectId, "T1", "Entrada" as FaseInsumo);

      if (insumosParaSubir.length === 0) {
        const inputTemplateIds = plantillaTareaArr
          .filter((item) => item.Title === "T1" && item.TipoInsumo === "Entrada")
          .map((item) => insumosCreated.data[String(item.IdInsumo ?? "").trim()])
          .filter(Boolean);

        if (inputTemplateIds.length > 0) {
          insumosParaSubir = await insumoProyecto.getByIds(inputTemplateIds);
        }
      }

      if (insumosParaSubir.length > 0) {
        setLoading(false);
        setLoadingMessage("");
        setToUpload(insumosParaSubir);
        setUploadOpen(true);
        return;
      }

      setLoading(false);
      closeAll();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      alert(err?.message ?? "Error creando el proyecto");
    }
  };

  const uploadItems: TaskInsumoView[] = React.useMemo(() => {
    return toUpload.map((i: InsumoProyecto) => ({
      id: String(i.Id),
      title: String(i.NombreInsumo ?? i.Title ?? "Entregable"),
      tipo: i.CategoriaInsumo, 
      texto: String(i.Texto ?? ""),
      estado: "Pendiente",
    }));
  }, [toUpload]);

  
  /**
   * Sube los insumos iniciales requeridos despues de crear el proyecto.
   *
   * @param values - Valores capturados en el modal de entregables.
   */
  const handleSubmitUploads = async (values: SalidaValues) => {
    if (submittingUploads) return;

    // validar requeridos para "Archivo"
    const faltantes = uploadItems.filter((s) => {
      const v = values[s.id];
      return !v || v.kind !== "Archivo" || !v.file;
    });

    if (faltantes.length > 0) {
      alert(
        "Debes adjuntar archivo para estos insumos:\n\n" +
          faltantes.map((f) => `• ${f.title}`).join("\n")
      );
      return;
    }

    setSubmittingUploads(true);

    try {
      const items = uploadItems
        .map((s) => {
          const v = values[s.id];
          return { s, file: v && v.kind === "Archivo" ? v.file : null };
        })
        .filter((x) => !!x.file) as { s: SalidaItem; file: File }[];

      const concurrency = 3;
      const errors: { title: string; message: string }[] = [];

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);

        const results = await Promise.allSettled(
          batch.map(({ s, file }) => saveInsumoFile(s.id, file))
        );

        results.forEach((r, idx) => {
          if (r.status === "rejected") {
            const item = batch[idx].s;
            errors.push({
              title: item.title,
              message: (r.reason as any)?.message ?? String(r.reason ?? "Error subiendo archivo"),
            });
          }
        });
      }

      if (errors.length > 0) {
        alert(
          "No se pudieron subir algunos insumos:\n\n" +
            errors.map((e) => `• ${e.title}: ${e.message}`).join("\n")
        );
        return;
      }

      closeAll();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Error guardando insumos");
    } finally {
      setSubmittingUploads(false);
    }
  };

  if (!open) return null;

  // ✅ Si está en etapa de upload, renderiza el modal de entregables
  if (uploadOpen) {
    return (
      <SalidaModal
        open={uploadOpen}
        salidas={uploadItems}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleSubmitUploads}
        submitting={submittingUploads}
      />
    );
  }

  return (
    <div className="modal">
      <div className="modal__backdrop"/>

      <div className="modal__panel" role="dialog" aria-modal="true">
        {/* Header */}
        <header className="modal__header">
          <div>
            <h2 className="modal__title">Nuevo Proyecto de Apertura</h2>
          </div>
          <button type="button" className="modal__close" aria-label="Cerrar" disabled={loading} onClick={onClose}>
            ×
          </button>
        </header>

        <hr className="modal__divider" />

        {/* Form */}
        <form onSubmit={handleCreate} className="modal__form">
          <div className="field">
            <label className="field__label">Nombre del proyecto</label>
            <input type="text" className="field__input" value={projectsController.state.Title} onChange={(e) => projectsController.setField("Title", e.target.value)} required/>
          </div>

          <div className="field">
            <label className="field__label">Marca del proyecto</label>
            <select name="marcas" className="field__input" value={projectsController.state.Marca} onChange={(e) => projectsController.setField("Marca", e.target.value)}>
              <option value="">Escoger marca...</option>
              {marcasOptions
                .filter((e) => e.isActive)
                .map((opcion) => (
                  <option key={opcion.label} value={opcion.label}>
                    {opcion.label}
                  </option>
                ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label">Zona del proyecto</label>
            <select name="zonas" className="field__input" value={projectsController.state.Zona} onChange={(e) => projectsController.setField("Zona", e.target.value)}>
              <option value="">Escoger zona...</option>
              {zonasOptions
                .filter((e) => e.isActive)
                .map((opcion) => (
                  <option key={opcion.label} value={opcion.label}>
                    {opcion.label}
                  </option>
                ))}
            </select>
          </div>

          <div className="modal__grid">
            <div className="field">
              <label className="field__label">Fecha de Inicio del Proyecto</label>
              <input type="date" className="field__input" value={projectsController.state.FechaInicio} onChange={(e) => projectsController.setField("FechaInicio", e.target.value)} required             />
            </div>

            <div className="field">
              <label className="field__label">Fecha de Lanzamiento (Meta)</label>
              <input type="date" className="field__input" value={projectsController.state.Fechadelanzamiento} onChange={(e) => projectsController.setField("Fechadelanzamiento", e.target.value)} required/>
            </div>
          </div>

          <div className="field">
            <label className="field__label">Líder Asignado</label>
            <input  type="text" className="field__input" value={projectsController.state.Lider} required readOnly/>
          </div>

          {/* Footer botones */
}
          <div className="modal__footer">
            {loading && (
              <div className="modal__loading">
                <div className="modal__spinner"></div>
                <p>{loadingMessage}</p>
              </div>
            )}

            <button type="button" className="btn modal__btn-cancel" onClick={onClose} disabled={projectsController.loading || tasksController.loading || loading}>
              Cancelar
            </button>

            <button type="submit" className="btn btn--primary modal__btn-primary" disabled={projectsController.loading || tasksController.loading || loading}>
              {!(tasksController.loading || projectsController.loading || loading)
                ? "Crear Proyecto"
                : "Creando proyecto, por favor espere..."}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
