import React, { useState } from 'react';
import { EmpresaSelecao } from '../../components/EmpresaSelecao/EmpresaSelecao';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../api';
import { MesAnoSelector } from '../../components/MesAnoSelector/MesAnoSelector';
import './NFCePage.css';

function fmt(valor) {
  return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function primeiroUltimoDia(mes, ano) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

export function NFCePage() {
  const now = new Date();
  const [empresa, setEmpresa] = useState(null);
  const [agruparCFOP, setAgruparCFOP] = useState(false);
  const [somenteExtraordinaria, setSomenteExtraordinaria] = useState(false);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [buscado, setBuscado] = useState(false);

  async function handleAtualizar() {
    if (!empresa) return;
    setLoading(true);
    setErro(null);
    setBuscado(true);
    try {
      let resultado;
      if (agruparCFOP) {
        const { inicio, fim } = primeiroUltimoDia(mes, ano);
        resultado = await api.nfceObterEnviadasCFOP(empresa.id, inicio, fim);
      } else {
        resultado = await api.nfceObterEnviadas(empresa.id, somenteExtraordinaria);
      }
      setDados(resultado || []);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar NFC-e.');
      setDados(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>NFC-e</h2>
      </header>

      <div className="nfce-filtros">
        <EmpresaSelecao
          empresaSelecionadaId={empresa?.id ?? null}
          onChangeEmpresa={(emp) => {
            setEmpresa(emp);
            setDados(null);
            setBuscado(false);
          }}
        />

        {/* Mês/ano — só exibido no modo agrupado por CFOP */}
        {agruparCFOP && (
          <MesAnoSelector
            mes={mes}
            ano={ano}
            onChangeMes={setMes}
            onChangeAno={setAno}
          />
        )}

        <div className="nfce-filtros__toggle">
          <label>
            <input
              type="checkbox"
              checked={agruparCFOP}
              onChange={(e) => {
                setAgruparCFOP(e.target.checked);
                setDados(null);
                setBuscado(false);
              }}
            />
            Agrupar por CFOP
          </label>
          {!agruparCFOP && (
            <label>
              <input
                type="checkbox"
                checked={somenteExtraordinaria}
                onChange={(e) => {
                  setSomenteExtraordinaria(e.target.checked);
                  setDados(null);
                  setBuscado(false);
                }}
              />
              Somente extraordinária
            </label>
          )}
        </div>

        <button
          className="nfce-btn"
          onClick={handleAtualizar}
          disabled={!empresa || loading}
        >
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      {!empresa && (
        <EmptyState
          title="Selecione uma empresa"
          description="Escolha uma empresa e clique em Atualizar."
        />
      )}

      {erro && <p className="erro">{erro}</p>}

      {empresa && !loading && buscado && dados !== null && (
        agruparCFOP ? <TabelaCFOP dados={dados} /> : <TabelaNFCe dados={dados} />
      )}
    </div>
  );
}

/* ── Modo agrupado por CFOP ── */
function TabelaCFOP({ dados }) {
  if (!dados.length) {
    return (
      <EmptyState
        title="Nenhum dado encontrado"
        description="Não foram encontrados registros para os filtros selecionados."
      />
    );
  }
  return (
    <div className="nfce-cfop-grid">
      {dados.map((item, idx) => (
        <div className="nfce-cfop-card" key={idx}>
          <p className="nfce-cfop-card__label">CFOP</p>
          <p className="nfce-cfop-card__code">{item.cfop ?? item.CFOP}</p>
          <p className="nfce-cfop-card__valor">
            R$ {fmt(item.vlTotalNfce ?? item.valor ?? item.Valor)}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Modo lista normal ── */
function TabelaNFCe({ dados }) {
  if (!dados.length) {
    return (
      <EmptyState
        title="Nenhuma NFC-e encontrada"
        description="Não foram encontradas NFC-e para os filtros selecionados."
      />
    );
  }
  return (
    <>
      <p className="nfce-count">{dados.length} registros</p>
      <div className="nfce-table-wrap">
        <table className="nfce-table">
          <thead>
            <tr>
              <th>Nº NFC-e</th>
              <th>Série</th>
              <th>Terminal</th>
              <th>Emissão</th>
              <th>Status</th>
              <th>Vl. Total</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((nf, idx) => {
              const status = nf.status ?? nf.Status ?? '';
              return (
                <tr key={idx}>
                  <td>{nf.numNfce ?? nf.NumNfce ?? '-'}</td>
                  <td>{nf.serieNfce ?? nf.SerieNfce ?? '-'}</td>
                  <td>{nf.numTerminal ?? nf.NumTerminal ?? '-'}</td>
                  <td>{nf.dtEmissao ? new Date(nf.dtEmissao).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <span className={`nfce-status nfce-status--${status}`}>{status || '-'}</span>
                  </td>
                  <td>R$ {fmt(nf.vlTotalNfce ?? nf.VlTotalNfce ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
