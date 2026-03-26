import React, { useEffect, useState } from "react";
import "./RelatorioV50.css";
import "./_relatorioBase.css";

import { obterGrupoProdutos, obterFornecedores } from "../../api/comboService";
import { relatoriosService } from "../../api/relatoriosService";
import { useEmpresa } from "../../context/EmpresaContext";
import { brl, int, num } from "../../utils/format";
import { todayISO } from "../../utils/dates";
import { EmpresaSelecao } from "../EmpresaSelecao/EmpresaSelecao";

export function RelatorioV50({ exibirFiltro }) {
  const { empresa, setEmpresa } = useEmpresa();

  const [grupos, setGrupos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [grupoId, setGrupoId] = useState(0);
  const [fornecedorId, setFornecedorId] = useState(0);

  const [ordenacao, setOrdenacao] = useState(2);
  const [ascDesc, setAscDesc] = useState("asc");

  const [inicio, setInicio] = useState(todayISO());
  const [fim, setFim] = useState(todayISO());

  const [modoExibicao, setModoExibicao] = useState(2); // 1 grid, 2 card
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!empresa?.id) return;
    (async () => {
      try {
        const [g, f] = await Promise.all([
          obterGrupoProdutos(empresa.id),
          obterFornecedores(empresa.id),
        ]);
        setGrupos(g || []);
        setFornecedores(f || []);
      } catch (e) {
        setErro(e.message || "Erro ao carregar combos");
      }
    })();
  }, [empresa?.id]);

  const params = {
    empresaId: empresa?.id,
    grupoId,
    fornecedorId,
    inicio,
    fim,
    ordenacao,
    ascDesc,
    modoExibicao,
  };

  const gerar = async () => {
    if (!empresa?.id) {
      setErro("Selecione uma empresa.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const res = await relatoriosService.obterV50(params);
      setData(res || []);
    } catch (e) {
      setErro(e.message || "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const exportar = async () => {
    if (!empresa?.id) {
      setErro("Selecione uma empresa.");
      return;
    }
    setErro("");
    try {
      const blob = await relatoriosService.exportarV50(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Relatorio-V50.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(e.message || "Erro ao exportar");
    }
  };

  return (
    <div className="relatorio">
      <div className="relatorio-empresa">
        <EmpresaSelecao
          empresaSelecionadaId={empresa?.id}
          onChangeEmpresa={(emp) => setEmpresa(emp)}
        />
      </div>

      {exibirFiltro && (
        <div className="relatorio-filtros">
          <div className="grid-2">
            <div>
              <label>Grupo</label>
              <select value={grupoId} onChange={(e) => setGrupoId(Number(e.target.value))}>
                <option value={0}>Todos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.descricao || g.nome || g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Fornecedor</label>
              <select value={fornecedorId} onChange={(e) => setFornecedorId(Number(e.target.value))}>
                <option value={0}>Todos</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.descricao || f.nome || f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label>Ordenação</label>
              <select value={ordenacao} onChange={(e) => setOrdenacao(Number(e.target.value))}>
                <option value={2}>Cód Fornecedor</option>
                <option value={3}>Descrição</option>
                <option value={13}>SubTotal</option>
                <option value={16}>% Vendido Total</option>
              </select>
            </div>

            <div>
              <label>Asc / Desc</label>
              <select value={ascDesc} onChange={(e) => setAscDesc(e.target.value)}>
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label>Início</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div>
              <label>Fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>

            <div className="actions">
              <button className="primary" onClick={gerar} disabled={loading}>
                {loading ? "Gerando..." : "Gerar Relatório"}
              </button>
              <button className="secondary" onClick={exportar}>
                Exportar
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label>Modo Exibição</label>
              <select value={modoExibicao} onChange={(e) => setModoExibicao(Number(e.target.value))}>
                <option value={1}>Grid</option>
                <option value={2}>Card</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {erro && <p className="erro">{erro}</p>}

      {modoExibicao === 2 ? (
        <div className="cards">
          {data.map((item, idx) => (
            <div className="card rel-card" key={idx}>
              <h3>{item.nomeProduto || item.descricao || "Produto"}</h3>
              <ul>
                <li>
                  <strong>Cód de Barras:</strong> {item.codBarras} |{" "}
                  <strong>Cód do Fornecedor:</strong> {item.codProdFornec}
                </li>
                <li><strong>Valor Unitário:</strong> {brl(item.valorUnitario)}</li>
                <li><strong>IPI:</strong> {num(item.ipi)}% | <strong>ST:</strong> {num(item.st)}%</li>
                <li><strong>Preço de Custo:</strong> {brl(item.precoCusto)}</li>
                <li><strong>Qtd Venda:</strong> {int(item.quantidadeTotal)}</li>
                <li><strong>Estoque Atual:</strong> {int(item.estoqueAtual)}</li>
                <li><strong>SubTotal Vendas:</strong> {brl(item.valorTotal)}</li>
                <li><strong>Markup:</strong> {num(item.markup)}%</li>
                <li><strong>% Vendido Total:</strong> {num(item.percentualvendido)}%</li>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Cód Barras</th>
                <th>Cód Fornec</th>
                <th>Vlr Unit</th>
                <th>IPI</th>
                <th>ST</th>
                <th>Preço Custo</th>
                <th>Qtd</th>
                <th>Estoque</th>
                <th>SubTotal</th>
                <th>Markup</th>
                <th>% Vendido</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nomeProduto}</td>
                  <td>{item.codBarras}</td>
                  <td>{item.codProdFornec}</td>
                  <td>{brl(item.valorUnitario)}</td>
                  <td>{num(item.ipi)}%</td>
                  <td>{num(item.st)}%</td>
                  <td>{brl(item.precoCusto)}</td>
                  <td>{int(item.quantidadeTotal)}</td>
                  <td>{int(item.estoqueAtual)}</td>
                  <td>{brl(item.valorTotal)}</td>
                  <td>{num(item.markup)}%</td>
                  <td>{num(item.percentualvendido)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
