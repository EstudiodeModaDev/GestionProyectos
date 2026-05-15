# Recordatorios diarios de tareas

Esta automatizacion vive en la Edge Function `daily-task-reminders` y fue pensada para correr todos los dias a las 9:00 AM hora Colombia (`America/Bogota`).

## Que hace

- Consulta `tareas_proyecto`
- Cruza `tareas_plantilla`, `proyectos` y `responsable_tarea_proyecto`
- Filtra tareas segun una regla configurable
- Envia un correo a cada responsable
- Registra el resultado en `task_notification_log`
- Evita duplicados si ese mismo destinatario ya recibio el aviso ese dia

## Regla por defecto

La funcion queda con una configuracion conservadora:

- `REMINDER_RULE=overdue`
- `REMINDER_EXCLUDE_STATUSES=Completada,Devuelta`

Eso significa: avisar por tareas vencidas que aun no se han cerrado.

Si quieres replicar tu caso literal original, podrias usar:

- `REMINDER_RULE=closed_before_due`
- `REMINDER_INCLUDE_STATUSES=Completada,Devuelta`
- `REMINDER_EXCLUDE_STATUSES=`

## Proveedores soportados

### Microsoft Graph

Usa estos secrets:

- `MAIL_PROVIDER=graph`
- `GRAPH_TENANT_ID`
- `GRAPH_CLIENT_ID`
- `GRAPH_CLIENT_SECRET`
- `GRAPH_SENDER_USER`
- `MAIL_FROM_EMAIL` opcional si quieres reutilizarlo como fallback

### Resend

Usa estos secrets:

- `MAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`

## Secrets comunes

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `APP_BASE_URL`
- `REMINDER_TIMEZONE=America/Bogota`
- `REMINDER_RULE=overdue`
- `REMINDER_UPCOMING_DAYS=3`
- `REMINDER_INCLUDE_STATUSES=`
- `REMINDER_EXCLUDE_STATUSES=Completada,Devuelta`

## Despliegue

1. Aplicar la migracion SQL.
2. Desplegar la funcion:

```bash
supabase functions deploy daily-task-reminders --no-verify-jwt
```

3. Cargar los secrets:

```bash
supabase secrets set CRON_SECRET=tu_secreto
supabase secrets set MAIL_PROVIDER=graph
```

4. Probar en seco:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/daily-task-reminders" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: tu_secreto" \
  -d "{\"dryRun\": true}"
```

## Programacion a las 9:00 AM de Colombia

Colombia usa `UTC-5`, asi que `9:00 AM America/Bogota` equivale a `14:00 UTC`.

Si programas el job con cron UTC, usa:

```text
0 14 * * *
```

## Ejemplos de ejecucion manual

Recordatorios por vencimiento hoy:

```json
{
  "dryRun": true,
  "reminderRule": "due_today"
}
```

Recordatorios por proximidad de vencimiento en los proximos 2 dias:

```json
{
  "dryRun": true,
  "reminderRule": "upcoming",
  "upcomingDays": 2
}
```

Replica tu regla original:

```json
{
  "dryRun": true,
  "reminderRule": "closed_before_due",
  "includeStatuses": ["Completada", "Devuelta"],
  "excludeStatuses": []
}
```
