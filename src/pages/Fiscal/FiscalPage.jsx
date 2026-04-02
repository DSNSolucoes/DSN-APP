import React, { useCallback, useEffect, useState } from 'react';
import { EmpresaSelecao } from '../../components/EmpresaSelecao/EmpresaSelecao';
import { EmptyState } from '../../components/EmptyState';
import { obterTerminais } from '../../api/comboService';
import { useNCM } from '../../context/NCMContext';
import { api } from '../../api';
import { MesAnoSelector } from '../../components/MesAnoSelector/MesAnoSelector';
import './FiscalPage.css';

function fmt(valor) {
  return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function FiscalPage() {
  const now = new Date();
  const [empresa, setEmpresa] = useState(null);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const [dadosFiscais, setDadosFiscais] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);
  const [percentualST, setPercentualST] = useState('');

  const { ncmSelecionado } = useNCM();

  const mesSelecionadoAtual =
    mes === now.getMonth() + 1 && ano === now.getFullYear();

  const carregarDados = useCallback(() => {
    if (!empresa) return;
    setLoading(true);
    setErro(null);
    setErroAcao(null);

    const dataFiltro = new Date(ano, mes - 1, 1).toISOString();
    obterTerminais(empresa.id, dataFiltro)
      .then((data) => setDadosFiscais(Array.isArray(data) ? data[0] : data))
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar dados fiscais.');
      })
      .finally(() => setLoading(false));
  }, [empresa, mes, ano]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function executarAcao(fn, descricao) {
    setErroAcao(null);
    try {
      await fn();
      carregarDados();
    } catch (err) {
      console.error(err);
      setErroAcao(`Erro ao ${descricao}: ${err.message}`);
    }
  }

  async function handleGravarPercentualST() {
    if (!empresa || percentualST === '') return;
    await executarAcao(
      () => api.atualizarPercentualST(empresa.id, Number(percentualST)),
      'gravar percentual ST'
    );
  }

  async function handleAtualizarST() {
    if (!empresa) return;
    await executarAcao(
      () => api.margemFiscal(empresa.id),
      'atualizar ST'
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Fiscal</h2>
      </header>

      {/* ── Filtros ── */}
      <div className="fiscal-filtros">
        <EmpresaSelecao
          empresaSelecionadaId={empresa?.id ?? null}
          onChangeEmpresa={(emp) => {
            setEmpresa(emp);
            setDadosFiscais(null);
          }}
        />

        <MesAnoSelector
          mes={mes}
          ano={ano}
          onChangeMes={setMes}
          onChangeAno={setAno}
        />
      </div>

      {!empresa && (
        <EmptyState
          title="Selecione uma empresa"
          description="Escolha uma empresa para visualizar os dados fiscais."
        />
      )}

      {empresa && loading && <p className="muted">Carregando dados fiscais...</p>}
      {empresa && erro && <p className="erro">{erro}</p>}
      {erroAcao && <div className="fiscal-erro-inline">{erroAcao}</div>}

      {empresa && !loading && !erro && dadosFiscais && (
        <>
          {/* ── Resumo mensal ── */}
          <div className="fiscal-summary">
            <div className="card">
              <h4>Valor Fiscal Total</h4>
              <p className="value-big">R$ {fmt(dadosFiscais.valorFiscalTotal)}</p>
            </div>
            <div className="card">
              <h4>Valor Pedido Total</h4>
              <p className="value-big">R$ {fmt(dadosFiscais.valorPedidoTotal)}</p>
            </div>
            <div className="card">
              <h4>Contingências</h4>
              <p className="value-big">{dadosFiscais.contingencia ?? 0}</p>
              <p className="value-label">documentos pendentes/cancelados</p>
            </div>

            {dadosFiscais.cfop?.length > 0 && (
              <div className="card cfop-consolidated">
                <h4>CFOP Consolidado</h4>
                <ul>
                  {dadosFiscais.cfop.map((c) => (
                    <li key={c.cfop ?? c.Cfop}>
                      <span className="cfop-code">{c.cfop ?? c.Cfop}</span>
                      <span>R$ {fmt(c.valor ?? c.Valor)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Ações da loja (percentual ST + atualizar ST) ── */}
          <div className="fiscal-loja-acoes">
            <div className="fiscal-loja-acoes__group">
              <span className="fiscal-loja-acoes__label">Percentual ST (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentualST}
                onChange={(e) => setPercentualST(e.target.value)}
                placeholder="ex: 12.5"
                disabled={!mesSelecionadoAtual}
              />
            </div>
            <button
              className="fiscal-btn fiscal-btn--primary"
              onClick={handleGravarPercentualST}
              disabled={!mesSelecionadoAtual || percentualST === ''}
              title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : ''}
            >
              Gravar % ST
            </button>
            <button
              className="fiscal-btn fiscal-btn--warn"
              onClick={handleAtualizarST}
              disabled={!mesSelecionadoAtual}
              title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : ''}
            >
              Atualizar ST (%)
            </button>

            {ncmSelecionado && (
              <span className="terminal-ncm">
                NCM global: <strong>{ncmSelecionado.nCM ?? ncmSelecionado.ncm ?? ncmSelecionado.NCM}</strong>
              </span>
            )}
          </div>

          {/* ── Cards de terminais ── */}
          {dadosFiscais.lista?.length === 0 && (
            <EmptyState
              title="Nenhum terminal encontrado"
              description="Não há terminais cadastrados para esta empresa."
            />
          )}

          {dadosFiscais.lista?.length > 0 && (
            <>
              <p className="fiscal-terminais-title">Terminais</p>
              <div className="fiscal-list">
                {dadosFiscais.lista.map((terminal) => (
                  <TerminalCard
                    key={terminal.numTerminal ?? terminal.NumTerminal}
                    terminal={terminal}
                    lojaId={empresa.id}
                    ncmGlobal={ncmSelecionado?.nCM ?? ncmSelecionado?.ncm ?? ncmSelecionado?.NCM ?? ''}
                    mesSelecionadoAtual={mesSelecionadoAtual}
                    onAcaoFeita={carregarDados}
                    onErro={setErroAcao}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function TerminalCard({ terminal, lojaId, ncmGlobal, mesSelecionadoAtual, onAcaoFeita, onErro }) {
  const [busy, setBusy] = useState(false);

  const numTerminal = terminal.numTerminal ?? terminal.NumTerminal;
  const descricao = terminal.descricao ?? terminal.Descricao ?? `Terminal ${numTerminal}`;
  const emissaoExtraordinaria = terminal.emissaoExtraordinaria ?? terminal.EmissaoExtraordinaria ?? false;
  const emissaoExtraordinariaicms = terminal.emissaoExtraordinariaicms ?? terminal.EmissaoExtraordinariaicms ?? false;
  const valorFiscal = terminal.valorFiscal ?? terminal.ValorFiscal ?? 0;
  const valorVendas = terminal.valorVendas ?? terminal.ValorVendas ?? 0;
  const cfop = terminal.cfop ?? terminal.Cfop ?? [];
  const ncmAtual = terminal.nCM ?? terminal.ncm ?? terminal.NCM ?? terminal.emissaoExtraordinariancm ?? '';

  async function acao(fn, desc) {
    setBusy(true);
    onErro(null);
    try {
      await fn();
      onAcaoFeita();
    } catch (err) {
      onErro(`Erro ao ${desc}: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card terminal-card">
      <div className="terminal-header">
        <div>
          <span className="terminal-label">Terminal {numTerminal}</span>
          <h3 className="terminal-title">{descricao}</h3>
        </div>
      </div>

      {/* Flags de status */}
      <div className="terminal-flags">
        <span className={`status-badge ${emissaoExtraordinaria ? 'status-badge--on' : 'status-badge--off'}`}>
          Contingência: {emissaoExtraordinaria ? 'Ativa' : 'Inativa'}
        </span>
        <span className={`status-badge ${emissaoExtraordinariaicms ? 'status-badge--on' : 'status-badge--off'}`}>
          ST: {emissaoExtraordinariaicms ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      {/* Métricas */}
      <div className="terminal-metrics">
        <div className="metric">
          <span className="metric-label">Valor Fiscal</span>
          <p className="metric-value">
            <span className="metric-currency">R$</span>{fmt(valorFiscal)}
          </p>
        </div>
        <div className="metric">
          <span className="metric-label">Valor Vendas</span>
          <p className="metric-value">
            <span className="metric-currency">R$</span>{fmt(valorVendas)}
          </p>
        </div>
      </div>

      {/* CFOP do terminal */}
      {cfop.length > 0 && (
        <div className="terminal-cfop">
          <span className="cfop-title">CFOP</span>
          <ul>
            {cfop.map((c) => (
              <li key={c.cfop ?? c.Cfop}>
                <span>{c.cfop ?? c.Cfop}</span>
                <span>R$ {fmt(c.valor ?? c.Valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ncmAtual && (
        <span className="terminal-ncm">NCM: {ncmAtual}</span>
      )}

      {/* Ações (só habilitadas no mês atual) */}
      <div className="terminal-acoes">
        {!emissaoExtraordinaria ? (
          <button
            className="fiscal-btn fiscal-btn--secondary"
            disabled={!mesSelecionadoAtual || busy}
            title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : ''}
            onClick={() => acao(() => api.ativarContingencia(numTerminal, lojaId), 'ativar contingência')}
          >
            Ativar Contingência
          </button>
        ) : (
          <button
            className="fiscal-btn fiscal-btn--secondary"
            disabled={!mesSelecionadoAtual || busy}
            title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : ''}
            onClick={() => acao(() => api.desativarContingencia(numTerminal, lojaId), 'desativar contingência')}
          >
            Desativar Contingência
          </button>
        )}

        {!emissaoExtraordinariaicms ? (
          <button
            className="fiscal-btn fiscal-btn--primary"
            disabled={!mesSelecionadoAtual || busy || !ncmGlobal}
            title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : !ncmGlobal ? 'Selecione um NCM global' : ''}
            onClick={() => acao(() => api.ativarST(numTerminal, lojaId, ncmGlobal), 'ativar ST')}
          >
            Ativar ST
          </button>
        ) : (
          <button
            className="fiscal-btn fiscal-btn--warn"
            disabled={!mesSelecionadoAtual || busy}
            title={!mesSelecionadoAtual ? 'Disponível apenas no mês atual' : ''}
            onClick={() => acao(() => api.desativarST(numTerminal, lojaId), 'voltar ao padrão')}
          >
            Voltar Padrão
          </button>
        )}
      </div>
    </div>
  );
}
