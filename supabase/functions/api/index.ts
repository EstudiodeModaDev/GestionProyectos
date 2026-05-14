import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyEntraToken } from "./auth.ts";
import { runAction } from "./actions.ts";
import type { ActionBody } from "./types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

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

  let claims;
  try {
    claims = await verifyEntraToken(token);
  } catch (error) {
    console.error("[api] Token invalido:", error);
    return errorResponse(req, `No autorizado: ${(error as Error).message}`, 401);
  }

  let body: ActionBody;
  try {
    body = (await req.json()) as ActionBody;
  } catch {
    return errorResponse(req, "Body invalido", 400);
  }

  if (!body.action) {
    return errorResponse(req, 'El campo "action" es obligatorio', 400);
  }

  try {
    const result = await runAction(body.action, body.payload ?? {}, claims, createServiceClient());
    return jsonResponse(req, { data: result });
  } catch (error) {
    console.error(`[api] Error en accion ${body.action}:`, error);
    return errorResponse(req, (error as Error).message, 500);
  }
});
