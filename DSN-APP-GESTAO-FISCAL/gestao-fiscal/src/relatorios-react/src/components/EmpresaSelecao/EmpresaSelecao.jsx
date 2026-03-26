import React, { useEffect, useState } from "react";
import "./EmpresaSelecao.css";
import { combosService } from "../../services/combosService";

/**
 * Se você já tem esse componente no seu projeto, pode apagar esta pasta e usar o seu.
 */
export function EmpresaSelecao({ empresaSelecionadaId, onChangeEmpresa }) {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);

    combosService
      .obterLojas()
      .then((data) => setEmpresas(data || []))
      .catch((err) => {
        console.error(err);
        setErro("Erro ao carregar empresas");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando empresas...</p>;
  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div className="empresa-selecao">
      <span className="empresa-selecao__label">Empresa</span>
      <div className="empresa-selecao__wrapper">
        <select
          className="empresa-selecao__select"
          value={empresaSelecionadaId || ""}
          onChange={(e) => {
            const id = e.target.value || null;
            const empresaObj = empresas.find((emp) => String(emp.id) === String(id));
            onChangeEmpresa(empresaObj || null);
          }}
        >
          <option value="">Selecione...</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nome}
            </option>
          ))}
        </select>
        <span className="empresa-selecao__arrow">▾</span>
      </div>
    </div>
  );
}
