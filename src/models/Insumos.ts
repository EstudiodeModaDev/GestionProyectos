export type plantillaInsumos = {
    id?: string;
    nombre_insumo: string 
    proceso: string 
    categoria: string
    is_active: boolean;
    pregunta_flujo: boolean;
    opciones_json: string
}

export type plantillaTareaInsumo = {
    id?: string;
    id_tarea_plantilla: string //Id de la tarea definida en la plantilla
    id_insumo: string 
    tipo_insumo: string
    proceso: string;
}

export type InsumoProyecto = {
    id?: string;
    id_proyecto: string //IdProyecto
    id_insumo: string;
    file_name: string | null
    file_path: string | null
    mime_type: string | null
    texto: string | null
}

export type tareaInsumoProyecto = {
    id?: string
    id_tarea: string //Id de la tarea creada
    proyecto_id: string;
    id_insumo_proyecto: string;
    tipo_uso: string;
}

// models/graph.ts (o donde manejes DriveItem)
export type DriveItem = {
  id: string;
  name: string;
  "@microsoft.graph.downloadUrl"?: string;
};

export type ReglasFlujoTareas = {
    id?: string;
    nombre_regla: string;
    id_template_task_origen: number | null;
    id_plantilla_insumo: number |null;
    condicion: string;
    valor_esperado: string;
    is_active: boolean;
    prioridad: number;
    tarea_si_cumple: number | null;
    tarea_si_no_cumple: number | null;
}
