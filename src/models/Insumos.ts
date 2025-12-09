export type plantillaInsumos = {
    Id?: string;
    Title: string //Nombre del insumo
    Proceso: string //Plantilla a la que pertenece
    Categoria: string
}

export type plantillaTareaInsumo = {
    Id?: string;
    Title: string //Id de la tarea definida en la plantilla
    IdInsumo: string 
    TipoInsumo: string
    Proceso: string
}

export type InsumoProyecto = {
    Id?: string;
    Title: string //IdProyecto
    IdInsumo: string;
    TipoInsumo: string //Archivo - Texto
    CategoriaInsumo: string //Entrada - Salida
    Texto: string;
}

export type tareaInsumoProyecto = {
    Id?: string
    Title: string //Id de la tarea creada
    IdInsumoProyecto: string;
    TipoUso: string;
}