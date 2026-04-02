// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

import "./App.css";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { FiscalPage } from "./pages/Fiscal/FiscalPage";
import { NFCePage } from "./pages/NFCe/NFCePage";
import { ProdutosPage } from "./pages/Produtos/ProdutosPage";
import { FaturamentoPage } from "./pages/Faturamento/FaturamentoPage";
import { NCMPage } from "./pages/NCM/NCMPage";
import { RelatoriosPage } from "./pages/Relatorios/RelatoriosPage";
import { FechamentoCaixaPage } from "./pages/FechamentoCaixa/FechamentoCaixaPage";
import { EmptyState } from "./components/EmptyState";
import Login from "./pages/login/Login";

function AcessoNegado() {
  return (
    <div className="page">
      <EmptyState
        title="Acesso restrito"
        description="Você não tem permissão para acessar este módulo. Contate o administrador."
      />
    </div>
  );
}

function AppShell() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("fiscal");

  // tema (claro/escuro) com persistência
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  // Permissões derivadas da sessão
  const permissoes = useMemo(() => ({
    fiscal: session?.fiscal === "V",
    financeiro: session?.financeiro === "V",
    produto: session?.produto === "V",
    relatorio: session?.relatorio === "V",
  }), [session]);

  const renderPage = () => {
    switch (activeTab) {
      case "fiscal":
        return permissoes.fiscal ? <FiscalPage /> : <AcessoNegado />;
      case "nfce":
        return permissoes.fiscal ? <NFCePage /> : <AcessoNegado />;
      case "produtos":
        return permissoes.produto ? <ProdutosPage /> : <AcessoNegado />;
      case "faturamento":
        return permissoes.financeiro ? <FaturamentoPage /> : <AcessoNegado />;
      case "ncm":
        return permissoes.fiscal ? <NCMPage /> : <AcessoNegado />;
      case "relatorio":
        return permissoes.relatorio ? <RelatoriosPage /> : <AcessoNegado />;
      case "fechamento-caixa":
        return permissoes.financeiro ? <FechamentoCaixaPage /> : <AcessoNegado />;
      default:
        return <FiscalPage />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        permissoes={permissoes}
      />
      <main className="app-main">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <LoadingOverlay />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppShell />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
