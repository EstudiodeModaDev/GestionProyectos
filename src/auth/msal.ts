import {
  EventType,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type EventMessage,
  type PopupRequest,
  type RedirectRequest,
  type SilentRequest,
} from "@azure/msal-browser";


const resolveScopes = (rawValue: string | undefined, fallback: readonly string[]) => {
  const parsed = (rawValue ?? "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...fallback];
};

export const LOGIN_SCOPES = ["openid", "profile", "email"] as const;
export const GRAPH_SCOPES = resolveScopes(import.meta.env.VITE_ENTRA_GRAPH_SCOPES, [
  "User.Read",
  "Sites.ReadWrite.All",
  "Directory.Read.All",
]) as readonly string[];
export const API_SCOPES = resolveScopes(import.meta.env.VITE_ENTRA_API_SCOPES, []) as readonly string[];

const DEFAULT_LOGIN_SCOPES = [...LOGIN_SCOPES, ...GRAPH_SCOPES];

export const msal = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        if (message?.includes("msal")) {
          console.debug("[MSAL]", level, message);
        }
      },
      piiLoggingEnabled: false,
    },
  },
});

let initialized = false;
let eventsWired = false;

const loginPopupRequest: PopupRequest = {
  scopes: DEFAULT_LOGIN_SCOPES,
  prompt: "select_account",
};

const loginRedirectRequest: RedirectRequest = {
  scopes: DEFAULT_LOGIN_SCOPES,
  prompt: "select_account",
};

export async function initMSAL(): Promise<void> {
  if (initialized) return;
  await msal.initialize();
  await msal.handleRedirectPromise().catch((error) => {
    console.error("[MSAL] handleRedirectPromise error:", error);
  });
  wireEventsOnce();
  ensureActiveAccount();
  initialized = true;
}

export function ensureActiveAccount(): AccountInfo | null {
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (account) msal.setActiveAccount(account);
  return account;
}

export function isLoggedIn(): boolean {
  return !!(msal.getActiveAccount() ?? msal.getAllAccounts()[0]);
}

export function getAccount(): AccountInfo | null {
  return msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
}

export async function ensureLoginPopup(): Promise<AccountInfo> {
  await initMSAL();
  let account = ensureActiveAccount();

  if (!account) {
    try {
      const response = await msal.loginPopup(loginPopupRequest);
      account = response.account ?? msal.getAllAccounts()[0] ?? null;
      if (account) msal.setActiveAccount(account);
    } catch (error) {
      console.warn("[MSAL] loginPopup fallo, haciendo fallback a redirect...", error);
      await msal.loginRedirect(loginRedirectRequest);
      return new Promise<AccountInfo>(() => {});
    }
  }

  if (!account) {
    throw new Error("No fue posible establecer una cuenta activa despues del login.");
  }

  return account;
}

export async function ensureLoginRedirect(): Promise<AccountInfo> {
  await initMSAL();
  const account = ensureActiveAccount();

  if (!account) {
    await msal.loginRedirect(loginRedirectRequest);
    return new Promise<AccountInfo>(() => {});
  }

  return account;
}

export async function ensureLogin(mode: "popup" | "redirect" = "redirect"): Promise<AccountInfo> {
  return mode === "popup" ? ensureLoginPopup() : ensureLoginRedirect();
}

function ensureConfiguredScopes(scopes: readonly string[], resourceName: string): readonly string[] {
  if (scopes.length === 0) {
    throw new Error(`No hay scopes configurados para ${resourceName}. Revisa tu archivo .env.`);
  }

  return scopes;
}

type TokenRequestOptions = {
  interactionMode?: "popup" | "redirect";
  forceSilent?: boolean;
};

export async function getAccessTokenForScopes(
  scopes: readonly string[],
  opts?: TokenRequestOptions
): Promise<string> {
  await initMSAL();
  const requestedScopes = ensureConfiguredScopes(scopes, "el recurso solicitado");
  const account = ensureActiveAccount();

  if (!account) {
    const mode = opts?.interactionMode ?? "popup";

    if (mode === "popup") {
      try {
        const response = await msal.loginPopup(loginPopupRequest);
        if (response.account) msal.setActiveAccount(response.account);
      } catch {
        await msal.loginRedirect(loginRedirectRequest);
        return new Promise<string>(() => {});
      }
    } else {
      await msal.loginRedirect(loginRedirectRequest);
      return new Promise<string>(() => {});
    }
  }

  const silentReq: SilentRequest = {
    account: ensureActiveAccount()!,
    scopes: [...requestedScopes],
  };

  try {
    const response = await msal.acquireTokenSilent(silentReq);
    return response.accessToken;
  } catch (error) {
    if (opts?.forceSilent) throw error;

    if (error instanceof InteractionRequiredAuthError) {
      const mode = opts?.interactionMode ?? "popup";

      if (mode === "popup") {
        try {
          const response = await msal.acquireTokenPopup({
            scopes: [...requestedScopes],
            account: silentReq.account,
          });
          return response.accessToken;
        } catch (popupError) {
          console.warn("[MSAL] popup bloqueado/cancelado; fallback a redirect para token...", popupError);
          await msal.acquireTokenRedirect({
            scopes: [...requestedScopes],
            account: silentReq.account,
          });
          return new Promise<string>(() => {});
        }
      }

      await msal.acquireTokenRedirect({
        scopes: [...requestedScopes],
        account: silentReq.account,
      });
      return new Promise<string>(() => {});
    }

    throw error;
  }
}

export function getGraphAccessToken(opts?: TokenRequestOptions): Promise<string> {
  return getAccessTokenForScopes(GRAPH_SCOPES, opts);
}

export function getApiAccessToken(opts?: TokenRequestOptions): Promise<string> {
  return getAccessTokenForScopes(
    ensureConfiguredScopes(API_SCOPES, "la API protegida de Supabase"),
    opts
  );
}

export async function logout(): Promise<void> {
  await initMSAL();
  const account = ensureActiveAccount();
  await msal.logoutRedirect({
    account,
    postLogoutRedirectUri: window.location.origin,
  });
}

function wireEventsOnce() {
  if (eventsWired) return;

  msal.addEventCallback((event: EventMessage) => {
    switch (event.eventType) {
      case EventType.LOGIN_SUCCESS: {
        const account = (event.payload as { account?: AccountInfo } | null)?.account;
        if (account) msal.setActiveAccount(account);
        break;
      }
      case EventType.LOGIN_FAILURE:
      case EventType.ACQUIRE_TOKEN_FAILURE:
      case EventType.LOGOUT_FAILURE:
        console.warn("[MSAL] Event error:", event);
        break;
      default:
        break;
    }
  });

  eventsWired = true;
}

export function onMsalEvent(cb: (event: EventMessage) => void): void {
  msal.addEventCallback(cb);
}
