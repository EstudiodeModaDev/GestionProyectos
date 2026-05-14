import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyEntraToken } from "./auth.ts";
import { runAction } from "./actions.ts";
import type { ActionBody } from "./types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

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

  let claims;
  try {
    claims = await verifyEntraToken(token);
  } catch (error) {
    console.error("[api] Token invalido:", error);
    return errorResponse(`No autorizado: ${(error as Error).message}`, 401);
  }

  let body: ActionBody;
  try {
    body = (await req.json()) as ActionBody;
  } catch {
    return errorResponse("Body invalido", 400);
  }

  if (!body.action) {
    return errorResponse('El campo "action" es obligatorio', 400);
  }

  try {
    const result = await runAction(body.action, body.payload ?? {}, claims, createServiceClient());
    return jsonResponse({ data: result });
  } catch (error) {
    console.error(`[api] Error en accion ${body.action}:`, error);
    return errorResponse((error as Error).message, 500);
  }
});
