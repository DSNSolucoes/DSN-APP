// src/pages/FechamentoCaixa/FechamentoCaixaPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "./FechamentoCaixaPage.css";

import { Box, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { FechamentoCaixaGrid } from "../../components/FechamentoCaixa/FechamentoCaixaGrid/FechamentoCaixaGrid";
import { mapFechamentoCaixaResponse } from "../../models/FechamentoCaixa/FechamentoCaixaModels";
import { api } from "../../api";
import { EmpresaSelecao } from "../../components/EmpresaSelecao/EmpresaSelecao";
import { MovimentacaoDetalheModal } from "../../components/FechamentoCaixa/MovimentacaoDetalheModal/MovimentacaoDetalheModal";
import { FechamentoCaixaPrint } from "../../components/FechamentoCaixa/FechamentoCaixaPrint/FechamentoCaixaPrint";

dayjs.locale("pt-br");

export function FechamentoCaixaPage({ data }) {
  const [remoteData, setRemoteData] = useState(null);
  const [error, setError] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [competencia, setCompetencia] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCtx, setModalCtx] = useState(null);
  const [printMode, setPrintMode] = useState(null);

  const empresaId = empresaSelecionada?.id ?? null;
  const anoCompetencia = competencia ? competencia.year() : null;
  const mesCompetencia = competencia ? competencia.month() + 1 : null;

  async function ObterCaixas({ empresaId, anoCompetencia, mesCompetencia }) {
    setError("");

    const params = new URLSearchParams({
      empresaId: String(empresaId),
      anoCompetencia: String(anoCompetencia),
      mesCompetencia: String(mesCompetencia),
    });

    const res = await api.get(`Caixa?${params.toString()}`);
    return res ?? [];
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (data !== undefined) return;

      if (!empresaId || !competencia) {
        setRemoteData([]);
        setError("");
        return;
      }

      try {
        const res = await ObterCaixas({
          empresaId,
          anoCompetencia,
          mesCompetencia,
        });

        if (!mounted) return;
        setRemoteData(res ?? []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Erro ao carregar /Caixa");
        setRemoteData([]);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [data, empresaId, competencia, anoCompetencia, mesCompetencia]);

  const caixas = useMemo(() => {
    const src = data !== undefined ? data : remoteData;
    if (src === null) return [];
    return mapFechamentoCaixaResponse(src);
  }, [data, remoteData]);

  function handleAddDetalhe({ caixaId, valorId }) {
    const caixa = caixas.find((c) => c.id === caixaId);
    const valorCaixa = caixa?.valores?.find((v) => v.id === valorId);

    if (!caixa || !valorCaixa) return;

    setModalCtx({ caixa, valorCaixa });
    setModalOpen(true);
  }

  async function handleSaved() {
    if (data !== undefined) return;
    if (!empresaId || !competencia) return;

    try {
      const res = await ObterCaixas({
        empresaId,
        anoCompetencia,
        mesCompetencia,
      });
      setRemoteData(res ?? []);
    } catch (e) {
      setError(e?.message || "Erro ao recarregar /Caixa");
    }
  }

  function handlePrint(mode) {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(null), 200);
    }, 50);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <div className="page">
        <header className="page-header fechamento-header">
          <div className="fechamento-header-main">
            <div>
              <h2>Fechamento de Caixa</h2>
              <p className="muted">
                Selecione a empresa e a competência para visualizar o fechamento.
              </p>
            </div>

            <div className="fechamento-filtros-grid">
              <div className="fechamento-campo">
                <Typography className="fechamento-label">Empresa</Typography>
                <div className="fechamento-empresa-wrap">
                  <EmpresaSelecao
                    empresaSelecionadaId={empresaId}
                    onChangeEmpresa={setEmpresaSelecionada}
                  />
                </div>
              </div>

              <div className="fechamento-campo">
                <DatePicker
                  label="Competência"
                  views={["year", "month"]}
                  openTo="month"
                  value={competencia}
                  onChange={(newValue) => setCompetencia(newValue)}
                  format="MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      className: "fechamento-datepicker",
                    },
                    actionBar: {
                      actions: ["clear", "accept"],
                    },
                    desktopPaper: {
                      className: "fechamento-datepicker-paper",
                    },
                    mobilePaper: {
                      className: "fechamento-datepicker-paper",
                    },
                    popper: {
                      className: "fechamento-datepicker-popper",
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: 40,
                      borderRadius: "10px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--border-color, rgba(255,255,255,0.16))",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--accent-color, #3b82f6)",
                    },
                    "& .MuiInputLabel-root": {
                      color: "var(--text-muted, #94a3b8)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "var(--accent-color, #3b82f6)",
                    },
                    "& .MuiOutlinedInput-input": {
                      color: "var(--text-color, #e5e7eb)",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "var(--text-muted, #94a3b8)",
                    },
                  }}
                />
              </div>
            </div>

            {!data && !empresaId ? (
              <p className="fechamento-hint">
                Selecione uma empresa para habilitar a busca.
              </p>
            ) : null}

            {!data && empresaId && !competencia ? (
              <p className="fechamento-hint">
                Agora selecione a competência para carregar os caixas.
              </p>
            ) : null}

            {error ? <p className="fechamento-erro">{error}</p> : null}
          </div>

          <div className="no-print fechamento-actions">
            <button
              type="button"
              className="btn"
              disabled={!caixas.length}
              onClick={() => handlePrint("simple")}
            >
              Imprimir planilha
            </button>

            <button
              type="button"
              className="btn"
              disabled={!caixas.length}
              onClick={() => handlePrint("detail")}
            >
              Imprimir com detalhes
            </button>
          </div>
        </header>

        <FechamentoCaixaGrid caixas={caixas} onAddDetalhe={handleAddDetalhe} />

        <div className="print-only">
          <FechamentoCaixaPrint
            caixas={caixas}
            mode={printMode || "simple"}
            empresaNome={empresaSelecionada?.descricao || empresaSelecionada?.nome || ""}
          />
        </div>

        <MovimentacaoDetalheModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          empresaId={empresaId}
          caixa={modalCtx?.caixa ?? null}
          valorCaixa={modalCtx?.valorCaixa ?? null}
          onSaved={handleSaved}
        />
      </div>
    </LocalizationProvider>
  );
}