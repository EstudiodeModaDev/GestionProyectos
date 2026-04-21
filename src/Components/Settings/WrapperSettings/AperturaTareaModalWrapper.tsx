import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import { TareasPlantillaModal } from "../TasksSettings/TaskSettings";
import type { Plantilla } from "../Settings";
import { InsumosPlantillaModal } from "../InsumosSettigns/InsumosSettigns";
import { usePlantillaInsumos, useTareaPlantillaInsumo } from "../../../Funcionalidades/Insumos";
import { useTemplateTaks } from "../../../Funcionalidades/TemplateTasks/useTemplateTasks";
import { useResponsableReglaTareaDetalleSettings } from "../../../Funcionalidades/taskResponsible/useResponsableReglaTareaDetalleSettings";
import { useResponsableReglaTareaSettings } from "../../../Funcionalidades/taskResponsible/useResponsableReglaTareaSettings";
import { ResponsablesReglaModal } from "../ResponsableSettings/ResponsableReglaModal";
import { useFlowRulesSettings } from "../../../Funcionalidades/Reglas/useFlowRulesSettings";
import { FlowRulesModal } from "../FlowRulesSettings/FlowRulesModal";
import type { plantillaInsumos } from "../../../models/Insumos";

type Props = {
  plantilla: Plantilla;
  openTasks: boolean;
  openInsumos: boolean;
  openResponsables: boolean
  openFlowRules: boolean
  onClose: () => void;
};

/**
 * Conecta los modales de configuracion de la plantilla de apertura con sus hooks.
 *
 * @param props - Estado de apertura de cada modal y plantilla seleccionada.
 * @returns Conjunto de modales especializados para la plantilla de apertura.
 */
export const AperturaTareaModalWrapper: React.FC<Props> = ({openFlowRules, plantilla, openTasks, openInsumos, onClose, openResponsables}) => {
  const graph = useGraphServices();
  const templateTaks = useTemplateTaks(graph.templateTask)
  const { loadInsumosPlantilla, state: statePlantillaInsumos, setField: setFieldPlantillaInsumos, loading: loadingInsumos, handleSubmit: createPlantillaInsumo, handleEdit: editarInsumo, deleteInsumo} = usePlantillaInsumos(graph.plantillaInsumos)
  const { insumos: plantillaTareaInsumos, loadTareaInsumosPlantilla, deleteLink, createLink } = useTareaPlantillaInsumo(graph.plantillaTareaInsumo)
  const loading = templateTaks.loading || loadingInsumos
  const detallesResponsable = useResponsableReglaTareaDetalleSettings()
  const reglasResponsable = useResponsableReglaTareaSettings()
  const flowRules = useFlowRulesSettings()

  const [insumos, setInsumos] = React.useState<plantillaInsumos[] >([])

  React.useEffect(() => {
    

    /**
     * Carga la informacion necesaria segun el modal de configuracion abierto.
     */
    const load = async () => {
      if (openTasks) {
        await templateTaks.loadTemplateTasks();
      }

    if (openInsumos || openTasks) {
      const insumos = await loadInsumosPlantilla("Apertura tienda");
      console.log("INSUMOS REALES:", insumos);

      setInsumos(insumos);

      await loadTareaInsumosPlantilla("Apertura tienda");
    }


      if (openResponsables) {
        await templateTaks.loadTemplateTasks();
        await reglasResponsable.loadReglas();
        await detallesResponsable.loadDetalles();
      }

      if (openFlowRules) {
        await templateTaks.loadTemplateTasks();
        await loadInsumosPlantilla("Apertura tienda");
        await flowRules.loadRules();
      }
    };

    void load();
  }, [openTasks, openInsumos, openResponsables, openFlowRules]);

  return (
    <>
      <TareasPlantillaModal 
        open={openTasks} 
        plantilla={plantilla} 
        tareas={templateTaks.templateTasks} 
        loading={templateTaks.loading} 
        onClose={onClose} 
        onGuardarTarea={templateTaks.createTemplateTask} 
        state={templateTaks.state} 
        setField={templateTaks.setField} 
        onEditTask={templateTaks.editTemplateTask} 
        onEliminarTarea={templateTaks.deleteTemplateTask} 
        insumos={insumos} 
        links={plantillaTareaInsumos} 
        onAddLink={createLink} 
        onDeleteLink={deleteLink} 
        proceso={"Apertura tienda"} 
        setState={templateTaks.setState} 
        cleanState={templateTaks.cleanForm}/>
        
      <InsumosPlantillaModal 
        open={openInsumos} 
        plantilla={plantilla} 
        insumos={insumos} 
        loading={loading} 
        onClose={onClose} 
        state={statePlantillaInsumos} 
        setField={setFieldPlantillaInsumos} 
        onCrearInsumo={createPlantillaInsumo} 
        onEditarInsumo={editarInsumo} 
        onEliminarInsumo={deleteInsumo} 
        accion={"Apertura tienda"}/>

      <ResponsablesReglaModal 
        open={openResponsables} 
        tareas={templateTaks.templateTasks} 
        reglas={reglasResponsable.reglas} 
        detalles={detallesResponsable.detalles} 
        onClose={onClose} 
        onCreateRegla={reglasResponsable.createRegla} 
        onEditRegla={reglasResponsable.editRegla} 
        onDeleteRegla={reglasResponsable.deleteRegla} 
        onCreateDetalle={detallesResponsable.createDetalle} 
        onDeleteDetalle={detallesResponsable.deleteDetalle} />

      <FlowRulesModal
        open={openFlowRules}
        proceso={"Apertura tienda"}
        tareas={templateTaks.templateTasks}
        insumos={insumos}
        reglas={flowRules.reglas}
        loading={flowRules.loading}
        onClose={onClose}
        onCreateRule={flowRules.createRule}
        onEditRule={flowRules.editRule}
        onDeleteRule={flowRules.deleteRule}
      />
    </>
  );
};
