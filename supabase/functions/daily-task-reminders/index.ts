import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const MAIL_PROVIDER = (Deno.env.get("MAIL_PROVIDER") ?? "graph").trim().toLowerCase();
const DEFAULT_TIMEZONE = Deno.env.get("REMINDER_TIMEZONE") ?? "America/Bogota";
const DEFAULT_FROM_EMAIL = Deno.env.get("MAIL_FROM_EMAIL") ?? "";
const DEFAULT_FROM_NAME = Deno.env.get("MAIL_FROM_NAME") ?? "Gestion de Proyectos";
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") ?? "http://localhost:5173/";

type ReminderRule = "overdue" | "due_today" | "upcoming" | "closed_before_due";
type DeliveryStatus = "sent" | "failed";

type ProjectTaskRow = {
  id: number;
  id_proyecto: number | null;
  id_tarea_plantilla: number | null;
  estado: string | null;
  fecha_resolucion: string | null;
  fecha_inicio: string | null;
  fecha_cierre: string | null;
  razon_devolucion: string | null;
  razon_bloqueo: string | null;
};

type TemplateTaskRow = {
  id: number;
  codigo: string | null;
  nombre_tarea: string | null;
  fase: string | null;
  dias_para_resolver: number | null;
};

type ProjectRow = {
  id: number;
  nombre_proyecto: string | null;
};

type ResponsibleRow = {
  tarea_id: number;
  nombre: string | null;
  correo: string | null;
};

type ReminderTask = {
  id: number;
  estado: string;
  fechaResolucion: string;
  projectId: number | null;
  projectName: string;
  taskCode: string;
  taskName: string;
  phase: string;
  diasParaResolver: number | null;
};

type ReminderRecipient = {
  email: string;
  name: string;
};

type NotificationLogInsert = {
  task_id: number;
  notification_type: string;
  notification_date: string;
  recipient_email: string;
  provider: string;
  status: DeliveryStatus;
  metadata?: Record<string, unknown>;
  error_message?: string | null;
};

type RequestPayload = {
  dryRun?: boolean;
  timezone?: string;
  reminderRule?: ReminderRule;
  upcomingDays?: number;
  includeStatuses?: string[];
  excludeStatuses?: string[];
  notificationType?: string;
};

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeStatus(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function parseListEnv(value: string | undefined, fallback: string[]) {
  const items = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : fallback;
}

function getBogotaDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return { year, month, day, isoDate: `${year}-${month}-${day}` };
}

function parseLocalDate(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(value: string | null | undefined, timeZone: string) {
  const date = parseLocalDate(value);
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDaysUtc(baseDate: Date, days: number) {
  const next = new Date(baseDate.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffDaysUtc(target: Date, base: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = target.getTime() - base.getTime();
  return Math.floor(diff / msPerDay);
}

function buildReminderSubject(task: ReminderTask, rule: ReminderRule) {
  if (rule === "due_today") {
    return `Recordatorio: la tarea ${task.taskName} vence hoy`;
  }

  if (rule === "upcoming") {
    return `Recordatorio: la tarea ${task.taskName} tiene un vencimiento cercano`;
  }

  if (rule === "closed_before_due") {
    return `Revision: tarea ${task.taskName} cerrada antes de su vencimiento`;
  }

  return `Alerta: la tarea ${task.taskName} esta vencida`;
}

function buildReminderHtml(params: {
  recipient: ReminderRecipient;
  task: ReminderTask;
  rule: ReminderRule;
  timeZone: string;
  appUrl: string;
}) {
  const { recipient, task, rule, timeZone, appUrl } = params;
  let intro = "";

  if (rule === "due_today") {
    intro = `La tarea <strong>${task.taskName}</strong> (${task.taskCode}) vence hoy y aun requiere gestion.`;
  } else if (rule === "upcoming") {
    intro = `La tarea <strong>${task.taskName}</strong> (${task.taskCode}) tiene una fecha de vencimiento cercana.`;
  } else if (rule === "closed_before_due") {
    intro = `La tarea <strong>${task.taskName}</strong> (${task.taskCode}) aparece cerrada antes de su fecha de vencimiento y fue incluida segun la regla configurada.`;
  } else {
    intro = `La tarea <strong>${task.taskName}</strong> (${task.taskCode}) esta vencida y aun no figura como cerrada.`;
  }

  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
      <p>Hola <strong>${recipient.name}</strong>,</p>
      <p>${intro}</p>
      <p><strong>Detalle de la tarea</strong></p>
      <ul>
        <li><strong>Proyecto:</strong> ${task.projectName}</li>
        <li><strong>Codigo:</strong> ${task.taskCode}</li>
        <li><strong>Estado:</strong> ${task.estado}</li>
        <li><strong>Fase:</strong> ${task.phase}</li>
        <li><strong>Vence:</strong> ${formatDateLabel(task.fechaResolucion, timeZone)}</li>
      </ul>
      <p>Ingresa al sistema para revisar la tarea y tomar la accion correspondiente.</p>
      <p><a href="${appUrl}">Abrir Gestion de Proyectos</a></p>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">
        Notificacion automatica generada por el job diario de tareas.
      </p>
    </div>
  `;
}

async function sendWithResend(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY.");
  }

  if (!DEFAULT_FROM_EMAIL) {
    throw new Error("Falta MAIL_FROM_EMAIL para usar Resend.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DEFAULT_FROM_NAME ? `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>` : DEFAULT_FROM_EMAIL,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend respondio ${response.status}: ${errorText}`);
  }
}

async function getGraphAccessToken() {
  const tenantId = Deno.env.get("GRAPH_TENANT_ID") ?? "";
  const clientId = Deno.env.get("GRAPH_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GRAPH_CLIENT_SECRET") ?? "";

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Faltan GRAPH_TENANT_ID, GRAPH_CLIENT_ID o GRAPH_CLIENT_SECRET.");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No fue posible autenticar en Graph: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return String(data.access_token ?? "");
}

async function sendWithGraph(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const senderUser = Deno.env.get("GRAPH_SENDER_USER") ?? DEFAULT_FROM_EMAIL;
  if (!senderUser) {
    throw new Error("Falta GRAPH_SENDER_USER o MAIL_FROM_EMAIL para usar Microsoft Graph.");
  }

  const accessToken = await getGraphAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderUser)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: params.subject,
        body: {
          contentType: "HTML",
          content: params.html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: params.to,
            },
          },
        ],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph respondio ${response.status}: ${errorText}`);
  }
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (MAIL_PROVIDER === "resend") {
    await sendWithResend(params);
    return;
  }

  if (MAIL_PROVIDER === "graph") {
    await sendWithGraph(params);
    return;
  }

  throw new Error(`MAIL_PROVIDER no soportado: ${MAIL_PROVIDER}. Usa "graph" o "resend".`);
}

function isAuthorized(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const cronSecretHeader = req.headers.get("x-cron-secret") ?? "";

  if (CRON_SECRET && (bearerToken === CRON_SECRET || cronSecretHeader === CRON_SECRET)) {
    return true;
  }

  if (!CRON_SECRET && bearerToken === SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }

  return false;
}

function shouldNotifyTask(params: {
  task: ReminderTask;
  todayUtc: Date;
  rule: ReminderRule;
  includeStatuses: string[];
  excludeStatuses: string[];
  upcomingDays: number;
}) {
  const { task, todayUtc, rule, includeStatuses, excludeStatuses, upcomingDays } = params;
  const taskDate = parseLocalDate(task.fechaResolucion);
  if (!taskDate) return false;

  const normalizedStatus = normalizeStatus(task.estado);
  const included = includeStatuses.length === 0 || includeStatuses.includes(normalizedStatus);
  const excluded = excludeStatuses.includes(normalizedStatus);

  if (!included || excluded) {
    return false;
  }

  const deltaDays = diffDaysUtc(taskDate, todayUtc);

  if (rule === "due_today") return deltaDays === 0;
  if (rule === "upcoming") return deltaDays >= 0 && deltaDays <= upcomingDays;
  if (rule === "closed_before_due") return deltaDays > 0;
  return deltaDays < 0;
}

async function loadReminderTasks(supabase: ReturnType<typeof createServiceClient>) {
  const { data: tasks, error: taskError } = await supabase
    .from("tareas_proyecto")
    .select("id, id_proyecto, id_tarea_plantilla, estado, fecha_resolucion, fecha_inicio, fecha_cierre, razon_devolucion, razon_bloqueo")
    .not("fecha_resolucion", "is", null);

  if (taskError) throw taskError;

  const templateIds = [...new Set((tasks ?? []).map((task) => task.id_tarea_plantilla).filter((value): value is number => Number.isFinite(value)))];
  const projectIds = [...new Set((tasks ?? []).map((task) => task.id_proyecto).filter((value): value is number => Number.isFinite(value)))];
  const taskIds = (tasks ?? []).map((task) => task.id);

  const [
    { data: templateTasks, error: templateError },
    { data: projects, error: projectError },
    { data: responsibles, error: responsibleError },
  ] = await Promise.all([
    templateIds.length
      ? supabase.from("tareas_plantilla").select("id, codigo, nombre_tarea, fase, dias_para_resolver").in("id", templateIds)
      : Promise.resolve({ data: [] as TemplateTaskRow[], error: null }),
    projectIds.length
      ? supabase.from("proyectos").select("id, nombre_proyecto").in("id", projectIds)
      : Promise.resolve({ data: [] as ProjectRow[], error: null }),
    taskIds.length
      ? supabase.from("responsable_tarea_proyecto").select("tarea_id, nombre, correo").in("tarea_id", taskIds)
      : Promise.resolve({ data: [] as ResponsibleRow[], error: null }),
  ]);

  if (templateError) throw templateError;
  if (projectError) throw projectError;
  if (responsibleError) throw responsibleError;

  const templateById = new Map<number, TemplateTaskRow>((templateTasks ?? []).map((item) => [item.id, item]));
  const projectById = new Map<number, ProjectRow>((projects ?? []).map((item) => [item.id, item]));
  const recipientsByTaskId = new Map<number, ReminderRecipient[]>();

  for (const responsible of responsibles ?? []) {
    const email = String(responsible.correo ?? "").trim().toLowerCase();
    if (!email) continue;

    const current = recipientsByTaskId.get(responsible.tarea_id) ?? [];
    if (!current.some((item) => item.email === email)) {
      current.push({
        email,
        name: String(responsible.nombre ?? "Responsable").trim() || "Responsable",
      });
      recipientsByTaskId.set(responsible.tarea_id, current);
    }
  }

  return (tasks ?? []).map((task): { task: ReminderTask; recipients: ReminderRecipient[] } => {
    const template = task.id_tarea_plantilla ? templateById.get(task.id_tarea_plantilla) : undefined;
    const project = task.id_proyecto ? projectById.get(task.id_proyecto) : undefined;

    return {
      task: {
        id: task.id,
        estado: String(task.estado ?? "").trim() || "Sin estado",
        fechaResolucion: String(task.fecha_resolucion ?? "").trim(),
        projectId: task.id_proyecto,
        projectName: String(project?.nombre_proyecto ?? `Proyecto #${task.id_proyecto ?? "-"}`),
        taskCode: String(template?.codigo ?? `T-${task.id}`),
        taskName: String(template?.nombre_tarea ?? `Tarea #${task.id}`),
        phase: String(template?.fase ?? "-"),
        diasParaResolver: template?.dias_para_resolver ?? null,
      },
      recipients: recipientsByTaskId.get(task.id) ?? [],
    };
  });
}

async function hasSentNotificationToday(params: {
  supabase: ReturnType<typeof createServiceClient>;
  taskId: number;
  notificationType: string;
  notificationDate: string;
  recipientEmail: string;
}) {
  const { data, error } = await params.supabase
    .from("task_notification_log")
    .select("id")
    .eq("task_id", params.taskId)
    .eq("notification_type", params.notificationType)
    .eq("notification_date", params.notificationDate)
    .eq("recipient_email", params.recipientEmail)
    .eq("status", "sent")
    .limit(1);

  if (error) throw error;
  return Boolean(data?.length);
}

async function insertNotificationLog(
  supabase: ReturnType<typeof createServiceClient>,
  payload: NotificationLogInsert
) {
  const { error } = await supabase.from("task_notification_log").insert({
    task_id: payload.task_id,
    notification_type: payload.notification_type,
    notification_date: payload.notification_date,
    recipient_email: payload.recipient_email,
    provider: payload.provider,
    status: payload.status,
    metadata: payload.metadata ?? {},
    error_message: payload.error_message ?? null,
  });

  if (error) throw error;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo no permitido" }, 405);
  }

  if (!isAuthorized(req)) {
    return jsonResponse({ error: "No autorizado" }, 401);
  }

  let payload: RequestPayload = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const supabase = createServiceClient();
  const timeZone = payload.timezone ?? DEFAULT_TIMEZONE;
  const reminderRule = payload.reminderRule ?? (Deno.env.get("REMINDER_RULE") as ReminderRule | null) ?? "overdue";
  const upcomingDays = Number(payload.upcomingDays ?? Deno.env.get("REMINDER_UPCOMING_DAYS") ?? 3);
  const includeStatuses = (payload.includeStatuses ?? parseListEnv(Deno.env.get("REMINDER_INCLUDE_STATUSES"), []))
    .map(normalizeStatus)
    .filter(Boolean);
  const excludeStatuses = (payload.excludeStatuses ?? parseListEnv(Deno.env.get("REMINDER_EXCLUDE_STATUSES"), ["Completada", "Devuelta"]))
    .map(normalizeStatus)
    .filter(Boolean);
  const dryRun = Boolean(payload.dryRun ?? false);
  const notificationType = String(payload.notificationType ?? `daily_task_${reminderRule}`).trim();

  const todayParts = getBogotaDateParts(new Date(), timeZone);
  const todayUtc = new Date(`${todayParts.isoDate}T00:00:00.000Z`);

  try {
    const items = await loadReminderTasks(supabase);
    const candidates = items.filter(({ task, recipients }) =>
      recipients.length > 0 &&
      shouldNotifyTask({
        task,
        todayUtc,
        rule: reminderRule,
        includeStatuses,
        excludeStatuses,
        upcomingDays,
      })
    );

    const summary = {
      scannedTasks: items.length,
      candidateTasks: candidates.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      dryRun,
      reminderRule,
      notificationType,
      notificationDate: todayParts.isoDate,
      timeZone,
      provider: MAIL_PROVIDER,
    };

    const results: Array<Record<string, unknown>> = [];

    for (const item of candidates) {
      for (const recipient of item.recipients) {
        const alreadySent = await hasSentNotificationToday({
          supabase,
          taskId: item.task.id,
          notificationType,
          notificationDate: todayParts.isoDate,
          recipientEmail: recipient.email,
        });

        if (alreadySent) {
          summary.skipped += 1;
          results.push({
            taskId: item.task.id,
            email: recipient.email,
            status: "skipped",
            reason: "duplicate_sent_today",
          });
          continue;
        }

        const subject = buildReminderSubject(item.task, reminderRule);
        const html = buildReminderHtml({
          recipient,
          task: item.task,
          rule: reminderRule,
          timeZone,
          appUrl: APP_BASE_URL,
        });

        if (dryRun) {
          summary.skipped += 1;
          results.push({
            taskId: item.task.id,
            email: recipient.email,
            status: "dry_run",
            subject,
          });
          continue;
        }

        try {
          await sendEmail({
            to: recipient.email,
            subject,
            html,
          });

          await insertNotificationLog(supabase, {
            task_id: item.task.id,
            notification_type: notificationType,
            notification_date: todayParts.isoDate,
            recipient_email: recipient.email,
            provider: MAIL_PROVIDER,
            status: "sent",
            metadata: {
              reminderRule,
              taskName: item.task.taskName,
              taskCode: item.task.taskCode,
              taskState: item.task.estado,
            },
          });

          summary.sent += 1;
          results.push({
            taskId: item.task.id,
            email: recipient.email,
            status: "sent",
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          await insertNotificationLog(supabase, {
            task_id: item.task.id,
            notification_type: notificationType,
            notification_date: todayParts.isoDate,
            recipient_email: recipient.email,
            provider: MAIL_PROVIDER,
            status: "failed",
            metadata: {
              reminderRule,
              taskName: item.task.taskName,
              taskCode: item.task.taskCode,
              taskState: item.task.estado,
            },
            error_message: message,
          });

          summary.failed += 1;
          results.push({
            taskId: item.task.id,
            email: recipient.email,
            status: "failed",
            error: message,
          });
        }
      }
    }

    return jsonResponse({ summary, results });
  } catch (error) {
    console.error("[daily-task-reminders]", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Error interno procesando recordatorios." },
      500
    );
  }
});
