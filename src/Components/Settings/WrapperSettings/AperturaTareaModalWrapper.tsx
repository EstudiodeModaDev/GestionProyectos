import * as React from "react";
import { TareasPlantillaModal } from "../TasksSettings/TaskSettings";
import type { Plantilla } from "../Settings";
import { InsumosPlantillaModal } from "../InsumosSettigns/InsumosSettigns";
import { usePlantillaInsumos, useTareaPlantillaInsumo } from "../../../Funcionalidades/insumos";
import { useTemplateTaks } from "../../../Funcionalidades/TemplateTasks/useTemplateTasks";
import { useResponsableReglaTareaDetalleSettings } from "../../../Funcionalidades/taskResponsible/useResponsableReglaTareaDetalleSettings";
import { useResponsableReglaTareaSettings } from "../../../Funcionalidades/taskResponsible/useResponsableReglaTareaSettings";
import { useFlowRulesSettings } from "../../../Funcionalidades/Reglas/useFlowRulesSettings";
import { FlowRulesModal } from "../FlowRulesSettings/FlowRulesModal";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { ResponsablesReglaModal } from "../ResponsableSettings/ResponsableReglaModal";

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
  const detallesResponsable = useResponsableReglaTareaDetalleSettings()
  const reglasResponsable = useResponsableReglaTareaSettings()
  const flowRules = useFlowRulesSettings()
  const repositories = useRepositories()

  const templateInsumos = usePlantillaInsumos(repositories.plantillaInsumos!)  
  const templateTaks = useTemplateTaks(repositories.templateTask!)
  const { insumos: plantillaTareaInsumos, loadTareaInsumosPlantilla, deleteLink, handleSubmit } = useTareaPlantillaInsumo()
  const loading = templateTaks.loading || templateInsumos.loading

  React.useEffect(() => {
    

    /**
     * Carga la informacion necesaria segun el modal de configuracion abierto.
     */
    const load = async () => {
      if (openTasks) {
        await templateTaks.loadTemplateTasks();
      }

    if (openInsumos || openTasks) {
      await templateInsumos.loadInsumosPlantilla("Apertura tienda");

      const prueba = await loadTareaInsumosPlantilla("Apertura tienda");
      console.log(prueba)
    }


      if (openResponsables) {
        await templateTaks.loadTemplateTasks();
      }

      if (openFlowRules) {
        await templateTaks.loadTemplateTasks();
        await templateInsumos.loadInsumosPlantilla("Apertura tienda");
        await flowRules.loadRules(); 
      }
    };

    void load();
  }, [openTasks, openInsumos, openResponsables, openFlowRules,]);

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
        insumos={templateInsumos.insumos} 
        links={plantillaTareaInsumos} 
        onAddLink={handleSubmit} 
        onDeleteLink={deleteLink} 
        proceso={"Apertura tienda"} 
        setState={templateTaks.setState} 
        cleanState={templateTaks.cleanForm}/>
        
      <InsumosPlantillaModal 
        open={openInsumos} 
        plantilla={plantilla} 
        insumos={templateInsumos.insumos} 
        loading={loading} 
        onClose={onClose} 
        state={templateInsumos.state} 
        setField={templateInsumos.setField} 
        onCrearInsumo={templateInsumos.handleSubmit} 
        onEditarInsumo={templateInsumos.handleEdit} 
        onEliminarInsumo={templateInsumos.deleteInsumo} 
        accion={"Apertura tienda"}/>

      <ResponsablesReglaModal 
        open={openResponsables} 
        tareas={templateTaks.templateTasks} 
        reglas={reglasResponsable.reglas} 
        detalles={detallesResponsable.detalles} 
        loading={templateTaks.loading}
        loadingReglas={reglasResponsable.loading}
        loadingDetalles={detallesResponsable.loading}
        onClose={onClose} 
        onLoadReglas={reglasResponsable.loadReglas}
        onLoadDetalles={detallesResponsable.loadDetalles}
        onCreateRegla={reglasResponsable.createRegla} 
        onEditRegla={reglasResponsable.editRegla} 
        onDeleteRegla={reglasResponsable.deleteRegla} 
        onCreateDetalle={detallesResponsable.createDetalle} 
        onDeleteDetalle={detallesResponsable.deleteDetalle} />

      <FlowRulesModal
        open={openFlowRules}
        proceso={"Apertura tienda"}
        tareas={templateTaks.templateTasks}
        insumos={templateInsumos.insumos}
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
