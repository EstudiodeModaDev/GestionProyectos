import type { SupabaseClient } from "./types.ts";
import { getCrudConfig } from "./resources.ts";

export async function listResource(
  resource: string,
  payload: Record<string, unknown>,
  supabase: SupabaseClient
) {
  const config = getCrudConfig(resource);
  let query = supabase.from(config.table).select("*");

  if (config.buildListQuery) {
    query = config.buildListQuery(query, payload);
  }

  if (config.defaultOrderBy) {
    query = query.order(config.defaultOrderBy.column, {
      ascending: config.defaultOrderBy.ascending ?? true,
    });
  }

  const { data, error } = await query.limit(2500);
  if (error) throw new Error(error.message);
  return data;
}

export async function createResource(
  resource: string,
  payload: Record<string, unknown>,
  supabase: SupabaseClient
) {
  const config = getCrudConfig(resource);
  const insertPayload = config.buildCreate(payload);

  const { data, error } = await supabase
    .from(config.table)
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateResource(
  resource: string,
  payload: Record<string, unknown>,
  supabase: SupabaseClient
) {
  const config = getCrudConfig(resource);
  const id = String(payload.id ?? "").trim();
  if (!id) {
    throw new Error("El payload requiere 'id'.");
  }

  const patch = config.buildUpdate(payload);

  const { data, error } = await supabase
    .from(config.table)
    .update(patch)
    .eq(config.idColumn, id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteResource(
  resource: string,
  payload: Record<string, unknown>,
  supabase: SupabaseClient
) {
  const config = getCrudConfig(resource);
  const id = String(payload.id ?? "").trim();
  if (!id) {
    throw new Error("El payload requiere 'id'.");
  }


  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq(config.idColumn, id)

  if (error) {
    throw new Error("No se pudo eliminar: " + error.message)
  };
  return error;
}

export async function setResourceActive(
  resource: string,
  payload: Record<string, unknown>,
  supabase: SupabaseClient
) {
  const config = getCrudConfig(resource);
  const id = String(payload.id ?? "").trim();
  if (!id) {
    throw new Error("El payload requiere 'id'.");
  }

  const isActive = Boolean(payload.is_active);
  const { data, error } = await supabase
    .from(config.table)
    .update({ is_active: isActive })
    .eq(config.idColumn, id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
