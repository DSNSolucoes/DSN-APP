import React, { useMemo, useState } from "react";
import "./RelatoriosPage.css";

import { RelatorioV50 } from "../../components/Relatorios/RelatorioV50";
import { RelatorioV50Agrupado } from "../../components/Relatorios/RelatorioV50Agrupado";
import { RelatorioE01 } from "../../components/Relatorios/RelatorioE01";
import { RelatorioF04 } from "../../components/Relatorios/RelatorioF04";
import { RelatorioP900 } from "../../components/Relatorios/RelatorioP900";

export function RelatoriosPage() {
  const [relatorioId, setRelatorioId] = useState(1);
  const [exibirFiltro, setExibirFiltro] = useState(true);

  const options = useMemo(
    () => [
      { id: 1, label: "Selecione um Relatório" },
      { id: 50, label: "V50 - Vendas no Período (Produtos)" },
      { id: 501, label: "V50 - Vendas no Período (Agrupado)" },
      { id: 2, label: "E01 - Entrada de NF no Período" },
      { id: 304, label: "F04 - Ranking de Fornecedores" },
      { id: 900, label: "P900 - Estoque" },
    ],
    []
  );

  return (
    <div className="relatorios-page">
      <div className="relatorios-top card">
        <div className="relatorios-select">
          <label>Selecione um Relatório:</label>
          <select value={relatorioId} onChange={(e) => setRelatorioId(Number(e.target.value))}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button className="btn" type="button" onClick={() => setExibirFiltro((v) => !v)}>
          {exibirFiltro ? "Ocultar Filtro" : "Mostrar Filtro"}
        </button>
      </div>

      {relatorioId === 50 && <RelatorioV50 exibirFiltro={exibirFiltro} />}
      {relatorioId === 501 && <RelatorioV50Agrupado exibirFiltro={exibirFiltro} />}
      {relatorioId === 2 && <RelatorioE01 exibirFiltro={exibirFiltro} />}
      {relatorioId === 304 && <RelatorioF04 exibirFiltro={exibirFiltro} />}
      {relatorioId === 900 && <RelatorioP900 exibirFiltro={exibirFiltro} />}

      {relatorioId === 1 && (
        <div className="card relatorios-hint">
          <p className="muted">Escolha um relatório acima para começar.</p>
        </div>
      )}
    </div>
  );
}
