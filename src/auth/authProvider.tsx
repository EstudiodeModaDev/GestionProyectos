import * as React from "react";
import type { AccountInfo } from "@azure/msal-browser";
import {
  ensureActiveAccount,
  ensureLogin,
  getApiAccessToken,
  getGraphAccessToken,
  initMSAL,
  isLoggedIn,
  logout,
} from "./msal";

type AuthCtx = {
  ready: boolean;
  account: AccountInfo | null;
  getToken: () => Promise<string>;
  getGraphToken: () => Promise<string>;
  getApiToken: () => Promise<string>;
  signIn: (mode?: "popup" | "redirect") => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = React.useState(false);
  const [account, setAccount] = React.useState<AccountInfo | null>(null);

  React.useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        await initMSAL();
        const activeAccount = ensureActiveAccount();
        if (!cancel) {
          setAccount(activeAccount ?? null);
          setReady(true);
        }
      } catch (error) {
        console.error("[AuthProvider] init error:", error);
        if (!cancel) setReady(true);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const signIn = React.useCallback(async (mode: "popup" | "redirect" = "popup") => {
    const activeAccount = await ensureLogin(mode);
    setAccount(activeAccount);
    setReady(true);
  }, []);

  const signOut = React.useCallback(async () => {
    await logout();
    setAccount(null);
    setReady(true);
  }, []);

  const ensureSession = React.useCallback(() => {
    if (!isLoggedIn()) {
      throw new Error("No hay sesion iniciada. Inicia sesion para continuar.");
    }
  }, []);

  const getGraphToken = React.useCallback(async () => {
    ensureSession();
    return getGraphAccessToken({ interactionMode: "popup", forceSilent: false });
  }, [ensureSession]);

  const getApiToken = React.useCallback(async () => {
    ensureSession();
    return getApiAccessToken({ interactionMode: "popup", forceSilent: false });
  }, [ensureSession]);

  const value = React.useMemo<AuthCtx>(
    () => ({
      ready,
      account,
      getToken: getGraphToken,
      getGraphToken,
      getApiToken,
      signIn,
      signOut,
    }),
    [ready, account, getGraphToken, getApiToken, signIn, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth(): AuthCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
