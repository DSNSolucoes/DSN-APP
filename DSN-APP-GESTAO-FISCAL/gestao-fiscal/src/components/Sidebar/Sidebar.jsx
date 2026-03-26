// src/components/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

const tabs = [
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'nfce', label: 'NFC-e' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'relatorio', label: 'Relatório' },
  { id: 'faturamento', label: 'Faturamento' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'fechamento-caixa', label: 'Fechamento Caixa' }
];

export function Sidebar({ activeTab, setActiveTab, theme, onToggleTheme }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

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
            <span>Sistema Empresarial</span>
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

        <div className="sidebar-footer">
          <span>Configurações</span>
        </div>
      </aside>
    </>
  );
}