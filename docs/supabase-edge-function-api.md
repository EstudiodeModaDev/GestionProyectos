# Edge Function `api`

## Estado actual

La funcion `supabase/functions/api` ya usa el flujo correcto para `settings`:

1. React inicia sesion con MSAL.
2. React pide un token especifico para tu API de Entra ID con `getApiToken()`.
3. React llama la Edge Function con:
   - `Authorization: Bearer <token de la API>`
   - body JSON `{ action, payload }`
4. La Edge Function valida:
   - firma del JWT con JWKS de Microsoft
   - `issuer`
   - `audience = api://<AZURE_CLIENT_ID>`
   - `tenant id`
   - `oid`
5. Si el token es valido, crea un cliente Supabase con `SUPABASE_SERVICE_ROLE_KEY`.
6. Ejecuta la accion registrada.
7. Devuelve `{ data }` o `{ error }`.

## Frontend

Variables esperadas en el frontend:

```env
VITE_ENTRA_CLIENT_ID=<spa-client-id>
VITE_ENTRA_TENANT_ID=<tenant-id>
VITE_ENTRA_GRAPH_SCOPES=User.Read,Sites.ReadWrite.All,Directory.Read.All
VITE_ENTRA_API_SCOPES=api://<entra-api-client-id>/access_as_users
VITE_SUPABASE_EDGE_API_URL=https://<project-ref>.supabase.co/functions/v1/api
```

Notas:

- `getGraphToken()` se usa solo para Microsoft Graph.
- `getApiToken()` se usa solo para Supabase Edge Functions.
- `useSupabaseApi()` ya consume `getApiToken()`.

## Secrets en Supabase

Debes cargar estos secretos en la funcion:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `ALLOWED_ORIGIN`

Ejemplo:

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set AZURE_TENANT_ID=<tenant-id>
supabase secrets set AZURE_CLIENT_ID=<entra-api-client-id>
supabase secrets set ALLOWED_ORIGIN=https://tu-frontend.com
```

## `verify_jwt = false`

En `supabase/config.toml` la funcion debe seguir con:

```toml
[functions.api]
verify_jwt = false
```

Eso es correcto porque Supabase no valida un JWT suyo; la validacion la hacemos nosotros contra Entra ID.

## Patron actual de `settings-api`

La funcion ya esta organizada con este patron:

- `auth.ts`
  Valida el token de Entra.
- `resources.ts`
  Registro de recursos permitidos.
- `crud.ts`
  CRUD generico reutilizable.
- `actions.ts`
  Mapa de acciones publicas.
- `index.ts`
  Entry point minimo.

### Reglas del patron

1. Cada tabla simple de `settings` entra como un recurso en `resources.ts`.
2. Cada recurso define:
   - `table`
   - `idColumn`
   - `buildListQuery`
   - `buildCreate`
   - `buildUpdate`
3. `crud.ts` ejecuta la operacion generica.
4. `actions.ts` expone acciones semanticas.

## Ejemplo actual: `insumos`

Recurso:

- nombre logico: `insumos`
- tabla: `insumos_plantilla`

Acciones publicas recomendadas:

- `insumos.list`
- `insumos.create`
- `insumos.update`
- `insumos.setActive`

Compatibilidad actual:

- `fetchInsumosPlantilla`
- `createInsumoPlantilla`
- `updateInsumoPlantilla`
- `inactivateInsumoPlantilla`

## Patron para acoplar el resto

### 1. Tabla

Define la tabla en `resources.ts`.

Ejemplo:

```ts
templateTasks: {
  table: "template_tasks",
  idColumn: "id",
  buildListQuery: ...,
  buildCreate: ...,
  buildUpdate: ...,
}
```

### 2. Acciones

Expone acciones semanticas en `actions.ts`.

Ejemplo:

```ts
"templateTasks.list"
"templateTasks.create"
"templateTasks.update"
"templateTasks.delete"
```

### 3. Repositorio frontend

Crea o adapta un repositorio por modulo, no por tabla suelta.

Ejemplo:

- `PlantillaInsumosRepository`
- `TemplateTasksRepository`
- `FlowRulesRepository`

Cada repositorio llama `api.call("modulo.accion", payload)`.

### 4. Hook de dominio

Los hooks funcionales dependen del repositorio, no de SharePoint ni de Supabase directo.

Ejemplo:

- `usePlantillaInsumos(repo)`
- `useTemplateTasks(repo)`

### 5. Componente

El componente solo consume el hook o el repositorio desde contexto.

## Que modulos meter primero en `settings`

Orden recomendado:

1. `insumos`
2. `templateTasks`
3. `plantillaTareaInsumo`
4. `flowRules`
5. `responsableRules`
6. `responsableRuleDetails`

## Deploy

```bash
supabase functions deploy api
```

Si cambias secrets:

```bash
supabase secrets set ...
supabase functions deploy api
```
