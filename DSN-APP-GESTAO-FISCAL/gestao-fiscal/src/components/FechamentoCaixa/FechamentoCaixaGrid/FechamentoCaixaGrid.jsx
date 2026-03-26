// src/components/FechamentoCaixa/FechamentoCaixaGrid/FechamentoCaixaGrid.jsx
import React, { useMemo } from "react";
import "./FechamentoCaixaGrid.css";

import { CaixaCard } from "../CaixaCard/CaixaCard";
import { SomatorioCard } from "../SomatorioCard/SomatorioCard";

/**
 * Grid que renderiza N cards (um por caixa) + 1 card de somatório.
 */
export function FechamentoCaixaGrid({ caixas = [], onAddDetalhe }) {
  const somatorio = useMemo(() => {
    /** @type {Record<string, number>} */
    const acc = {};

    (caixas || []).forEach((cx) => {
      (cx?.valores || []).forEach((v) => {
        const key = v?.tipoValorCaixa?.descricao || "(Sem tipo)";
        const val = Number(v?.valorTotal ?? 0);
        acc[key] = (acc[key] ?? 0) + (Number.isFinite(val) ? val : 0);
      });
    });

    return Object.entries(acc)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value }));
  }, [caixas]);

  return (
    <section className="fechamento-grid">
      {(caixas || []).map((caixa) => (
        <CaixaCard key={caixa.id} caixa={caixa} onAddDetalhe={onAddDetalhe} />
      ))}

      <SomatorioCard items={somatorio} />
    </section>
  );
}
