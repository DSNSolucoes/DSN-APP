import React, { useEffect, useState } from "react";
import "./RelatorioF04.css";
import "./_relatorioBase.css";

import { obterGrupoProdutos, obterFornecedores } from "../../api/comboService";
import { relatoriosService } from "../../api/relatoriosService";
import { useEmpresa } from "../../context/EmpresaContext";
import { brl, int } from "../../utils/format";
import { todayISO } from "../../utils/dates";
import { EmpresaSelecao } from "../EmpresaSelecao/EmpresaSelecao";

export function RelatorioF04({ exibirFiltro }) {
  const { empresa, setEmpresa } = useEmpresa();

  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorId, setFornecedorId] = useState(0);

  const [inicio, setInicio] = useState(todayISO());
  const [fim, setFim] = useState(todayISO());

  const [tipo, setTipo] = useState("agrupado"); // agrupado | detalhado
  const [modoExibicao, setModoExibicao] = useState(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!empresa?.id) return;
    combosService
      .obterFornecedores(empresa.id)
      .then((f) => setFornecedores(f || []))
      .catch(() => {});
  }, [empresa?.id]);

  const params = { empresaId: empresa?.id, fornecedorId, inicio, fim, tipo, modoExibicao };

  const gerar = async () => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    setLoading(true);
    try {
      const res =
        tipo === "detalhado"
          ? await relatoriosService.obterF04Detalhado(params)
          : await relatoriosService.obterF04Agrupado(params);

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
      const blob = await relatoriosService.exportarF04(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Relatorio-F04.xlsx";
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
              <label>Fornecedor (opcional)</label>
              <select value={fornecedorId} onChange={(e) => setFornecedorId(Number(e.target.value))}>
                <option value={0}>Todos</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.descricao || f.nome || f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="agrupado">Agrupado</option>
                <option value="detalhado">Detalhado</option>
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
              <h3>{item.fornecedor || item.nomeFornecedor || "Fornecedor"}</h3>
              <ul>
                <li><strong>Total:</strong> {brl(item.valorTotal)}</li>
                <li><strong>Qtd:</strong> {int(item.quantidadeTotal)}</li>
                {tipo === "detalhado" && (
                  <li><strong>Produto:</strong> {item.produto || item.nomeProduto}</li>
                )}
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
                {tipo === "detalhado" ? <th>Produto</th> : null}
                <th>Quantidade</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.fornecedor || item.nomeFornecedor}</td>
                  {tipo === "detalhado" ? <td>{item.produto || item.nomeProduto}</td> : null}
                  <td>{int(item.quantidadeTotal)}</td>
                  <td>{brl(item.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
