// src/components/FechamentoCaixa/FechamentoCaixaPrint/FechamentoCaixaPrint.jsx
import React, { useMemo } from "react";
import "./FechamentoCaixaPrint.css";

function brl(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

function dateBR(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Layout ONLY para impressão (o navegador gera PDF via "Salvar como PDF").
 * mode:
 *  - "detail": imprime detalhes por valor
 *  - "simple": imprime estilo "planilha" (tipo x caixas)
 */
export function FechamentoCaixaPrint({ caixas = [], mode = "simple", empresaNome = "", titulo = "Fechamento de Caixa" }) {
  const caixasCols = useMemo(() => {
    return (caixas || []).map((c) => ({
      id: c.id,
      label: c.descricao || `Caixa ${c.id}`,
    }));
  }, [caixas]);

  const sheetRows = useMemo(() => {
    // Monta uma matriz no formato do print (tipo x caixas)
    // Chave pelo id do tipo de valor para evitar colisão de descrições
    const byTipo = new Map();

    (caixas || []).forEach((c) => {
      (c.valores || []).forEach((v) => {
        const tipoId = v?.tipoValorCaixa?.id ?? "_sem_tipo";
        const tipoDesc = v?.tipoValorCaixa?.descricao || "(Sem tipo)";
        if (!byTipo.has(tipoId)) {
          byTipo.set(tipoId, {
            tipoId,
            descricao: tipoDesc,
            valoresPorCaixa: new Map(),
          });
        }
        const row = byTipo.get(tipoId);
        row.valoresPorCaixa.set(c.id, Number(v?.valorTotal || 0));
      });
    });

    const rows = Array.from(byTipo.values());
    rows.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
    return rows;
  }, [caixas]);

  const somatorioPorTipo = useMemo(() => {
    const acc = new Map();
    caixas.forEach((c) => {
      (c.valores || []).forEach((v) => {
        const key = v?.tipoValorCaixa?.descricao || "(Sem tipo)";
        const prev = acc.get(key) || 0;
        acc.set(key, prev + Number(v?.valorTotal || 0));
      });
    });

    return Array.from(acc.entries())
      .map(([descricao, total]) => ({ descricao, total }))
      .sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
  }, [caixas]);

  return (
    <div className="fcprint">
      <div className="fcprint__header">
        <div>
          <h1 className="fcprint__title">{titulo}</h1>
          {empresaNome ? <div className="fcprint__subtitle">Empresa: {empresaNome}</div> : null}
          <div className="fcprint__subtitle">Modo: {mode === "detail" ? "Com detalhes" : "Simples"}</div>
        </div>
      </div>

      {caixas.map((caixa) => (
        <section key={caixa.id} className="fcprint__section">
          <div className="fcprint__sectionTitle">
            <span>Caixa</span>
            <strong>{caixa.descricao || `Caixa ${caixa.id}`}</strong>
          </div>

          {mode === "simple" ? (
            <div className="fcprint__hint">(Detalhes não exibidos neste modo)</div>
          ) : (
            <div className="fcprint__detailWrap">
              {(caixa.valores || []).map((v) => (
                <div key={v.id} className="fcprint__detailBlock">
                  <div className="fcprint__detailHead">
                    <div>
                      <strong>{v?.tipoValorCaixa?.descricao || "-"}</strong>
                    </div>
                    <div className="fcprint__num">Total: {brl(v?.valorTotal)}</div>
                  </div>

                  <table className="fcprint__table">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Descrição</th>
                        <th style={{ width: "15%" }}>Valor</th>
                        <th style={{ width: "25%" }}>Funcionário</th>
                        <th style={{ width: "20%" }}>Realização</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.detalhes || []).length ? (
                        (v.detalhes || []).map((d) => (
                          <tr key={d.id}>
                            <td>{d?.descricao || "-"}</td>
                            <td className="fcprint__num">{brl(d?.valor)}</td>
                            <td>{d?.nomeFuncionario || "-"}</td>
                            <td>{d?.dataRealizacao ? dateBR(d.dataRealizacao) : "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="fcprint__muted">
                            Sem detalhes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {mode === "simple" ? (
        <section className="fcprint__section">
          <div className="fcprint__sheetTitle">
            <strong>Resumo (formato planilha)</strong>
          </div>
          <table className="fcprint__table fcprint__sheet">
            <thead>
              <tr>
                <th className="fcprint__sticky">Tipo</th>
                {caixasCols.map((c) => (
                  <th key={c.id}>{c.label}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sheetRows.map((r) => {
                const rowTotal = caixasCols.reduce((acc, c) => acc + (r.valoresPorCaixa.get(c.id) || 0), 0);
                return (
                  <tr key={r.tipoId}>
                    <td className="fcprint__sticky">{r.descricao}</td>
                    {caixasCols.map((c) => (
                      <td key={c.id} className="fcprint__num">
                        {brl(r.valoresPorCaixa.get(c.id) || 0)}
                      </td>
                    ))}
                    <td className="fcprint__num fcprint__strong">{brl(rowTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="fcprint__section">
        <div className="fcprint__sectionTitle">
          <strong>Somatório</strong>
        </div>
        <table className="fcprint__table">
          <thead>
            <tr>
              <th style={{ width: "70%" }}>Tipo</th>
              <th style={{ width: "30%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {somatorioPorTipo.map((s) => (
              <tr key={s.descricao}>
                <td>{s.descricao}</td>
                <td className="fcprint__num">{brl(s.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
