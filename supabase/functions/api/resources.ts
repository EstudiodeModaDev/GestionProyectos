import type { CrudConfig } from "./types.ts";

function normalizeNullableDate(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === "null") return null;
  return normalized;
}

export const SETTINGS_RESOURCES: Record<string, CrudConfig> = {
  insumos: {
    table: "insumos_plantilla",
    idColumn: "id",
    defaultOrderBy: { column: "nombre_insumo", ascending: true },
    buildListQuery: (query, payload) => {
      const proceso = String(payload.proceso ?? "").trim();
      if (!proceso) {
        throw new Error("El payload requiere 'proceso'.");
      }

      return query.eq("proceso", proceso);
    },
    buildCreate: (payload) => {
      const data = {
        nombre_insumo: String(payload.nombre_insumo ?? "").trim(),
        proceso: String(payload.proceso ?? "").trim(),
        categoria: String(payload.categoria ?? "").trim(),
        is_active: Boolean(payload.is_active ?? true),
        pregunta_flujo: Boolean(payload.pregunta_flujo ?? false),
        opciones_json: String(payload.opciones_json ?? "[]"),
      };

      if (!data.nombre_insumo || !data.proceso || !data.categoria) {
        throw new Error("Nombre, Proceso y Categoria son obligatorios.");
      }

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};

      if (payload.nombre_insumo !== undefined) patch.nombre_insumo = String(payload.nombre_insumo ?? "").trim();
      if (payload.proceso !== undefined) patch.proceso = String(payload.proceso ?? "").trim();
      if (payload.categoria !== undefined) patch.categoria = String(payload.categoria ?? "").trim();
      if (payload.is_active !== undefined) patch.is_active = Boolean(payload.is_active);
      if (payload.pregunta_flujo !== undefined) patch.pregunta_flujo = Boolean(payload.pregunta_flujo);
      if (payload.opciones_json !== undefined) patch.opciones_json = String(payload.opciones_json ?? "[]");

      return patch;
    },
  },
  templateTasks: {
    table: "tareas_plantilla",
    idColumn: "id",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query,) => {

      return query
    },
    buildCreate: (payload) => {
      const data = {
        codigo: String(payload.codigo ?? "").trim(),
        nombre_tarea: String(payload.nombre_tarea ?? "").trim(),
        area_responsable: String(payload.area_responsable ?? "").trim(),
        fase: String(payload.fase ?? "").trim(),
        tipo_tarea: String(payload.tipo_tarea ?? "").trim(),
        dias_para_resolver: Number(payload.dias_para_resolver ?? 0),
        dependencia: Number(payload.dependencia) ?? null ,
        dias_habiles: Boolean(payload.dias_habiles ?? true),
      };

      if (!data.codigo || !data.nombre_tarea || !data.dias_para_resolver) {
        throw new Error("Codigo, Titulo y dias para resolver son obligatorios.");
      }

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};

      if (payload.codigo !== undefined) patch.codigo = String(payload.codigo ?? "").trim();
      if (payload.nombre_tarea !== undefined) patch.nombre_tarea = String(payload.nombre_tarea ?? "").trim();
      if (payload.area_responsable !== undefined) patch.area_responsable = String(payload.area_responsable ?? "").trim();
      if (payload.fase !== undefined) patch.fase = String(payload.fase ?? "").trim();
      if (payload.tipo_tarea !== undefined) patch.tipo_tarea = String(payload.tipo_tarea ?? "").trim();
      if (payload.dias_para_resolver !== undefined) patch.dias_para_resolver = Number(payload.dias_para_resolver ?? 0);
      if (payload.dependencia !== undefined) patch.dependencia = Number(payload.dependencia) ?? null;
      if (payload.dias_habiles !== undefined) patch.dias_habiles = Boolean(payload.dias_habiles);

      return patch;
    },
  },
  zonas: {
    buildCreate: (payload) => {
      const data = {
        zonas: String(payload.zonas ?? "").trim(),
        IsActive: true
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};

      if (payload.nombre !== undefined) patch.zonas = String(payload.nombre ?? "").trim();
      if (payload.isActive !== undefined) patch.isActive = Boolean(payload.isActive);

      return patch;
    },
    idColumn: "id",
    table: "zonas",
    defaultOrderBy: { column: "zonas", ascending: true },
    buildListQuery: (query) => query
  },
  marcas: {
    buildCreate: (payload) => {
      const data = {
        nombre_marca: String(payload.nombre_marca ?? "").trim(),
        isActive: true
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};

      if (payload.nombre_marca !== undefined) patch.nombre_marca = String(payload.nombre_marca ?? "").trim();
      if (payload.isActive !== undefined) patch.isActive = Boolean(payload.isActive);

      return patch;
    },
    idColumn: "id",
    table: "marcas",
    defaultOrderBy: { column: "nombre_marca", ascending: true },
    buildListQuery: (query) => query
  },
  areas: {
    buildCreate: (payload) => {
      const data = {
        nombre_area: String(payload.nombre_area ?? "").trim(),
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};

      if (payload.nombre_area !== undefined) patch.nombre_area = String(payload.nombre_area ?? "").trim();

      return patch;
    },
    idColumn: "id",
    table: "areas_responsables",
    defaultOrderBy: { column: "nombre_area", ascending: true },
    buildListQuery: (query) => query
  },
  flowRule: {
    buildCreate: (payload) => {
      const data = {
        nombre_regla: String(payload.nombre_regla ?? "").trim(),
        id_template_task_origen: Number(payload.id_template_task_origen ?? null),
        id_plantilla_insumo: Number(payload.id_plantilla_insumo ?? null),
        condicion: String(payload.condicion ?? "").trim(),
        valor_esperado: String(payload.valor_esperado ?? "").trim(),
        is_active: Boolean(payload.isActive ?? true),
        prioridad: Number(payload.prioridad ?? 0),
        tarea_si_cumple: Number(payload.tarea_si_cumple ?? null),
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
      

      if (payload.nombre_regla !== undefined) patch.nombre_regla = String(payload.nombre_regla ?? "").trim();
      if (payload.id_template_task_origen !== undefined) patch.id_template_task_origen = Number(payload.id_template_task_origen ?? null);
      if (payload.id_plantilla_insumo !== undefined) patch.id_plantilla_insumo = Number(payload.id_plantilla_insumo ?? null);
      if (payload.condicion !== undefined) patch.condicion = String(payload.condicion ?? "").trim();
      if (payload.valor_esperado !== undefined) patch.valor_esperado = String(payload.valor_esperado ?? "").trim();
      if (payload.is_active !== undefined) patch.is_active = Boolean(payload.is_active ?? true);
      if (payload.prioridad !== undefined) patch.prioridad = Number(payload.prioridad ?? 0);
      if (payload.tarea_si_cumple !== undefined) patch.tarea_si_cumple = Number(payload.tarea_si_cumple ?? null);
      if (payload.tarea_si_no_cumple !== undefined) patch.tarea_si_no_cumple = Number(payload.tarea_si_no_cumple ?? null);

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "flujos_si_no",
    defaultOrderBy: { column: "nombre_regla", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.id_template_task_origen !== undefined) {
        query = query.eq("id_template_task_origen", Number(payload.id_template_task_origen));
      }

      if (payload.id_template_task_destino !== undefined) {
        query = query.eq("id_template_task_destino", Number(payload.id_template_task_destino));
      }

      if (payload.is_active !== undefined) {
        query = query.eq("is_active", Boolean(payload.is_active));
      }

      return query;
    }

  },
  templateResponsible: {
    buildCreate: (payload) => {
      const data = {
        template_task_id: Number(payload.template_task_id) ?? null,
        id_marca: Number(payload.id_marca ) ?? null,
        id_zona: Number(payload.id_zona) ?? null,
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.template_task_id !== undefined) patch.template_task_id = Number(payload.template_task_id) ?? null;
      if (payload.id_marca !== undefined) patch.id_marca = Number(payload.id_marca) ?? null;
      if (payload.id_zona !== undefined) patch.id_zona = Number(payload.id_zona) ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "responsable_regla_tarea",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.template_task_id !== undefined) {
        query = query.eq("template_task_id", Number(payload.template_task_id));
      }

      if (payload.id_marca !== undefined) {
        query = query.eq("id_marca", Number(payload.id_marca));
      }

      return query;
    }

  },
  ResponsibleDetail: {
    buildCreate: (payload) => {
      const data = {
        regla_id: Number(payload.regla_id) ?? null,
        nombre: String(payload.nombre ).trim() ?? null,
        correo: String(payload.correo).trim().toLocaleLowerCase() ?? null, 
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.regla_id !== undefined) patch.regla_id = Number(payload.regla_id) ?? null;
      if (payload.nombre !== undefined) patch.nombre = String(payload.nombre) ?? null;
      if (payload.correo !== undefined) patch.correo = String(payload.correo) ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "responsable_regla_tarea_detalle",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.regla_id !== undefined) {
        query = query.eq("regla_id", Number(payload.regla_id));
      }

      return query;
    }

  },
  jefeZona: {
    buildCreate: (payload) => {
      const data = {
        id_marca: Number(payload.id_marca) ?? null,
        id_zona: Number(payload.id_zona) ?? null,
        jefe_nombre: String(payload.jefe_nombre ).trim() ?? null,
        jefe_correo: String(payload.correo).trim().toLocaleLowerCase() ?? null, 
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.id_marca !== undefined) patch.id_marca = Number(payload.id_marca) ?? null;
      if (payload.id_zona !== undefined) patch.id_zona = Number(payload.id_zona) ?? null;
      if (payload.jefe_nombre !== undefined) patch.jefe_nombre = String(payload.jefe_nombre).trim() ?? null;
      if (payload.jefe_correo !== undefined) patch.jefe_correo = String(payload.jefe_correo).trim().toLocaleLowerCase() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "jefe_zona",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.id_marca !== undefined) {
        query = query.eq("id_marca", Number(payload.id_marca));
      }

      if (payload.id_zona !== undefined) {
        query = query.eq("id_zona", Number(payload.id_zona));
      }

      return query;
    }

  },
  TemplateTaskInsumos: {
    buildCreate: (payload) => {
      const data = {
        id_insumo: Number(payload.id_insumo) ?? null,
        id_tarea_plantilla: Number(payload.id_tarea_plantilla) ?? null,
        tipo_insumo: String(payload.tipo_insumo ).trim() ?? null,
        proceso: String(payload.proceso).trim() ?? null, 
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.id_insumo !== undefined) patch.id_insumo = Number(payload.id_insumo) ?? null;
      if (payload.id_tarea_plantilla !== undefined) patch.id_tarea_plantilla = Number(payload.id_tarea_plantilla) ?? null;
      if (payload.tipo_insumo !== undefined) patch.tipo_insumo = String(payload.tipo_insumo).trim() ?? null;
      if (payload.proceso !== undefined) patch.proceso = String(payload.proceso).trim() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "insumo_tarea_plantilla",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.id_insumo !== undefined) {
        query = query.eq("id_insumo", Number(payload.id_insumo));
      }

      if (payload.id_tarea_plantilla !== undefined) {
        query = query.eq("id_tarea_plantilla", Number(payload.id_tarea_plantilla));
      }

      if (payload.proceso !== undefined) {
        query = query.eq("proceso", String(payload.proceso).trim());
      }

      return query;
    }

  },
  projects:{
    buildCreate: (payload) => {
      const data = {
        nombre_proyecto: String(payload.nombre_proyecto) ?? null,
        id_marca: Number(payload.id_marca) ?? null,
        id_zona: Number(payload.id_zona) ?? null,
        progreso: String(payload.progreso ).trim() ?? null,
        estado: String(payload.estado ).trim() ?? null,
        lider: String(payload.lider).trim() ?? null,
        correo_lider: String(payload.correo_lider).trim() ?? null,
        fecha_inicio: payload.fecha_inicio
  
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.nombre_proyecto !== undefined) patch.nombre_proyecto = String(payload.nombre_proyecto).trim() ?? null;
      if (payload.estado !== undefined) patch.estado = String(payload.estado).trim() ?? null;
      if (payload.progreso !== undefined) patch.progreso = String(payload.progreso).trim() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "proyectos",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.id_marca !== undefined) {
        query = query.eq("id_insumo", Number(payload.id_insumo));
      }

      if (payload.id_zona !== undefined) {
        query = query.eq("id_tarea_plantilla", Number(payload.id_tarea_plantilla));
      }

      if (payload.proceso !== undefined) {
        query = query.eq("proceso", Number(payload.proceso));
      }

      if (payload.id !== undefined) {
        query = query.eq("id", Number(payload.id));
      }

      return query;
    }

  },
  projectTasks: {
    buildCreate: (payload) => {
      const data = {
        id_tarea_plantilla: Number(payload.id_tarea_plantilla) ?? null,
        id_proyecto: Number(payload.id_proyecto) ?? null,
        estado: String(payload.estado ?? "").trim() ?? null,
        fecha_cierre: normalizeNullableDate(payload.fecha_cierre),
        fecha_resolucion: normalizeNullableDate(payload.fecha_resolucion),
        razon_devolucion: String(payload.razon_devolucion).trim() ?? null,
        razon_bloqueo: String(payload.razon_bloqueo ?? "").trim() ?? null,
        fecha_inicio: normalizeNullableDate(payload.fecha_inicio),
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.fecha_resolucion !== undefined) patch.fecha_resolucion = normalizeNullableDate(payload.fecha_resolucion);
      if (payload.estado !== undefined) patch.estado = String(payload.estado).trim() ?? null;
      if (payload.fecha_cierre !== undefined) patch.fecha_cierre = normalizeNullableDate(payload.fecha_cierre);
      if (payload.fecha_inicio !== undefined) patch.fecha_inicio = normalizeNullableDate(payload.fecha_inicio);
      if (payload.razon_devolucion !== undefined) patch.razon_devolucion = String(payload.razon_devolucion).trim() ?? null;
      if (payload.razon_bloqueo !== undefined) patch.razon_bloqueo = String(payload.razon_bloqueo).trim() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "tareas_proyecto",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (payload.id_tarea_plantilla !== undefined) {
        query = query.eq("id_tarea_plantilla", Number(payload.id_tarea_plantilla));
      }

      if (payload.id_proyecto !== undefined) {
        query = query.eq("id_proyecto", Number(payload.id_proyecto));
      }

      if (payload.estado !== undefined) {
        query = query.eq("estado", String(payload.estado));
      }

      return query;
    }

  },
  projectTaskResponsible: {
    buildCreate: (payload) => {
      const data = {
        tarea_id: Number(payload.tarea_id) ?? null,
        nombre: String(payload.nombre) ?? null,
        correo: String(payload.correo ?? "").trim() ?? null,
      };

      return data;
    },
    buildUpdate: (_payload) => {
      throw new Error("La edicion de esta tabla no esta permitida.");
    },
    idColumn: "id",
    table: "responsable_tarea_proyecto",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (Array.isArray(payload.tarea_ids) && payload.tarea_ids.length > 0) {
        const ids = payload.tarea_ids
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        if (ids.length) {
          query = query.in("tarea_id", ids);
        }
      }

      if (payload.tarea_id !== undefined) {
        query = query.eq("tarea_id", Number(payload.tarea_id));
      }

      if (payload.correo !== undefined) {
        query = query.eq("correo", Number(payload.correo));
      }

      return query;
    }
  }, 
  taskInsumos:{
    buildCreate: (payload) => {
      const data = {
        id_proyecto: Number(payload.id_proyecto) ?? null,
        id_insumo: Number(payload.id_insumo) ?? null,
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.file_name !== undefined) patch.file_name = String(payload.file_name).trim() ?? null;
      if (payload.file_path !== undefined) patch.file_path = String(payload.file_path).trim() ?? null;
      if (payload.mime_type !== undefined) patch.mime_type = String(payload.mime_type).trim() ?? null;
      if (payload.texto !== undefined) patch.texto = String(payload.texto).trim() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "insumos_proyecto",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {
      if (Array.isArray(payload.ids) && payload.ids.length > 0) {
        const ids = payload.ids
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        if (ids.length) {
          query = query.in("id", ids);
        }
      }

      if (payload.id !== undefined) {
        query = query.eq("id", Number(payload.id));
      }

      if (payload.id_proyecto !== undefined) {
        query = query.eq("id_proyecto", Number(payload.id_proyecto));
      }

      if (payload.id_insumo !== undefined) {
        query = query.eq("id_insumo", Number(payload.id_insumo));
      }

      return query;
    }
  },
  taskProjectInsumo: {
    buildCreate: (payload) => {
      const data = {
        id_tarea: Number(payload.id_tarea) ?? null,
        proyecto_id: Number(payload.proyecto_id) ?? null,
        id_insumo_proyecto: Number(payload.id_insumo_proyecto) ?? null,
        tipo_uso: String(payload.tipo_uso).trim() ?? null
      };

      return data;
    },
    buildUpdate: (payload) => {
      const patch: Record<string, unknown> = {};
    
      if (payload.tipo_uso !== undefined) patch.tipo_uso = String(payload.tipo_uso).trim() ?? null;

      console.log(patch)

      return patch;
    },
    idColumn: "id",
    table: "tarea_insumo_proyecto",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {

      if (payload.id_tarea !== undefined) {
        query = query.eq("id_tarea", Number(payload.id_tarea));
      }

      if (payload.proyecto_id !== undefined) {
        query = query.eq("proyecto_id", Number(payload.proyecto_id));
      }

      if (payload.id_insumo_proyecto !== undefined) {
        query = query.eq("id_insumo_proyecto", Number(payload.id_insumo_proyecto));
      }

      if (payload.tipo_uso !== undefined) {
        query = query.eq("tipo_uso", Number(payload.tipo_uso));
      }

      return query;
    }
  },
  taskLog:{
    buildCreate: (payload) => {
      const data = {
        id_tarea: Number(payload.id_tarea) ?? null,
        nombre_tarea: String(payload.nombre_tarea) ?? null,
        fecha_accion: payload.fecha_accion ?? null,
      };

      return data;
    },
    buildUpdate: (_payload) => {
      throw new Error("La edicion de esta tabla no esta permitida.");
    },
    idColumn: "id",
    table: "log_tareas",
    defaultOrderBy: { column: "id", ascending: true },
    buildListQuery: (query, payload) => {

      if (payload.id_tarea !== undefined) {
        query = query.eq("id_tarea", Number(payload.id_tarea));
      }
      return query;
    }
  }, 
};

export function getCrudConfig(resource: string): CrudConfig {
  const config = SETTINGS_RESOURCES[resource];
  if (!config) {
    throw new Error(`Recurso no soportado: ${resource}`);
  }

  return config;
}
