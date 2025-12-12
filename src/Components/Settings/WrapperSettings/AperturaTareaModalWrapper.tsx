import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import { useAperturaTiendaPlantilla } from "../../../Funcionalidades/AperturaTienda";
import { TareasPlantillaModal } from "../TasksSettings/TaskSettings";
import type { Plantilla } from "../Settings";
import { InsumosPlantillaModal } from "../InsumosSettigns/InsumosSettigns";
import { usePlantillaInsumos, useTareaPlantillaInsumo } from "../../../Funcionalidades/Insumos";

type Props = {
  plantilla: Plantilla;
  openTasks: boolean;
  openInsumos: boolean;
  onClose: () => void;
};

export const AperturaTareaModalWrapper: React.FC<Props> = ({ plantilla, openTasks, openInsumos, onClose,}) => {
    const { apertura, plantillaInsumos, plantillaTareaInsumo } = useGraphServices();
    const { rows, loading: loadingApertura, loadTasks, handleSubmit, state, setField, handleEdit, handleDelete} = useAperturaTiendaPlantilla(apertura);
    const { insumos, loadInsumosPlantilla, state: statePlantillaInsumos, setField: setFieldPlantillaInsumos, loading: loadingInsumos, handleSubmit: createPlantillaInsumo, handleEdit: editarInsumo, deleteInsumo} = usePlantillaInsumos(plantillaInsumos)
    const { insumos: plantillaTareaInsumos, loadTareaInsumosPlantilla, deleteLink, createLink } = useTareaPlantillaInsumo(plantillaTareaInsumo)
    const loading = loadingApertura || loadingInsumos

    React.useEffect(() => {
        if (openTasks || openInsumos) {
            loadTasks();
            loadInsumosPlantilla("Apertura tienda")
            loadTareaInsumosPlantilla("Apertura tienda")
        }
    }, [openTasks, loadTasks]);

  return (
    <>
        <TareasPlantillaModal open={openTasks} plantilla={plantilla} tareas={rows} loading={loading} onClose={onClose} onGuardarTarea={handleSubmit} state={state} setField={setField} onEditTask={handleEdit} onEliminarTarea={handleDelete} insumos={insumos} links={plantillaTareaInsumos} onAddLink={createLink} onDeleteLink={deleteLink} proceso={"Apertura tienda"}/>
        <InsumosPlantillaModal open={openInsumos} plantilla={plantilla} insumos={insumos} loading={loading} onClose={onClose} state={statePlantillaInsumos} setField={setFieldPlantillaInsumos} onCrearInsumo={createPlantillaInsumo} onEditarInsumo={editarInsumo} onEliminarInsumo={deleteInsumo} accion={"Apertura tienda"}/>
    </>
  );
};
