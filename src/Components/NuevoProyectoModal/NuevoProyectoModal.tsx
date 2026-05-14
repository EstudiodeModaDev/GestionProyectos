import React from "react";
import "./NuevoProyectoModal.css";
import {
  useInsumosProyecto,
  usePlantillaInsumos,
  useTareaInsumoProyecto,
  useTareaPlantillaInsumo,
  type TaskInsumoView,
} from "../../Funcionalidades/insumos";
import { useTasks } from "../../Funcionalidades/ProjectTasksHooks/useProjectTasks";
import { useProjects } from "../../Funcionalidades/Projects/useProjects";
import { useTemplateTaks } from "../../Funcionalidades/TemplateTasks/useTemplateTasks";
import { SalidaModal, type SalidaValues } from "../DetallesTarea/UploadInsumos";
import type { InsumoProyecto, plantillaInsumos, plantillaTareaInsumo } from "../../models/Insumos";
import { useRepositories } from "../../repositories/repositoriesContext";
import { useZonas } from "../../Funcionalidades/generalConfigs/zonasConfig/useZonas";
import { useMarcas } from "../../Funcionalidades/generalConfigs/marcasConfig/useMarcas";
import { showError, showWarning } from "../../utils/toast";
import { toSupabaseDate } from "../../utils/Date";
import { NuevoProyectoModalFooter } from "./NuevoProyectoModalFooter";
import { NuevoProyectoModalForm } from "./NuevoProyectoModalForm";
import { NuevoProyectoModalHeader } from "./NuevoProyectoModalHeader";
import type { FaseInsumo, NuevoProyectoModalProps, SalidaItem } from "./NuevoProyectoModal.types";
import { applyProjectAutoFillInsumos } from "./autoFillProjectInsumos";

/**
 * Orquesta la creacion completa de un proyecto, sus tareas e insumos iniciales.
 *
 * @param props - Propiedades del modal de creacion.
 * @returns Formulario de alta de proyecto y, cuando aplica, modal de entrega inicial.
 */
export const NuevoProyectoModal: React.FC<NuevoProyectoModalProps> = ({ open, onClose }) => {
  const repositories = useRepositories();
  const { plantillaInsumos, projectTasks, projectInsumo } = repositories;

  const projectsController = useProjects();
  const templateTasks = useTemplateTaks(repositories.templateTask!);
  const tasksController = useTasks(projectTasks!);
  const { loadTemplateTasks, templateTasks: templateTasksCache } = templateTasks;

  const { insumos: plantillaInsumosCache, loadInsumosPlantilla } = usePlantillaInsumos(plantillaInsumos!);
  const { insumos: plantillaTareaCache, loadTareaInsumosPlantilla } = useTareaPlantillaInsumo();
  const { createAllInsumosFromTemplate, saveInsumoFile } = useInsumosProyecto(projectInsumo!);
  const { createAllInsumosTareaFromTemplate, getInsumosParaSubir } = useTareaInsumoProyecto(repositories.proyectoTareaInsumo!);

  const marcas = useMarcas();
  const zonas = useZonas();

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [toUpload, setToUpload] = React.useState<InsumoProyecto[]>([]);
  const [submittingUploads, setSubmittingUploads] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  const [fechaLanzamiento, setFechaLanzamiento] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    void loadTemplateTasks();
    void marcas.loadMarcasBD();
    void zonas.loadZones();
    void loadInsumosPlantilla("Apertura tienda");
    void loadTareaInsumosPlantilla("Apertura tienda");
  }, [open]);

  const closeAll = React.useCallback(() => {
    setUploadOpen(false);
    setToUpload([]);
    setSubmittingUploads(false);
    setLoading(false);
    setLoadingMessage("");
    setFechaLanzamiento("");
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

    const marca = projectsController.state.id_marca;
    if (!marca) {
      showWarning("No se ha seleccionado marca");
      setLoading(false);
      return;
    }

    try {
      setLoadingMessage("Creando el proyecto...");
      const created = await projectsController.handleSubmit(e);
      if (!created?.id) throw new Error("No se pudo crear el proyecto");

      const projectId = created.id;
      const templateTasksArr = templateTasksCache.length > 0 ? templateTasksCache : await loadTemplateTasks();

      setLoadingMessage("Creando las tareas del proyecto...");
      const createdTasks = await tasksController.createAllFromTemplate(
        templateTasksArr ?? [],
        projectId,
        new Date(created.fecha_inicio),
        marca,
        created.id_zona
      );

      if (!createdTasks.ok) {
        throw new Error("No se pudieron crear las tareas del proyecto");
      }

      setLoadingMessage("Creando los insumos del proyecto...");
      const plantillaInsumosArr =
        plantillaInsumosCache.length > 0 ? plantillaInsumosCache : await loadInsumosPlantilla("Apertura tienda");
      const plantillaTareaArr =
        plantillaTareaCache.length > 0 ? plantillaTareaCache : await loadTareaInsumosPlantilla("Apertura tienda");

      const insumosCreated = await createAllInsumosFromTemplate(e, plantillaInsumosArr, projectId);
      if (!insumosCreated.ok || Object.keys(insumosCreated.data).length === 0) {
        throw new Error("No se pudieron crear los insumos del proyecto");
      }

      setLoadingMessage("Guardando insumos automaticos...");
      await applyProjectAutoFillInsumos({
        insumoMap: insumosCreated.data,
        insumoRepository: projectInsumo!,
        context: {
          fechaLanzamiento,
          marcaId: String(projectsController.state.id_marca ?? "").trim(),
          zonaId: String(projectsController.state.id_zona ?? "").trim(),
          marcas: marcas.marcas,
          zonas: zonas.zones,
        },
      });

      setLoadingMessage("Relacionando las tareas con sus insumos...");
      await createAllInsumosTareaFromTemplate(
        e,
        plantillaTareaArr,
        insumosCreated.data,
        createdTasks.taskMap,
        projectId
      );

      setLoadingMessage("Preparando insumos iniciales...");
      const templateTaskOne = templateTasksArr.find((task) => task.codigo === "T1");
      const projectTaskOneId = templateTaskOne?.id
        ? createdTasks.taskMap[String(templateTaskOne.id)]
        : undefined;

      let insumosParaSubir = projectTaskOneId
        ? await getInsumosParaSubir(projectId, projectTaskOneId, "Entrada" as FaseInsumo)
        : [];

      if (insumosParaSubir.length === 0) {
        const inputTemplateIds = plantillaTareaArr
          .filter((item: plantillaTareaInsumo) => item.id_insumo === "1" && item.tipo_insumo === "Entrada")
          .map((item: plantillaTareaInsumo) => insumosCreated.data[String(item.id_insumo ?? "").trim()])
          .filter(Boolean);

        if (inputTemplateIds.length > 0) {
          insumosParaSubir = await projectInsumo!.listInsumos({ ids: inputTemplateIds });
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
      showError(err?.message ?? "Error creando el proyecto");
    }
  };

  const uploadItems: TaskInsumoView[] = React.useMemo(
    () => {
      const plantillaMap = new Map(
        plantillaInsumosCache
          .filter((item: plantillaInsumos) => item.id)
          .map((item: plantillaInsumos) => [String(item.id), item] as const)
      );

      return toUpload.map((item: InsumoProyecto) => {
        const plantilla = plantillaMap.get(String(item.id_insumo ?? ""));

        return {
          id: String(item.id ?? ""),
          title: String(plantilla?.nombre_insumo ?? `Entregable ${item.id_insumo ?? ""}`),
          tipo: String(plantilla?.categoria ?? "Archivo"),
          texto: String(item.texto ?? ""),
          estado: "Pendiente",
        };
      });
    },
    [plantillaInsumosCache, toUpload]
  );

  /**
   * Sube los insumos iniciales requeridos despues de crear el proyecto.
   *
   * @param values - Valores capturados en el modal de entregables.
   */
  const handleSubmitUploads = async (values: SalidaValues) => {
    if (submittingUploads) return;

    const faltantes = uploadItems.filter((item) => {
      const value = values[item.id];
      return !value || value.kind !== "Archivo" || !value.file;
    });

    if (faltantes.length > 0) {
      showWarning("Debes adjuntar archivo para estos insumos:\n\n" + faltantes.map((item) => `- ${item.title}`).join("\n"));
      return;
    }

    setSubmittingUploads(true);

    try {
      const items = uploadItems
        .map((item) => {
          const value = values[item.id];
          return { s: item, file: value && value.kind === "Archivo" ? value.file : null };
        })
        .filter((item) => !!item.file) as { s: SalidaItem; file: File }[];

      const concurrency = 3;
      const errors: { title: string; message: string }[] = [];

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const results = await Promise.allSettled(batch.map(({ s, file }) => saveInsumoFile(s.id, file)));

        results.forEach((result, idx) => {
          if (result.status === "rejected") {
            const item = batch[idx].s;
            errors.push({
              title: item.title,
              message: (result.reason as any)?.message ?? String(result.reason ?? "Error subiendo archivo"),
            });
          }
        });
      }

      if (errors.length > 0) {
        showError("No se pudieron subir algunos insumos:\n\n" + errors.map((item) => `- ${item.title}: ${item.message}`).join("\n"));
        return;
      }

      closeAll();
    } catch (e: any) {
      console.error(e);
      showError(e?.message ?? "Error guardando insumos");
    } finally {
      setSubmittingUploads(false);
    }
  };

  if (!open) return null;

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

  const isBusy = projectsController.loading || tasksController.loading || loading;

  return (
    <div className="modal">
      <div className="modal__backdrop" />

      <div className="modal__panel" role="dialog" aria-modal="true">
        <NuevoProyectoModalHeader loading={loading} onClose={onClose} />

        <form onSubmit={handleCreate} className="modal__form">
          <NuevoProyectoModalForm
            nombreProyecto={projectsController.state.nombre_proyecto}
            marcaId={projectsController.state.id_marca}
            zonaId={projectsController.state.id_zona}
            fechaInicio={projectsController.state.fecha_inicio}
            fechaLanzamiento={fechaLanzamiento}
            lider={projectsController.state.lider}
            marcas={marcas.marcas}
            zonas={zonas.zones}
            disabled={isBusy}
            onNombreProyectoChange={(value) => projectsController.setField("nombre_proyecto", value)}
            onMarcaChange={(value) => projectsController.setField("id_marca", value)}
            onZonaChange={(value) => projectsController.setField("id_zona", value)}
            onFechaInicioChange={(value) => projectsController.setField("fecha_inicio", value)}
            onFechaLanzamientoChange={(value) => setFechaLanzamiento(toSupabaseDate(new Date(value)))}
          />

          <NuevoProyectoModalFooter
            loading={loading}
            loadingMessage={loadingMessage}
            disabled={isBusy}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  );
};
