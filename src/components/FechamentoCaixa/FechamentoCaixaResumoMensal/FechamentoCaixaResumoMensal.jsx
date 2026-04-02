import React, { useMemo } from "react";
import "./FechamentoCaixaResumoMensal.css";

function formatMoney(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FechamentoCaixaResumoMensal({ itens = [] }) {
  const totalGeral = useMemo(() => {
    return itens.reduce((acc, item) => acc + Number(item.valorTotalMes || 0), 0);
  }, [itens]);

  return (
    <section className="caixa-resumo-mensal-card">
      <div className="caixa-resumo-mensal-card__top">
        <div> 
          <h3 className="caixa-resumo-mensal-card__title">Total mensal</h3>
        </div>

        <div className="caixa-resumo-mensal-card__total">
          {formatMoney(totalGeral)}
        </div>
      </div>

      <div className="caixa-resumo-mensal-card__list">
        {!itens.length ? (
          <div className="caixa-resumo-mensal-card__empty">
            Nenhum dado encontrado para o mês.
          </div>
        ) : (
          itens.map((item) => (
            <div className="caixa-resumo-mensal-card__row" key={item.caixaId}>
              <span className="caixa-resumo-mensal-card__label">
                {item.descricaoCaixa}
              </span>
              <span className="caixa-resumo-mensal-card__value">
                {formatMoney(item.valorTotalMes)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}