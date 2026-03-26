import { getToken, isTokenExpired, notifyAuthExpired, clearAuth } from "../auth/authStorage";
import { environment } from "../environment";
import { loadingService } from "../services/loadingService";

const BASE_URL = environment.urlAPI;

/**
 * Interceptor simples:
 * - Antes de cada request, verifica validade do JWT (exp).
 * - Se expirou, limpa storage e avisa o app para redirecionar ao /login.
 * - Injeta Authorization: Bearer <token> automaticamente.
 */
async function request(path, { method = "GET", body, auth = true } = {}) {
  loadingService.inc();
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

    const headers = { "Content-Type": "application/json" };
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(text || `HTTP ${res.status}`);
      err.status = res.status;

      // Se backend responder 401, tratamos como sessão inválida
      if (res.status === 401 && auth) {
        clearAuth();
        notifyAuthExpired();
      }
      throw err;
    }

    const text = await res.text().catch(() => "");
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } finally {
    loadingService.dec();
  }
}

export const api = {
  // 1) pega o token
  authLogin: (payload) =>
    request("api/Auth/login", {
      method: "POST",
      body: payload,
      auth: false, // não usa token pra buscar token
    }),

  // 2) login do seu controller atual (retorna dados do usuário / sessão)
  login: (payload) =>
    request("/Login/login", {
      method: "POST",
      body: payload,
      auth: true, // já pode enviar token se quiser
    }),

  trocarSenha: (payload) =>
    request("/Login/trocarsenha", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  // Exemplo: qualquer GET protegido
  get: (path) => request(path, { method: "GET", auth: true }),

  // POST protegido (padrão do projeto)
  post: (path, payload) => request(path, { method: "POST", body: payload, auth: true }),
};
