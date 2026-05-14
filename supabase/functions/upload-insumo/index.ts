import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyEntraToken } from "../api/auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const INSUMOS_BUCKET = Deno.env.get("INSUMOS_BUCKET") ?? "insumos";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

function createServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en los secrets de la funcion.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^\w.-]+/g, "_");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Metodo no permitido", 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return errorResponse("Token de autorizacion requerido", 401);
  }

  try {
    await verifyEntraToken(token);
  } catch (error) {
    console.error("[upload-insumo] Token invalido:", error);
    return errorResponse(`No autorizado: ${(error as Error).message}`, 401);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse("Body invalido", 400);
  }

  const file = form.get("file");
  const insumoId = sanitizePathSegment(String(form.get("insumoId") ?? "").trim());
  const projectId = sanitizePathSegment(String(form.get("projectId") ?? "").trim());
  const desiredName = String(form.get("fileName") ?? "").trim();

  if (!(file instanceof File)) {
    return errorResponse("El campo 'file' es obligatorio.", 400);
  }

  if (!insumoId) {
    return errorResponse("El campo 'insumoId' es obligatorio.", 400);
  }

  const finalName = sanitizePathSegment(desiredName || file.name || "archivo");
  const path = projectId
    ? `proyectos/${projectId}/insumos/${insumoId}/${finalName}`
    : `insumos/${insumoId}/${finalName}`;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.storage
      .from(INSUMOS_BUCKET)
      .upload(path, file.stream(), {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) throw error;

    return jsonResponse({
      data: {
        path,
        fileName: finalName,
        mimeType: file.type || null,
        bucket: INSUMOS_BUCKET,
      },
    });
  } catch (error) {
    console.error("[upload-insumo] Error subiendo archivo:", error);
    return errorResponse((error as Error).message, 500);
  }
});
