import React, { useState } from "react";
import "./RelatorioV50Agrupado.css";
import "./_relatorioBase.css";

import { relatoriosService } from "../../api/relatoriosService";
import { useEmpresa } from "../../context/EmpresaContext";
import { brl, int, num } from "../../utils/format";
import { todayISO } from "../../utils/dates";
import { EmpresaSelecao } from "../EmpresaSelecao/EmpresaSelecao";

export function RelatorioV50Agrupado({ exibirFiltro }) {
  const { empresa, setEmpresa } = useEmpresa();

  const [inicio, setInicio] = useState(todayISO());
  const [fim, setFim] = useState(todayISO());
  const [ordenacao, setOrdenacao] = useState(2);
  const [ascDesc, setAscDesc] = useState("asc");
  const [modoExibicao, setModoExibicao] = useState(2);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const params = { empresaId: empresa?.id, inicio, fim, ordenacao, ascDesc, modoExibicao };

  const gerar = async () => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    setLoading(true);
    try {
      const res = await relatoriosService.obterV50Agrupado(params);
      setData(res || []);
    } catch (e) {
      setErro(e.message || "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const exportar = async () => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    try {
      const blob = await relatoriosService.exportarV50Agrupado(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Relatorio-V50-Agrupado.xlsx";
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
        <EmpresaSelecao empresaSelecionadaId={empresa?.id} onChangeEmpresa={setEmpresa} />
      </div>

      {exibirFiltro && (
        <div className="relatorio-filtros">
          <div className="grid-2">
            <div>
              <label>Ordenação</label>
              <select value={ordenacao} onChange={(e) => setOrdenacao(Number(e.target.value))}>
                <option value={2}>Fornecedor</option>
                <option value={3}>Descrição</option>
                <option value={13}>SubTotal</option>
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
              <h3>{item.descricao || item.nomeFornecedor || "Item"}</h3>
              <ul>
                <li><strong>Qtd:</strong> {int(item.quantidadeTotal)}</li>
                <li><strong>Total:</strong> {brl(item.valorTotal)}</li>
                <li><strong>%:</strong> {num(item.percentual || item.percentualvendido)}%</li>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.descricao || item.nomeFornecedor}</td>
                  <td>{int(item.quantidadeTotal)}</td>
                  <td>{brl(item.valorTotal)}</td>
                  <td>{num(item.percentual || item.percentualvendido)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
