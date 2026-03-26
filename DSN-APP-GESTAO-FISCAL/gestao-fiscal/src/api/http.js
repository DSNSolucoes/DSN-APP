import { environment } from "../environment";
import { loadingService } from "../services/loadingService";
import { getToken, isTokenExpired, notifyAuthExpired, clearAuth } from "../auth/authStorage";

const BASE_URL = environment.urlAPI;

/**
 * Helpers genéricos para chamadas HTTP via fetch, com:
 * - Authorization Bearer (auth_token)
 * - verificação de expiração do JWT (claim exp)
 * - loading global (overlay)
 */
async function request(path, { method = "GET", headers = {}, body, auth = true, skipLoading = false } = {}) {
  if (!skipLoading) loadingService.inc();

  try {
    const token = getToken();

    if (auth && token) {
      if (isTokenExpired(token)) {
        clearAuth();
        notifyAuthExpired();
        const err = new Error("TOKEN_EXPIRED");
        err.status = 401;
        err.code = "TOKEN_EXPIRED";
        throw err;
      }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(text || `HTTP ${res.status}`);
      err.status = res.status;

      if (res.status === 401 && auth) {
        clearAuth();
        notifyAuthExpired();
      }
      throw err;
    }

    return res;
  } finally {
    if (!skipLoading) loadingService.dec();
  }
}

export async function getJson(path, opts = {}) {
  const res = await request(path, {
    ...opts,
    method: "GET",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  // tenta json; se vazio, retorna null
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function postJson(path, payload, opts = {}) {
  const res = await request(path, {
    ...opts,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: JSON.stringify(payload ?? {}),
  });
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getBlob(path, opts = {}) {
  const res = await request(path, { ...opts, method: "GET" });
  return res.blob();
}
