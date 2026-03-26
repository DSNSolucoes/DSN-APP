import { environment } from '../environment';
import { loadingService } from '../services/loadingService';

const BASE_URL = environment.urlAPI;

function buildUrl(path) {
  // mantém padrão do seu comboService: BASE_URL + path (sem barra)
  return BASE_URL + path;
}

async function getJson(path) {
  const url = buildUrl(path);
  const token = localStorage.getItem('auth_token');

  loadingService.inc();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erro na requisição: ${response.status}`);
    }

    return response.json();
  } finally {
    loadingService.dec();
  }
}

async function getBlob(path) {
  const url = buildUrl(path);
  const token = localStorage.getItem('auth_token');

  loadingService.inc();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erro na requisição: ${response.status}`);
    }

    return response.blob();
  } finally {
    loadingService.dec();
  }
}

function q(params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/**
 * AJUSTE OS ENDPOINTS ABAIXO conforme seu backend.
 * Mantive um padrão consistente:
 * - obterX -> JSON
 * - exportarX -> Blob (Excel/PDF)
 */
export const relatoriosService = {
  // V50
  obterV50: (params) => getJson(`relatorios/v50${q(params)}`),
  exportarV50: (params) => getBlob(`relatorios/v50/exportar${q(params)}`),

  // V50 Agrupado
  obterV50Agrupado: (params) => getJson(`relatorios/v50-agrupado${q(params)}`),
  exportarV50Agrupado: (params) => getBlob(`relatorios/v50-agrupado/exportar${q(params)}`),

  // E01
  obterE01: (params) => getJson(`relatorios/e01${q(params)}`),
  exportarE01: (params) => getBlob(`relatorios/e01/exportar${q(params)}`),

  // F04
  obterF04Agrupado: (params) => getJson(`relatorios/f04/agrupado${q(params)}`),
  obterF04Detalhado: (params) => getJson(`relatorios/f04/detalhado${q(params)}`),
  exportarF04: (params) => getBlob(`relatorios/f04/exportar${q(params)}`),

  // P900
  obterP900: (params) => getJson(`RelatorioP900${q(params)}`),
  exportarP900: (params) => getBlob(`RelatorioP900/exportar${q(params)}`),
};
