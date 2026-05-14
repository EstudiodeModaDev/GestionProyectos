# Supabase + Entra ID + MSAL

## Que se aplico en el frontend

1. `src/auth/msal.ts`
   Se separaron los scopes por recurso:
   - `LOGIN_SCOPES`: identidad basica
   - `GRAPH_SCOPES`: Microsoft Graph
   - `API_SCOPES`: API protegida que sirve de backend para Supabase

2. `src/auth/authProvider.tsx`
   El contexto ahora expone:
   - `getGraphToken()`
   - `getApiToken()`
   - `getToken()` como alias temporal de Graph para no romper el codigo actual

3. `src/services/supabase.service.ts`
   Ya no crea un cliente directo con `supabase-js` en el navegador. Ahora encapsula llamadas a una Edge Function protegida con un bearer de Entra ID.

4. `src/Components/Settings/WrapperSettings/AperturaTareaModalWrapper.tsx`
   Se retiro la consulta directa a Supabase que no estaba alineada con la arquitectura segura.

## Flujo exacto

1. El usuario inicia sesion una sola vez con MSAL.
2. Cuando la app necesita Graph, usa `getGraphToken()`.
3. Cuando la app necesita Supabase, usa `getApiToken()`.
4. Ese token no va a tablas directamente.
5. React llama a la Edge Function con:
   - `Authorization: Bearer <token de Entra para la API>`
   - body `{ action, payload }`
6. La Edge Function valida el token.
7. La Edge Function usa `service_role` solo en backend.
8. La respuesta vuelve al frontend ya filtrada por la logica del backend.

## Variables de entorno

Usa `.env.example` como base y define:

- `VITE_ENTRA_CLIENT_ID`
- `VITE_ENTRA_TENANT_ID`
- `VITE_ENTRA_GRAPH_SCOPES`
- `VITE_ENTRA_API_SCOPES`
- `VITE_SUPABASE_EDGE_API_URL`

## Como consumir la API de Supabase desde React

```ts
import { useSupabaseApi } from "../Funcionalidades/Supabase/useSupabaseApi";

const api = useSupabaseApi();
const data = await api.call("fetchSomething", { id: 1 });
```

## Importante

- `VITE_ENTRA_API_SCOPES` debe apuntar a un scope de una app registration de Entra para tu backend.
- El token de Graph y el token de la API no deben mezclarse.
- `service_role` nunca debe ir en React.
- Si quieres RLS real por usuario en Postgres, la siguiente evolucion es cambiar de `service_role` a un JWT de Supabase emitido por un backend de intercambio.
