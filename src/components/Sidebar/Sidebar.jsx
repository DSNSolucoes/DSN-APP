// src/components/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

// permissao: chave de `permissoes` que libera este item (null = sempre visível)
const ALL_TABS = [
  { id: 'fiscal',          label: 'Fiscal',            permissao: 'fiscal' },
  { id: 'nfce',            label: 'NFC-e',             permissao: 'fiscal' },
  { id: 'ncm',             label: 'NCM',               permissao: 'fiscal' },
  { id: 'produtos',        label: 'Produtos',          permissao: 'produto' },
  { id: 'faturamento',     label: 'Faturamento',       permissao: 'financeiro' },
  { id: 'fechamento-caixa',label: 'Controle de Caixa',  permissao: 'financeiro' },
  { id: 'relatorio',       label: 'Relatório',         permissao: 'relatorio' },
];

export function Sidebar({ activeTab, setActiveTab, theme, onToggleTheme, permissoes = {} }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Se nenhuma permissão for fornecida (ex.: sessão ainda carregando ou sem restrição),
  // exibe todos os módulos. Se ao menos uma permissão existir na sessão, filtra.
  const temRestricao = Object.keys(permissoes).some((k) => permissoes[k] === true || permissoes[k] === false);

  const tabs = ALL_TABS.filter((tab) =>
    !tab.permissao || !temRestricao || permissoes[tab.permissao] === true
  );

  const handleChangeTab = (id) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* overlay pra fechar clicando fora */}
      {isOpenMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={'sidebar ' + (isOpenMobile ? 'sidebar--open-mobile' : '')}>
        <div className="sidebar-top">
          <div className="sidebar-header">
            <h1>Gestão</h1> 
          </div>

          {/* botões fixos no topo */}
          <div className="sidebar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo noturno'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setIsOpenMobile((prev) => !prev)}
              aria-label={isOpenMobile ? 'Fechar menu' : 'Abrir menu'}
              title={isOpenMobile ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpenMobile ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={'sidebar-item ' + (activeTab === tab.id ? 'sidebar-item--active' : '')}
              onClick={() => handleChangeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

    
      </aside>
    </>
  );
}
