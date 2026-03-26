import React, { useState } from "react";
import "./RelatorioE01.css";
import "./_relatorioBase.css";

import { relatoriosService } from "../../api/relatoriosService";
import { useEmpresa } from "../../context/EmpresaContext";
import { brl, int } from "../../utils/format";
import { todayISO } from "../../utils/dates";
import { EmpresaSelecao } from "../EmpresaSelecao/EmpresaSelecao";

export function RelatorioE01({ exibirFiltro }) {
  const { empresa, setEmpresa } = useEmpresa();

  const [inicio, setInicio] = useState(todayISO());
  const [fim, setFim] = useState(todayISO());
  const [modoExibicao, setModoExibicao] = useState(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const params = { empresaId: empresa?.id, inicio, fim, modoExibicao };

  const gerar = async () => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    setLoading(true);
    try {
      const res = await relatoriosService.obterE01(params);
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
      const blob = await relatoriosService.exportarE01(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Relatorio-E01.xlsx";
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
              <h3>{item.fornecedor || item.nomeFornecedor || "NF Entrada"}</h3>
              <ul>
                <li><strong>Número:</strong> {item.numero}</li>
                <li><strong>Emissão:</strong> {item.dataEmissao}</li>
                <li><strong>Total:</strong> {brl(item.valorTotal)}</li>
                <li><strong>Itens:</strong> {int(item.qtdItens)}</li>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Número</th>
                <th>Emissão</th>
                <th>Total</th>
                <th>Itens</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.fornecedor || item.nomeFornecedor}</td>
                  <td>{item.numero}</td>
                  <td>{item.dataEmissao}</td>
                  <td>{brl(item.valorTotal)}</td>
                  <td>{int(item.qtdItens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
