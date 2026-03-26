import { apiClient } from "./apiClient";

function q(params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * AJUSTE OS ENDPOINTS ABAIXO conforme seu backend.
 * O objetivo aqui é manter a organização e padronização.
 */
export const relatoriosService = {
  // V50
  obterV50: (params) => apiClient.get(`relatorios/v50${q(params)}`),
  exportarV50: (params) => apiClient.getBlob(`relatorios/v50/exportar${q(params)}`),

  // V50 Agrupado
  obterV50Agrupado: (params) => apiClient.get(`relatorios/v50-agrupado${q(params)}`),
  exportarV50Agrupado: (params) => apiClient.getBlob(`relatorios/v50-agrupado/exportar${q(params)}`),

  // E01
  obterE01: (params) => apiClient.get(`relatorios/e01${q(params)}`),
  exportarE01: (params) => apiClient.getBlob(`relatorios/e01/exportar${q(params)}`),

  // F04
  obterF04Agrupado: (params) => apiClient.get(`relatorios/f04/agrupado${q(params)}`),
  obterF04Detalhado: (params) => apiClient.get(`relatorios/f04/detalhado${q(params)}`),
  exportarF04: (params) => apiClient.getBlob(`relatorios/f04/exportar${q(params)}`),

  // P900
  obterP900: (params) => apiClient.get(`relatorios/p900${q(params)}`),
  exportarP900: (params) => apiClient.getBlob(`relatorios/p900/exportar${q(params)}`),
};
