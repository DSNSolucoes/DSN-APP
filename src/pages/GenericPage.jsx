// src/pages/GenericPage.jsx
import React, { useEffect, useState } from 'react';
import { endpointsConfig } from '../api/endpointsConfig';
import { EmpresaSelecao } from '../components/EmpresaSelecao/EmpresaSelecao';
import { EmptyState } from '../components/EmptyState';
import { getJson } from '../api/http';

export function GenericPage({ tabId, title }) {
  const config = endpointsConfig[tabId];

  const [empresa, setEmpresa] = useState(null);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setEmpresa(null);
    setDados(null);
    setErro(null);
    setLoading(false);
  }, [tabId]);

  useEffect(() => {
    if (!empresa || !config?.dadosEmpresa) return;

    setLoading(true);
    setErro(null);

    getJson(config.dadosEmpresa(empresa.id))
      .then((data) => setDados(data))
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar dados da aba');
      })
      .finally(() => setLoading(false));
  }, [empresa, config]);

  if (!config?.empresas) {
    return (
      <EmptyState
        title="Endpoints não configurados"
        description={`A aba ${title} ainda não possui endpoints configurados.`}
        actionLabel="Ir para Configurações"
        onAction={() => alert('Abrir tela de configurações')}
      />
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>{title}</h2>
      </header>

      <EmpresaSelecao
        empresasEndpoint={config.empresas}
        selectedCompanyId={empresa?.id ?? null}
        onSelectCompany={setEmpresa}
      />

      {!empresa && <p className="muted">Selecione uma empresa.</p>}

      {empresa && loading && <p>Carregando dados...</p>}
      {empresa && erro && <p className="erro">{erro}</p>}

      {empresa && !loading && !erro && dados && (
        <pre className="json-preview">
          {JSON.stringify(dados, null, 2)}
        </pre>
      )}
    </div>
  );
}
