import { environment } from "../environment";
import { loadingService } from "./loadingService";

const BASE_URL = environment.urlAPI;

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const base = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = base + cleanPath;

  const token = localStorage.getItem("token");

  loadingService.inc();

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
    });

    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();

    if (!res.ok) throw new Error(raw || `Erro ${res.status}`);

    if (contentType.includes("application/json")) return raw ? JSON.parse(raw) : null;
    return raw;
  } finally {
    loadingService.dec();
  }
}

export const apiClient = {
  get: (path) => request(path),
  getBlob: async (path) => {
    const base = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = base + cleanPath;

    const token = localStorage.getItem("token");

    loadingService.inc();

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Erro ${res.status}`);
      }
      return res.blob();
    } finally {
      loadingService.dec();
    }
  },
};
