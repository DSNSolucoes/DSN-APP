// src/api/endpointsConfig.js

// Aqui simulamos endpoints que viriam do banco (config por aba)
export const endpointsConfig = {
  fiscal: {
    empresas: '/api/fiscal/empresas',
    dadosEmpresa: (empresaId) => `/api/fiscal/empresas/${empresaId}/fiscal`
  },
  nfce: {
    empresas: '/api/nfce/empresas',
    dadosEmpresa: (empresaId) => `/api/nfce/empresas/${empresaId}/resumo`
  },
  produtos: {
    empresas: '/api/produtos/empresas',
    dadosEmpresa: (empresaId) => `/api/produtos/empresas/${empresaId}/lista`
  },
  relatorio: {
    empresas: '/api/relatorio/empresas',
    dadosEmpresa: (empresaId) => `/api/relatorio/empresas/${empresaId}/dados`
  },
  faturamento: {
    empresas: '/api/faturamento/empresas',
    dadosEmpresa: (empresaId) =>
      `/api/faturamento/empresas/${empresaId}/resumo`
  },
  financeiro: {
    empresas: '/api/financeiro/empresas',
    dadosEmpresa: (empresaId) =>
      `/api/financeiro/empresas/${empresaId}/painel`
  }
};
