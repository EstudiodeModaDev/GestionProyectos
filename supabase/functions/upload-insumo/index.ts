import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyEntraToken } from "../api/auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const INSUMOS_BUCKET = Deno.env.get("INSUMOS_BUCKET") ?? "insumos";

function buildCorsHeaders(req: Request): HeadersInit {
  const requestOrigin = req.headers.get("Origin") ?? "";
  const requestedHeaders =
    req.headers.get("Access-Control-Request-Headers") ??
    "Authorization, Content-Type";

  const allowedOrigins = ALLOWED_ORIGIN
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowOrigin =
    allowedOrigins.includes("*")
      ? "*"
      : allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : allowedOrigins[0] ?? "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": requestedHeaders,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(req: Request, message: string, status: number) {
  return jsonResponse(req, { error: message }, status);
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
    return new Response(null, { headers: buildCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "Metodo no permitido", 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return errorResponse(req, "Token de autorizacion requerido", 401);
  }

  try {
    await verifyEntraToken(token);
  } catch (error) {
    console.error("[upload-insumo] Token invalido:", error);
    return errorResponse(req, `No autorizado: ${(error as Error).message}`, 401);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse(req, "Body invalido", 400);
  }

  const file = form.get("file");
  const insumoId = sanitizePathSegment(String(form.get("insumoId") ?? "").trim());
  const projectId = sanitizePathSegment(String(form.get("projectId") ?? "").trim());
  const desiredName = String(form.get("fileName") ?? "").trim();

  if (!(file instanceof File)) {
    return errorResponse(req, "El campo 'file' es obligatorio.", 400);
  }

  if (!insumoId) {
    return errorResponse(req, "El campo 'insumoId' es obligatorio.", 400);
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

    return jsonResponse(req, {
      data: {
        path,
        fileName: finalName,
        mimeType: file.type || null,
        bucket: INSUMOS_BUCKET,
      },
    });
  } catch (error) {
    console.error("[upload-insumo] Error subiendo archivo:", error);
    return errorResponse(req, (error as Error).message, 500);
  }
});
