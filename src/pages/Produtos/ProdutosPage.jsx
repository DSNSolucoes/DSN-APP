import React, { useEffect, useState } from 'react';
import {
  obterGrupoProdutos,
  obterFornecedores,
  obterProdutos,
} from '../../api/comboService';
import { EmptyState } from '../../components/EmptyState';
import { EmpresaSelecao } from '../../components/EmpresaSelecao/EmpresaSelecao';
import './ProdutosPage.css';

const ORDENACAO_OPTS = [
  { value: 0, label: 'Padrão' },
  { value: 1, label: 'Nome A-Z' },
  { value: 2, label: 'Preço crescente' },
  { value: 3, label: 'Preço decrescente' },
];

function fmt(valor) {
  return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function ProdutosPage() {
  // ── Empresa selecionada ──
  const [empresa, setEmpresa] = useState(null);

  const [grupos, setGrupos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // ── Filtros ──
  const [pesquisa, setPesquisa] = useState('');
  const [grupoId, setGrupoId] = useState(0);
  const [fornecedorId, setFornecedorId] = useState(0);
  const [empresaFornecedor, setEmpresaFornecedor] = useState(0);
  const [ordenacao, setOrdenacao] = useState(0);

  // ── Resultado ──
  const [produtos, setProdutos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const empresaId = empresa?.id ?? null;

  // Recarrega grupos sempre que a empresa selecionada mudar
  useEffect(() => {
    setGrupos([]);
    setGrupoId(0);
    if (!empresaId) return;

    obterGrupoProdutos(empresaId)
      .then((data) => setGrupos(data || []))
      .catch(console.error);
  }, [empresaId]);

  // Recarrega fornecedores quando a empresa do fornecedor mudar
  useEffect(() => {
    setFornecedores([]);
    setFornecedorId(0);
    if (!empresaFornecedor || empresaFornecedor === 0) return;

    obterFornecedores(empresaFornecedor)
      .then((data) => setFornecedores(data || []))
      .catch(console.error);
  }, [empresaFornecedor]);

  async function handleBuscar() {
    if (!empresaId) return;
    setLoading(true);
    setErro(null);
    setBuscado(true);
    try {
      const data = await obterProdutos({
        lojaIds: [empresaId],
        empresaFornecedor,
        pesquisa,
        grupoId,
        fornecedorId,
        ordenacao,
      });
      setProdutos(data || []);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar produtos.');
      setProdutos(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Produtos</h2>
      </header>

      <div className="produtos-filtros">
        <div className="produtos-filtros__row">
          <div className="produtos-filtros__group">
            <span className="produtos-filtros__label">Empresa</span>
            <EmpresaSelecao
              empresaSelecionadaId={empresaId}
              onChangeEmpresa={(emp) => {
                setEmpresa(emp);
                setProdutos(null);
                setBuscado(false);
              }}
            />
          </div>

          <div className="produtos-filtros__group produtos-filtros__busca">
            <span className="produtos-filtros__label">Pesquisa</span>
            <input
              type="text"
              placeholder="Nome do produto ou cód. de barras..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </div>

          <div className="produtos-filtros__group">
            <span className="produtos-filtros__label">Grupo</span>
            <select
              value={grupoId}
              onChange={(e) => setGrupoId(Number(e.target.value))}
              disabled={grupos.length === 0}
            >
              <option value={0}>Todos</option>
              {grupos.map((g) => (
                <option key={g.id ?? g.cdGrupo} value={g.id ?? g.cdGrupo}>
                  {g.nome ?? g.nmGrupo ?? g.descricao}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="produtos-filtros__row">
          <div className="produtos-filtros__group">
            <span className="produtos-filtros__label">Empresa do Fornecedor</span>
            <select
              value={empresaFornecedor}
              onChange={(e) => setEmpresaFornecedor(Number(e.target.value))}
            >
              <option value={0}>Mesma empresa</option>
            </select>
          </div>

          <div className="produtos-filtros__group">
            <span className="produtos-filtros__label">Fornecedor</span>
            <select
              value={fornecedorId}
              onChange={(e) => setFornecedorId(Number(e.target.value))}
              disabled={fornecedores.length === 0}
            >
              <option value={0}>Todos</option>
              {fornecedores.map((f) => (
                <option key={f.cdFornecedor ?? f.id} value={f.cdFornecedor ?? f.id}>
                  {f.nmFornecedor ?? f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="produtos-filtros__group">
            <span className="produtos-filtros__label">Ordenação</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(Number(e.target.value))}
            >
              {ORDENACAO_OPTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            className="produtos-btn"
            onClick={handleBuscar}
            disabled={!empresaId || loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {!empresaId && !buscado && (
        <EmptyState
          title="Selecione uma empresa"
          description="Escolha uma empresa para pesquisar produtos."
        />
      )}

      {buscado && !loading && produtos !== null && produtos.length === 0 && (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Tente alterar os filtros e buscar novamente."
        />
      )}

      {buscado && !loading && produtos !== null && produtos.length > 0 && (
        <>
          <p className="produtos-count">{produtos.length} produto(s) encontrado(s)</p>
          <div className="produtos-table-wrap">
            <table className="produtos-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cód. Barras</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Margem</th>
                  <th>Loja</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.cdProduto ?? p.CdProduto ?? '-'}</td>
                    <td>{p.codBarras ?? p.CodBarras ?? '-'}</td>
                    <td>{p.nmProduto ?? p.NmProduto ?? '-'}</td>
                    <td>R$ {fmt(p.pdvPrecovenda ?? p.PdvPrecovenda ?? 0)}</td>
                    <td>{p.margem ?? p.Margem ?? '-'}</td>
                    <td className="td-loja">{p.nomeLoja ?? p.NomeLoja ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
