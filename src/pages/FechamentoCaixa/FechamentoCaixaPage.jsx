import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./FechamentoCaixaPage.css";

import { FechamentoCaixaGrid } from "../../components/FechamentoCaixa/FechamentoCaixaGrid/FechamentoCaixaGrid";
import { mapFechamentoCaixaResponse } from "../../models/FechamentoCaixa/FechamentoCaixaModels";
import { api } from "../../api";
import { EmpresaSelecao } from "../../components/EmpresaSelecao/EmpresaSelecao";
import { MovimentacaoDetalheModal } from "../../components/FechamentoCaixa/MovimentacaoDetalheModal/MovimentacaoDetalheModal";
import { FechamentoCaixaPrint } from "../../components/FechamentoCaixa/FechamentoCaixaPrint/FechamentoCaixaPrint";
import { FechamentoCaixaResumoMensal } from "../../components/FechamentoCaixa/FechamentoCaixaResumoMensal/FechamentoCaixaResumoMensal";

function formatarData(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function obterAnoMes(dataIso) {
  if (!dataIso) return { ano: 0, mes: 0 };
  const [ano, mes] = dataIso.split("-");
  return {
    ano: Number(ano),
    mes: Number(mes),
  };
}

export function FechamentoCaixaPage({ data }) {
  const [remoteData, setRemoteData] = useState(null);
  const [resumoMensal, setResumoMensal] = useState([]);
  const [loadingResumoMensal, setLoadingResumoMensal] = useState(false);
  const [error, setError] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(formatarData(new Date()));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCtx, setModalCtx] = useState(null);

  const [printMode, setPrintMode] = useState(null);

  const empresaId = empresaSelecionada?.id ?? null;

  const carregarCaixas = useCallback(async () => {
    if (!empresaId) {
      setRemoteData([]);
      return;
    }

    setError("");
    setRemoteData([]);

    const params = new URLSearchParams({
      lojaId: String(empresaId),
      data: dataSelecionada,
    });

    try {
      const res = await api.get(`Caixa?${params.toString()}`);
      setRemoteData(res ?? []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar /Caixa");
      setRemoteData([]);
    }
  }, [empresaId, dataSelecionada]);

  const carregarResumoMensal = useCallback(async () => {
    if (!empresaId) {
      setResumoMensal([]);
      return;
    }

    const { ano, mes } = obterAnoMes(dataSelecionada);

    if (!ano || !mes) {
      setResumoMensal([]);
      return;
    }

    setLoadingResumoMensal(true);
    setResumoMensal([]);

    const params = new URLSearchParams({
      lojaId: String(empresaId),
      ano: String(ano),
      mes: String(mes),
    });

    try {
      const res = await api.get(`Caixa/resumo-mensal?${params.toString()}`);
      setResumoMensal(res ?? []);
    } catch (e) {
      console.error(e);
      setResumoMensal([]);
    } finally {
      setLoadingResumoMensal(false);
    }
  }, [empresaId, dataSelecionada]);

  useEffect(() => {
    if (data !== undefined) return;
    carregarCaixas();
  }, [data, carregarCaixas]);

  useEffect(() => {
    if (data !== undefined) return;
    carregarResumoMensal();
  }, [data, carregarResumoMensal]);

  const caixas = useMemo(() => {
    const src = data !== undefined ? data : remoteData;
    if (src === null) return [];
    return mapFechamentoCaixaResponse(src);
  }, [data, remoteData]);

  const caixasFiltradas = useMemo(() => caixas, [caixas]);

  function handleAddDetalhe({ caixaId, valorId }) {
    const caixa = caixas.find((c) => c.id === caixaId);
    const valorCaixa = caixa?.valores?.find((v) => v.id === valorId);

    if (!caixa || !valorCaixa) return;

    setModalCtx({
      caixa,
      valorCaixa,
      dataSelecionada,
    });

    setModalOpen(true);
  }

  async function handleSaved() {
    await carregarCaixas();
    await carregarResumoMensal();
  }

  function handlePrint(mode) {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(null), 200);
    }, 50);
  }

   return (
  <div className="page">
    <header className="page-header caixa-header">
      <div className="caixa-header__info">
        <h2>Controle de Caixa</h2>
        <p className="muted">
          Selecione a empresa e a data para visualizar o caixa.
        </p>
      </div>

     <div className="caixa-filtros">
  <div className="caixa-filtros__empresa"> 
    <EmpresaSelecao
      empresaSelecionadaId={empresaId}
      onChangeEmpresa={setEmpresaSelecionada}
    />
  </div>

  {empresaId && (
    <div className="caixa-filtros__data">
      <span className="caixa-filtros__label">Data</span>
      <input
        type="date"
        className="caixa-filtros__date-input"
        value={dataSelecionada}
        onChange={(e) => setDataSelecionada(e.target.value)}
      />
    </div>
  )}
</div>

      {!data && !empresaId && (
        <p className="caixa-hint">Selecione uma empresa para habilitar a busca.</p>
      )}
      {error && <p className="caixa-erro">{error}</p>}

      <div className="no-print caixa-acoes">
        <button
          type="button"
          className="btn"
          disabled={!caixasFiltradas.length}
          onClick={() => handlePrint("simple")}
        >
          Imprimir planilha
        </button>
        <button
          type="button"
          className="btn"
          disabled={!caixasFiltradas.length}
          onClick={() => handlePrint("detail")}
        >
          Imprimir com detalhes
        </button>
      </div>
    </header>

    <FechamentoCaixaGrid
      caixas={caixasFiltradas}
      onAddDetalhe={handleAddDetalhe}
    />

    <section className="caixa-resumo-mensal">
      {loadingResumoMensal ? (
        <p>Carregando resumo mensal...</p>
      ) : !resumoMensal.length ? (
        <FechamentoCaixaResumoMensal itens={[]} />
      ) : (
        <FechamentoCaixaResumoMensal itens={resumoMensal} />
      )}
    </section>

    {printMode && (
      <div className="print-only">
        <FechamentoCaixaPrint
          caixas={caixasFiltradas}
          mode={printMode}
          empresaNome={empresaSelecionada?.descricao || empresaSelecionada?.nome || ""}
        />
      </div>
    )}

    <MovimentacaoDetalheModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      empresaId={empresaId}
      caixa={modalCtx?.caixa ?? null}
      valorCaixa={modalCtx?.valorCaixa ?? null}
      dataSelecionada={modalCtx?.dataSelecionada ?? dataSelecionada}
      onSaved={handleSaved}
    />
  </div>
);
}