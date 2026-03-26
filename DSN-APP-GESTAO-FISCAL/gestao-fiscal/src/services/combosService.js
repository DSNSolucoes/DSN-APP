import { apiClient } from "./apiClient";

export const combosService = {
  obterLojas: () => apiClient.get("combos/ObterLojas"),
  obterGrupoProdutos: (lojaId) =>    apiClient.get(`produto/ObterGruposProdutos?lojaId=${encodeURIComponent(lojaId)}`),
  obterFornecedores: (lojaId) =>     apiClient.get(`fornecedor/Obter?lojaId=${encodeURIComponent(lojaId)}`),
};
