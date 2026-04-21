export type plantillaInsumos = {
    Id?: string;
    Title: string 
    Proceso: string 
    Categoria: string
    OpcionesJson: string;
    PreguntaFlujo: boolean;
}

export type plantillaTareaInsumo = {
    Id?: string;
    Title: string //Id de la tarea definida en la plantilla
    IdInsumo: string 
    TipoInsumo: string
    Proceso: string;
    OrdenPregunta: string;
    Obligatorio: string;

}

export type InsumoProyecto = {
    Id?: string;
    Title: string //IdProyecto
    IdInsumo: string;
    TipoInsumo: string //Archivo - Texto
    CategoriaInsumo: string //Entrada - Salida
    Texto: string;
    NombreInsumo: string;
    insumoId: string
}

export type tareaInsumoProyecto = {
    Id?: string
    Title: string //Id de la tarea creada
    IdInsumoProyecto: string;
    TipoUso: string;
    ProyectoId: string;
}

// models/graph.ts (o donde manejes DriveItem)
export type DriveItem = {
  id: string;
  name: string;
  "@microsoft.graph.downloadUrl"?: string;
};

export type ReglasFlujoTareas = {
    Id?: string;
    Title: string;
    IdTemplateTaskOrigen: string;      
    IdPlantillaInsumo: string;   
    Condicion: string;          
    ValorEsperado: string;       
    TareaSiCumple: string;       
    TareaSiNoCumple: string;     
    Activa: string;
    Prioridad: string;
}