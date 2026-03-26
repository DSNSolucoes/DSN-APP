const TOKEN_KEY = "auth_token";
const SESSION_KEY = "app_session";

/**
 * Decodifica o payload do JWT (Base64URL) sem validar assinatura.
 * Retorna um objeto com as claims, ou null se inválido.
 */
export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // Base64URL -> Base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");

    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwt(token);
  const exp = payload?.exp; // em segundos
  if (!exp) return false; // se não tiver exp, não bloqueia (mas ideal é ter)
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= exp;
}

/**
 * Dispara um evento global para o app reagir (ex.: logout).
 */
export function notifyAuthExpired() {
  window.dispatchEvent(new CustomEvent("auth:expired"));
}
