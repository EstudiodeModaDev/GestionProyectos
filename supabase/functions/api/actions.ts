import { createResource, deleteResource, listResource, setResourceActive, updateResource } from "./crud.ts";
import type { ActionHandler } from "./types.ts";

function requireResource(payload: Record<string, unknown>): string {
  const resource = String(payload.resource ?? "").trim();
  if (!resource) {
    throw new Error("El payload requiere 'resource'.");
  }

  return resource;
}

export const ACTIONS: Record<string, ActionHandler> = {
  health: async (_payload, claims) => ({
    ok: true,
    message: "Supabase Edge Function operativa",
    user: {
      oid: claims.oid ?? null,
      tid: claims.tid ?? null,
      email: claims.preferred_username ?? claims.email ?? null,
      name: claims.name ?? null,
      aud: claims.aud ?? null,
      scp: claims.scp ?? null,
    },
  }),

  // Acciones de insumos plantilla
  "insumos.list": async (payload, _claims, supabase) => listResource("insumos", payload, supabase),
  "insumos.create": async (payload, _claims, supabase) => createResource("insumos", payload, supabase),
  "insumos.update": async (payload, _claims, supabase) => updateResource("insumos", payload, supabase),
  "insumos.setActive": async (payload, _claims, supabase) => setResourceActive("insumos", payload, supabase),

  // Acciones de insumos tarea plantilla
  "TemplateTaskInsumos.list": async (payload, _claims, supabase) => listResource("TemplateTaskInsumos", payload, supabase),
  "TemplateTaskInsumos.create": async (payload, _claims, supabase) => createResource("TemplateTaskInsumos", payload, supabase),
  "TemplateTaskInsumos.update": async (payload, _claims, supabase) => updateResource("TemplateTaskInsumos", payload, supabase),
  "TemplateTaskInsumos.delete": async (payload, _claims, supabase) => deleteResource("TemplateTaskInsumos", payload, supabase),

  // Acciones de zonas
  "zonas.list": async (payload, _claims, supabase) => listResource("zonas", payload, supabase),
  "zonas.create": async (payload, _claims, supabase) => createResource("zonas", payload, supabase),

  // Acciones de marcas
  "marcas.list": async (payload, _claims, supabase) => listResource("marcas", payload, supabase),
  "marcas.create": async (payload, _claims, supabase) => createResource("marcas", payload, supabase),

  // Acciones de areas responsables
  "areas.list": async (payload, _claims, supabase) => listResource("areas", payload, supabase),
  "areas.create": async (payload, _claims, supabase) => createResource("areas", payload, supabase),

  // Acciones de tareas de plantilla
  "templateTasks.list": async (payload, _claims, supabase) => listResource("templateTasks", payload, supabase),
  "templateTasks.create": async (payload, _claims, supabase) => createResource("templateTasks", payload, supabase),
  "templateTasks.update": async (payload, _claims, supabase) => updateResource("templateTasks", payload, supabase),

  // Acciones de reglas de flujo
  "flowRule.list": async (payload, _claims, supabase) => listResource("flowRule", payload, supabase),
  "flowRule.create": async (payload, _claims, supabase) => createResource("flowRule", payload, supabase),
  "flowRule.update": async (payload, _claims, supabase) => updateResource("flowRule", payload, supabase),
  "flowRule.inactivate": async (payload, _claims, supabase) => updateResource("flowRule", payload, supabase),

  // Acciones de encargados de tareas plantilla
  "templateResponsible.list": async (payload, _claims, supabase) => listResource("templateResponsible", payload, supabase),
  "templateResponsible.create": async (payload, _claims, supabase) => createResource("templateResponsible", payload, supabase),
  "templateResponsible.update": async (payload, _claims, supabase) => updateResource("templateResponsible", payload, supabase),
  "templateResponsible.delete": async (payload, _claims, supabase) => deleteResource("templateResponsible", payload, supabase),

  // Acciones de detalles de encargados de tareas plantilla
  "ResponsibleDetail.list": async (payload, _claims, supabase) => listResource("ResponsibleDetail", payload, supabase),
  "ResponsibleDetail.create": async (payload, _claims, supabase) => createResource("ResponsibleDetail", payload, supabase),
  "ResponsibleDetail.update": async (payload, _claims, supabase) => updateResource("ResponsibleDetail", payload, supabase),
  "ResponsibleDetail.delete": async (payload, _claims, supabase) => deleteResource("ResponsibleDetail", payload, supabase),

  // Acciones de jefes de zona
  "jefeZona.list": async (payload, _claims, supabase) => listResource("jefeZona", payload, supabase),
  "jefeZona.create": async (payload, _claims, supabase) => createResource("jefeZona", payload, supabase),
  "jefeZona.update": async (payload, _claims, supabase) => updateResource("jefeZona", payload, supabase),
  "jefeZona.delete": async (payload, _claims, supabase) => deleteResource("jefeZona", payload, supabase),

  // Acciones de jefes de zona
  "projects.list": async (payload, _claims, supabase) => listResource("projects", payload, supabase),
  "projects.create": async (payload, _claims, supabase) => createResource("projects", payload, supabase),
  "projects.update": async (payload, _claims, supabase) => updateResource("projects", payload, supabase),

  // Acciones de tareas proyecto
  "projectTasks.list": async (payload, _claims, supabase) => listResource("projectTasks", payload, supabase),
  "projectTasks.create": async (payload, _claims, supabase) => createResource("projectTasks", payload, supabase),
  "projectTasks.update": async (payload, _claims, supabase) => updateResource("projectTasks", payload, supabase),

  // Acciones de encargados de tareas proyecto
  "projectTaskResponsible.list": async (payload, _claims, supabase) => listResource("projectTaskResponsible", payload, supabase),
  "projectTaskResponsible.create": async (payload, _claims, supabase) => createResource("projectTaskResponsible", payload, supabase),

  // Acciones de insumos tarea
  "taskInsumos.list": async (payload, _claims, supabase) => listResource("taskInsumos", payload, supabase),
  "taskInsumos.create": async (payload, _claims, supabase) => createResource("taskInsumos", payload, supabase),
  "taskInsumos.update": async (payload, _claims, supabase) => updateResource("taskInsumos", payload, supabase),
  "taskInsumos.setActive": async (payload, _claims, supabase) => setResourceActive("taskInsumos", payload, supabase),
  "taskInsumos.signedUrl": async (payload, _claims, supabase) => {
    const bucket = Deno.env.get("INSUMOS_BUCKET") ?? "insumos";
    const filePath = String(payload.file_path ?? "").trim();
    const expiresIn = Number(payload.expires_in ?? 600);

    if (!filePath) {
      throw new Error("El payload requiere 'file_path'.");
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw new Error(error.message);
    return data;
  },

  // Acciones de tarea insumo proyecto
  "taskProjectInsumo.list": async (payload, _claims, supabase) => listResource("taskProjectInsumo", payload, supabase),
  "taskProjectInsumo.create": async (payload, _claims, supabase) => createResource("taskProjectInsumo", payload, supabase),

  // Acciones de log de tareas
  "taskLog.list": async (payload, _claims, supabase) => listResource("taskLog", payload, supabase),
  "taskLog.create": async (payload, _claims, supabase) => createResource("taskLog", payload, supabase),

  //Acciones generales
  listResource: async (payload, _claims, supabase) => listResource(requireResource(payload), payload, supabase),
  createResource: async (payload, _claims, supabase) => createResource(requireResource(payload), payload, supabase),
  updateResource: async (payload, _claims, supabase) => updateResource(requireResource(payload), payload, supabase),
  setResourceActive: async (payload, _claims, supabase) => setResourceActive(requireResource(payload), payload, supabase),
  deleteResource: async (payload, _claims, supabase) => deleteResource(requireResource(payload), payload, supabase),

  fetchInsumosPlantilla: async (payload, _claims, supabase) => listResource("insumos", payload, supabase),
  createInsumoPlantilla: async (payload, _claims, supabase) => createResource("insumos", payload, supabase),
  updateInsumoPlantilla: async (payload, _claims, supabase) => updateResource("insumos", payload, supabase),
  inactivateInsumoPlantilla: async (payload, _claims, supabase) => setResourceActive("insumos", { ...payload, is_active: false }, supabase),

  upsertUserByEntraId: async (_payload, claims, supabase) => {
    const entraId = String(claims.oid ?? "").trim();
    const name = String(claims.name ?? "").trim();
    const email = String(claims.preferred_username ?? claims.email ?? "").trim();

    if (!entraId || !email) {
      throw new Error("No fue posible resolver oid/email desde el token de Entra ID.");
    }

    const { data, error } = await supabase
      .from("TBL_Users")
      .upsert(
        {
          User_EntraID: entraId,
          User_Name: name.slice(0, 150),
          User_Email: email.slice(0, 150),
        },
        {
          onConflict: "User_EntraID",
          ignoreDuplicates: false,
        }
      )
      .select("User_ID, User_EntraID, User_Name, User_Email")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export async function runAction(
  action: string,
  payload: Record<string, unknown>,
  claims: Parameters<ActionHandler>[1],
  supabase: Parameters<ActionHandler>[2]
) {
  const handler = ACTIONS[action];
  if (!handler) {
    throw new Error(`Accion no soportada: ${action}`);
  }

  return handler(payload, claims, supabase);
}
