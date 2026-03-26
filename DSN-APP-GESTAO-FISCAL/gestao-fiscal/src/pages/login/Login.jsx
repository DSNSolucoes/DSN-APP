import React, { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api";

export default function Login() {
  const { login: doLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from?.pathname || "/", [location]);

  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // campos login
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  // campos reset
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await doLogin({ login: usuario, senha });
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.status === 401) setMsg({ type: "error", text: "Usuário ou senha inválidos." });
      else setMsg({ type: "error", text: "Erro ao logar. Verifique o servidor/CORS." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (novaSenha !== confirmarSenha) {
      setMsg({ type: "error", text: "Nova senha e confirmação não conferem." });
      return;
    }

    setLoading(true);
    try {
      await api.trocarSenha({
        login: usuario,
        senha: senhaAtual,
        novasenha: novaSenha,
        confimarsenha: confirmarSenha,
      });

      setMsg({ type: "success", text: "Senha alterada com sucesso! Faça login com a nova senha." });

      // opcional: mudar para modo login e limpar campos
      setMode("login");
      setSenha("");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      if (err?.status === 401) {
        setMsg({ type: "error", text: "Não autorizado. Login/senha atual inválidos ou confirmação não confere." });
      } else {
        setMsg({ type: "error", text: "Erro ao trocar senha. Verifique o servidor/CORS." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>DSN - Sistema de Gestão</h1>
        <p style={styles.subtitle}>Acesse sua conta</p>

        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => {
              setMsg(null);
              setMode("login");
            }}
            style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMsg(null);
              setMode("reset");
            }}
            style={{ ...styles.tab, ...(mode === "reset" ? styles.tabActive : {}) }}
          >
            Resetar senha
          </button>
        </div>

        {msg ? (
          <div style={{ ...styles.alert, ...(msg.type === "success" ? styles.alertSuccess : styles.alertError) }}>
            {msg.text}
          </div>
        ) : null}

        {mode === "login" ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>
              Usuário
              <input
                style={styles.input}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Seu Usuário"
                required
              />
            </label>

            <label style={styles.label}>
              Senha
              <input
                style={styles.input}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            <button style={styles.button} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={styles.form}>
            <label style={styles.label}>
              Usuário
              <input
                style={styles.input}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Seu Usuário"
                required
              />
            </label>

            <label style={styles.label}>
              Senha atual
              <input
                style={styles.input}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            <label style={styles.label}>
              Nova senha
              <input
                style={styles.input}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            <label style={styles.label}>
              Confirmar nova senha
              <input
                style={styles.input}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            <button style={styles.button} disabled={loading}>
              {loading ? "Salvando..." : "Trocar senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0b1220",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 8, marginBottom: 16, color: "#555" },
  tabs: { display: "flex", gap: 8, marginBottom: 12 },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#f7f7f7",
    cursor: "pointer",
    fontWeight: 700,
  },
  tabActive: { background: "#2563eb", color: "white", border: "1px solid #2563eb" },
  alert: { padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 14 },
  alertError: { background: "#ffe3e3", border: "1px solid #ffb0b0", color: "#8a1f1f" },
  alertSuccess: { background: "#e6ffea", border: "1px solid #9ef2ad", color: "#14532d" },
  form: { display: "grid", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: 14, color: "#333" },
  input: {
    height: 44,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
  },
  button: {
    height: 44,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    color: "white",
    background: "#2563eb",
  },
};
