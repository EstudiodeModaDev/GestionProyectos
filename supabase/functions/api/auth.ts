import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";
import type { EntraClaims } from "./types.ts";

const AZURE_TENANT_ID = Deno.env.get("AZURE_TENANT_ID") ?? "";
const AZURE_CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID") ?? "";
const ENTRA_ISSUER_V2 = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`;
const ENTRA_ISSUER_V1 = `https://sts.windows.net/${AZURE_TENANT_ID}/`;
const ENTRA_JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`)
);

function decodeJwtPayload(token: string): EntraClaims {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Formato de token invalido.");
  }

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(atob(padded)) as EntraClaims;
}

export async function verifyEntraToken(token: string): Promise<EntraClaims> {
  if (!AZURE_TENANT_ID) {
    throw new Error("Falta AZURE_TENANT_ID en los secrets de la funcion.");
  }

  if (!AZURE_CLIENT_ID) {
    throw new Error("Falta AZURE_CLIENT_ID en los secrets de la funcion.");
  }

  const rawClaims = decodeJwtPayload(token);
  const rawIssuer = String(rawClaims.iss ?? "");
  const issuer = rawIssuer.includes("sts.windows.net") ? ENTRA_ISSUER_V1 : ENTRA_ISSUER_V2;
  const audience = `api://${AZURE_CLIENT_ID}`;

  const { payload } = await jwtVerify(token, ENTRA_JWKS, { issuer, audience });
  const claims = payload as EntraClaims;

  if (claims.tid !== AZURE_TENANT_ID) {
    throw new Error(`Token de tenant no autorizado: ${String(claims.tid ?? "desconocido")}`);
  }

  if (!claims.oid) {
    throw new Error("El token no contiene el claim 'oid'.");
  }

  return claims;
}
