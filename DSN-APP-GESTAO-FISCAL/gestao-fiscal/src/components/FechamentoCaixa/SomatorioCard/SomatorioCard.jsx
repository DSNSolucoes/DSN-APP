// src/components/FechamentoCaixa/SomatorioCard/SomatorioCard.jsx
import React, { useMemo } from "react";
import "./SomatorioCard.css";

function formatMoneyBR(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function SomatorioCard({ items = [] }) {
  const totalGeral = useMemo(() => {
    return (items || []).reduce((acc, it) => acc + Number(it?.value ?? 0), 0);
  }, [items]);

  return (
    <div className="card somatorio-card">
      <div className="somatorio-card__header">
        <div>
          <span className="somatorio-card__kicker">Resumo</span>
          <h3 className="somatorio-card__title">Somatório</h3>
        </div>
        <div className="somatorio-card__total" title={`R$ ${formatMoneyBR(totalGeral)}`}>
          <span className="somatorio-card__currency">R$</span>
          {formatMoneyBR(totalGeral)}
        </div>
      </div>

      <div className="somatorio-card__list">
        {(items || []).length === 0 ? (
          <p className="muted">Sem dados para somar.</p>
        ) : (
          (items || []).map((it) => (
            <div key={it.label} className="somatorio-row">
              <span className="somatorio-row__label">{it.label}</span>
              <span className="somatorio-row__value">
                <span className="somatorio-row__currency">R$</span>
                {formatMoneyBR(it.value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
