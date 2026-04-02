// src/api/comboService.js
import { environment } from '../environment';
import { loadingService } from '../services/loadingService';

const BASE_URL = environment.urlAPI;

 
async function getJson(path) {
   
  const url = BASE_URL + path;
 
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
      const mensagem = text || `Erro na requisição: ${response.status}`;
      throw new Error(mensagem);
    }

    return response.json();
  } finally {
    loadingService.dec();
  }
}
 
export async function obterLojas() {
 
  return getJson('combos/ObterLojas');
}
 
export async function obterTerminais(lojaId, data) {
  const filtroData = data ? `&data=${encodeURIComponent(data)}` : '';
  const path = `terminal/Obter?lojaId=${encodeURIComponent(
    lojaId
  )}${filtroData}`;

  const arrayResponse = await getJson(path);
 
  return (arrayResponse || []).map((x) => ({
    valorFiscalTotal: x.valorFiscalTotal,
    valorPedidoTotal: x.valorPedidoTotal,
    lista: Array.isArray(x.lista) ? x.lista : [],
    cfop: Array.isArray(x.cfop) ? x.cfop : []
  }));
}
 
export async function obterGrupoProdutos(lojaId) {
  const path = `produto/ObterGruposProdutos?lojaId=${encodeURIComponent(
    lojaId
  )}`; 
  return getJson(path);
}
 
export async function obterFornecedores(lojaId) {
  const path = `fornecedor/Obter?lojaId=${encodeURIComponent(lojaId)}`;
 
  return getJson(path);
}
 
export async function obterNCM() { 
  return getJson('combos/ObterNCM');
}

// Funcionários por empresa (endpoint informado)
// Esperado: [{ id, nome }]
export async function obterFuncionarios(empresaId) {
  const path = `Funcionario?empresaId=${encodeURIComponent(empresaId)}`;
  return getJson(path);
}

// Produtos com filtros (múltiplas lojas via array)
export async function obterProdutos({ lojaIds = [], empresaFornecedor = 0, pesquisa = '', grupoId = 0, fornecedorId = 0, ordenacao = 0 }) {
  const params = new URLSearchParams();
  lojaIds.forEach((id) => params.append('lojaId', id));
  params.set('empresaFornecedor', empresaFornecedor);
  params.set('pesquisa', pesquisa);
  params.set('grupoId', grupoId);
  params.set('fornecedorId', fornecedorId);
  params.set('ordenacao', ordenacao);
  return getJson(`Produto/Obter?${params.toString()}`);
}
