// src/components/FechamentoCaixa/CaixaCard/CaixaCard.jsx
import React, { useMemo, useState } from "react";
import "./CaixaCard.css";

import { GridGenerico } from "../../grid/GridGenerico";
import { dateBrPipe } from "../../../utils/pipes/datePipe";

function formatMoneyBR(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatMoneyCell(value) {
  return `R$ ${formatMoneyBR(value)}`;
}

export function CaixaCard({ caixa, onAddDetalhe }) {
  const [expanded, setExpanded] = useState(() => ({}));

  const valores = caixa?.valores || [];

  const detalhesColumns = useMemo(
    () => [
      { descricaoColunaGrid: "Descrição", colunaOrdenacao: "descricao", tamanho: 35, className: "wrap" },
      { descricaoColunaGrid: "Valor", colunaOrdenacao: "valor", tamanho: 15 },
      { descricaoColunaGrid: "Funcionário", colunaOrdenacao: "nomeFuncionario", tamanho: 25, className: "wrap" },
      { descricaoColunaGrid: "Realização", colunaOrdenacao: "dataRealizacao", tamanho: 25, className: "wrap" },
    ],
    []
  );

  const renderDetalheCell = (row, col) => {
    const key = col.colunaOrdenacao;

    if (key === "descricao") {
      const text = row?.descricao || "-";
      return (
        <span className="cell-ellipsis" title={text}>
          {text}
        </span>
      );
    }

    if (key === "valor") {
      const text = formatMoneyCell(row?.valor);
      return <span title={text}>{text}</span>;
    }

    if (key === "nomeFuncionario") {
      const text = row?.nomeFuncionario || "-";
      return (
        <span className="cell-ellipsis" title={text}>
          {text}
        </span>
      );
    }

    if (key === "dataRealizacao") {
      const text = dateBrPipe(row?.dataRealizacao, { withTime: true }) || "-";
      return <span title={text}>{text}</span>;
    }

    const fallback = row?.[key] ?? "";
    return <span title={String(fallback)}>{fallback}</span>;
  };

  function toggleExpand(valorId) {
    setExpanded((prev) => ({ ...prev, [valorId]: !prev[valorId] }));
  }

  return (
    <div className="card caixa-card">
      <div className="caixa-card__header">
        <div> 
          <h3 className="caixa-card__title">{caixa?.descricao || `#${caixa?.id ?? "-"}`}</h3>
        </div> 
      </div>

      <div className="caixa-card__rows">
        {valores.length === 0 ? (
          <p className="muted">Nenhum valor encontrado para este caixa.</p>
        ) : (
          valores.map((v) => {
            const isOpen = Boolean(expanded[v.id]);
            const arrow = isOpen ? "▾" : "▸";

            return (
              <div key={v.id} className="caixa-card__rowwrap">
                <div className="caixa-row">
                  <button
                    type="button"
                    className="caixa-row__expand"
                    onClick={() => toggleExpand(v.id)}
                    aria-label={isOpen ? "Recolher detalhes" : "Expandir detalhes"}
                    title={isOpen ? "Recolher" : "Expandir"}
                  >
                    {arrow}
                  </button>

                  <div className="caixa-row__label">
                    {v?.tipoValorCaixa?.descricao || "(Sem tipo)"}
                  </div>

                  <div className="caixa-row__value" title={`R$ ${formatMoneyBR(v?.valorTotal)}`}>
                    <span className="caixa-row__currency">R$</span>
                    {formatMoneyBR(v?.valorTotal)}
                  </div>

                  <button
                    type="button"
                    className="caixa-row__add"
                    onClick={() => onAddDetalhe?.({ caixaId: caixa.id, valorId: v.id })}
                    aria-label="Adicionar detalhe"
                    title="Adicionar detalhe"
                  >
                    +
                  </button>
                </div>

                {isOpen && (
                  <div className="caixa-row__details">
                    <GridGenerico
                      data={(v?.detalhes || []).map((d) => ({
                        ...d,
                        descricao: d?.descricao ?? "-",
                        valor: Number(d?.valor ?? 0),
                        nomeFuncionario: d?.nomeFuncionario ?? "-",
                        dataRealizacao: d?.dataRealizacao ?? null,
                      }))}
                      keyField="id"
                      columns={detalhesColumns}
                      renderCell={renderDetalheCell}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
