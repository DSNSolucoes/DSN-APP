// src/pages/FiscalPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { EmpresaSelecao } from '../components/EmpresaSelecao/EmpresaSelecao';
import { obterTerminais } from '../api/comboService';

export function FiscalPage() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [dadosFiscais, setDadosFiscais] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // quando selecionar empresa → buscar dados fiscais no endpoint
  useEffect(() => {
    if (!empresaSelecionada) { 
      return;
    }
 
    setLoading(true);
    setErro(null);

    // se quiser filtrar por data, pode passar como 2º parâmetro
    obterTerminais(empresaSelecionada.id, null)
      .then((data) => {
        // endpoint retorna array, pegamos o primeiro (igual Angular)
        setDadosFiscais(Array.isArray(data) ? data[0] : data);
      })
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar dados fiscais');
      })
      .finally(() => setLoading(false));
  }, [empresaSelecionada]);

  const resumoTerminais = useMemo(() => {
    if (!dadosFiscais?.lista) return null;

    const totalFiscal = dadosFiscais.lista.reduce(
      (acc, item) => acc + (item.valorFiscal || 0),
      0
    );
    const totalVendas = dadosFiscais.lista.reduce(
      (acc, item) => acc + (item.valorVendas || 0),
      0
    );

    return { totalFiscal, totalVendas };
  }, [dadosFiscais]);

  return (
    <div className="page">
      <header className="page-header">
        <h2>Fiscal</h2>
      </header>

      <EmpresaSelecao
        empresaSelecionadaId={empresaSelecionada?.id ?? null}
        onChangeEmpresa={setEmpresaSelecionada}
      />

      {!empresaSelecionada && (
        <p className="muted">
          Selecione uma empresa para visualizar os dados fiscais.
        </p>
      )}

      {empresaSelecionada && loading && <p>Carregando dados fiscais...</p>}
      {empresaSelecionada && erro && <p className="erro">{erro}</p>}

      {empresaSelecionada && !loading && !erro && dadosFiscais && (
        <>
          {/* Resumo geral */}
          <section className="fiscal-summary">
            <div className="card">
              <h3>Total Fiscal</h3>
              <p className="value-big">
                R$ {dadosFiscais.valorFiscalTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="card">
              <h3>Total Pedidos</h3>
              <p className="value-big">
                R$ {dadosFiscais.valorPedidoTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </p>
            </div>
          </section>

          {/* Lista de terminais em cards */}
          <section className="fiscal-list">
            {dadosFiscais.lista.map((terminal) => (
              <div key={terminal.numTerminal} className="card terminal-card">
                <div className="terminal-header">
                  <div>
                    <span className="terminal-label">Terminal</span>
                    <h3 className="terminal-title">{terminal.descricao}</h3>
                  </div>

                  <button
                    type="button"
                    className={
                      'status-badge ' +
                      (terminal.emissaoExtraordinariaicms
                        ? 'status-badge--on'
                        : 'status-badge--off')
                    }
                  >
                    {terminal.emissaoExtraordinariaicms
                      ? 'Ativado'
                      : 'Desativado'}
                  </button>
                </div>

                <div className="terminal-metrics">
                  <div className="metric">
                    <span className="metric-label">Valor Fiscal</span>
                    <p className="metric-value">
                      <span className="metric-currency">R$</span>
                      {terminal.valorFiscal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </p>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Valor Vendas</span>
                    <p className="metric-value">
                      <span className="metric-currency">R$</span>
                      {terminal.valorVendas.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </div>

                {terminal.cfop && terminal.cfop.length > 0 && (
                  <div className="terminal-cfop">
                    <span className="cfop-title">CFOP</span>
                    <ul>
                      {terminal.cfop.map((item) => (
                        <li key={item.cfop}>
                          {item.cfop} – R$&nbsp;
                          {item.valor.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
