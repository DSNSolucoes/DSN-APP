import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { clearAuth, getSession, getToken, isTokenExpired, setSession, setToken } from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [token, setTokenState] = useState("");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Carrega sessão e token do storage
    const savedSession = getSession();
    const savedToken = getToken();

    if (savedToken && isTokenExpired(savedToken)) {
      clearAuth();
      setSessionState(null);
      setTokenState("");
      setBooting(false);
      return;
    }

    setSessionState(savedSession);
    setTokenState(savedToken);
    setBooting(false);
  }, []);

  useEffect(() => {
    // Se alguma request detectar expiração/401, ela dispara esse evento
    const onExpired = () => {
      clearAuth();
      setSessionState(null);
      setTokenState("");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = async ({ login, senha }) => {
    // 1) pega token
    const tokenResp = await api.authLogin({
      login,
      senha,
      criadoEm: new Date().toISOString(),
    });

    const jwt = tokenResp?.token || "";
    if (!jwt) {
      const err = new Error("TOKEN_NOT_RETURNED");
      err.status = 401;
      throw err;
    }

    setToken(jwt);
    setTokenState(jwt);

    // 2) pega dados da sessão / usuário (seu endpoint antigo)
    const sessionResp = await api.login({
      login,
      senha,
      confimarsenha: "",
      novasenha: "",
    });

    setSession(sessionResp);
    setSessionState(sessionResp);
    return { token: jwt, session: sessionResp };
  };

  const logout = () => {
    clearAuth();
    setSessionState(null);
    setTokenState("");
  };

  const value = useMemo(
    () => ({
      session,
      token,
      booting,
      isAuthenticated: Boolean(token) && !isTokenExpired(token),
      login,
      logout,
    }),
    [session, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
