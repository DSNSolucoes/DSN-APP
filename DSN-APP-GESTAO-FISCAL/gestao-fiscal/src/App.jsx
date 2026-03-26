// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import "./App.css";

import { Sidebar }  from "./components/Sidebar/Sidebar"; 
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { FiscalPage } from "./pages/FiscalPage";
import { GenericPage } from "./pages/GenericPage";
import { RelatoriosPage } from "./pages/Relatorios/RelatoriosPage";
import { FechamentoCaixaPage } from "./pages/FechamentoCaixa/FechamentoCaixaPage";
import Login from "./pages/login/Login";

function AppShell() {
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

  const renderPage = () => {
  switch (activeTab) {
    case "fiscal":
      return <FiscalPage />;
    case "nfce":
      return <GenericPage tabId="nfce" title="NFC-e" />;
    case "produtos":
      return <GenericPage tabId="produtos" title="Produtos" />;
    case "relatorio":
      return <RelatoriosPage />;
    case "faturamento":
      return <GenericPage tabId="faturamento" title="Faturamento" />;
    case "financeiro":
      return <GenericPage tabId="financeiro" title="Financeiro" />;
    case "fechamento-caixa":
      return <FechamentoCaixaPage />;
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