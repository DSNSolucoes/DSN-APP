import React, { useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { EmpresaSelecao } from '../../components/EmpresaSelecao/EmpresaSelecao';
import { MesAnoSelector } from '../../components/MesAnoSelector/MesAnoSelector';
import { api } from '../../api';
import './FaturamentoPage.css';

function fmt(valor) {
  return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function FaturamentoPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [empresa, setEmpresa] = useState(null);

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [buscado, setBuscado] = useState(false);

  async function handleCarregar() {
    setLoading(true);
    setErro(null);
    setBuscado(true);
    try {
      const data = new Date(ano, mes - 1, 1).toISOString();
      const resultado = await api.faturamentoObter(data, empresa?.id ?? null);
      setDados(resultado || []);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar faturamento.');
      setDados(null);
    } finally {
      setLoading(false);
    }
  }

  const totalFiscal = dados?.reduce((s, d) => s + (d.valorFiscal ?? d.ValorFiscal ?? 0), 0) ?? 0;
  const totalVendas = dados?.reduce((s, d) => s + (d.valorVendas ?? d.ValorVendas ?? 0), 0) ?? 0;

  return (
    <div className="page">
      <header className="page-header">
        <h2>Faturamento</h2>
      </header>

      <div className="faturamento-filtros">
        <div className="faturamento-filtros__empresa">
          <span className="faturamento-filtros__label">Empresa (opcional)</span>
          <EmpresaSelecao
            empresaSelecionadaId={empresa?.id ?? null}
            onChangeEmpresa={(emp) => { setEmpresa(emp); setDados(null); setBuscado(false); }}
          />
        </div>

        <MesAnoSelector
          mes={mes}
          ano={ano}
          onChangeMes={setMes}
          onChangeAno={setAno}
        />

        <button
          className="faturamento-btn"
          onClick={handleCarregar}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Carregar'}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {!buscado && !loading && (
        <EmptyState
          title="Selecione o período"
          description="Escolha mês e ano e clique em Carregar para visualizar o faturamento."
        />
      )}

      {buscado && !loading && dados !== null && dados.length === 0 && (
        <EmptyState
          title="Nenhum dado encontrado"
          description="Não há dados de faturamento para o período selecionado."
        />
      )}

      {buscado && !loading && dados !== null && dados.length > 0 && (
        <>
          {/* Totais consolidados */}
          <div className="faturamento-totais">
            <div className="card">
              <h4>Total Fiscal</h4>
              <p className="value-big">R$ {fmt(totalFiscal)}</p>
            </div>
            <div className="card">
              <h4>Total Vendas</h4>
              <p className="value-big">R$ {fmt(totalVendas)}</p>
            </div>
          </div>

          {/* Cards por loja */}
          <div className="faturamento-grid">
            {dados.map((loja, idx) => {
              const cfop = loja.cfop ?? loja.CFOP ?? [];
              return (
                <div className="faturamento-card" key={idx}>
                  <h3 className="faturamento-card__loja">{loja.loja ?? loja.Loja ?? `Loja ${idx + 1}`}</h3>

                  <div className="faturamento-card__metricas">
                    <div className="fat-metric">
                      <p className="fat-metric__label">Fiscal</p>
                      <p className="fat-metric__value">R$ {fmt(loja.valorFiscal ?? loja.ValorFiscal)}</p>
                    </div>
                    <div className="fat-metric">
                      <p className="fat-metric__label">Vendas</p>
                      <p className="fat-metric__value">R$ {fmt(loja.valorVendas ?? loja.ValorVendas)}</p>
                    </div>
                  </div>

                  {cfop.length > 0 && (
                    <div className="faturamento-card__cfop">
                      <span className="faturamento-card__cfop-title">CFOP</span>
                      <ul>
                        {cfop.map((c, ci) => (
                          <li key={ci}>
                            <span className="cfop-code">{c.cfop ?? c.Cfop}</span>
                            <span>R$ {fmt(c.valor ?? c.Valor)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
