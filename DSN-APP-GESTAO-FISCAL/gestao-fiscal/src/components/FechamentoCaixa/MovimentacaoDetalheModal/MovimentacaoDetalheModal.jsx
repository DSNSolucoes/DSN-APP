import React, { useEffect, useMemo, useState } from "react";
import { obterFuncionarios } from "../../../api/comboService";
import { api } from "../../../api";
import { dateBrPipe } from "../../../utils/pipes/datePipe";
import "./MovimentacaoDetalheModal.css";

function toInputDateTimeLocal(iso) {
  // datetime-local espera: YYYY-MM-DDTHH:mm
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromInputDateTimeLocal(value) {
  // Converte "YYYY-MM-DDTHH:mm" para ISO (sem timezone garantido, mas suficiente para APIs comuns)
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function MovimentacaoDetalheModal({
  open,
  onClose,
  empresaId,
  caixa,
  valorCaixa,
  onSaved,
}) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [funcionarioId, setFuncionarioId] = useState("");

  const [funcionarios, setFuncionarios] = useState([]);
  const [loadingFuncs, setLoadingFuncs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);

  const tipoValorLabel = valorCaixa?.tipoValorCaixa?.descricao || "-";
  const tipoValorId = valorCaixa?.tipoValorCaixa?.id ?? null;

  const headerInfo = useMemo(() => {
    if (!caixa || !valorCaixa) return "";
    const dataTxt = valorCaixa?.dataRealizacao
      ? dateBrPipe(valorCaixa.dataRealizacao)
      : "";
    return `Caixa: ${caixa.descricao || caixa.id} • Tipo: ${tipoValorLabel}${
      dataTxt ? ` • Última: ${dataTxt}` : ""
    }`;
  }, [caixa, valorCaixa, tipoValorLabel]);

  // Reset ao abrir
  useEffect(() => {
    if (!open) return;
    setErro(null);
    setDescricao("");
    setValor("");
    setFuncionarioId("");

    // default: agora
    setDataRealizacao(toInputDateTimeLocal(new Date().toISOString()));
  }, [open]);

  // Carrega funcionários quando modal abre
  useEffect(() => {
    if (!open) return;
    if (!empresaId) return;

    setLoadingFuncs(true);
    obterFuncionarios(empresaId)
      .then((data) => setFuncionarios(data || []))
      .catch((e) => {
        console.error(e);
        setFuncionarios([]);
      })
      .finally(() => setLoadingFuncs(false));
  }, [open, empresaId]);

  // ESC para fechar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave =
    !!tipoValorId &&
    descricao.trim().length > 0 &&
    String(valor).trim().length > 0 &&
    !!fromInputDateTimeLocal(dataRealizacao) &&
    !saving;

  async function handleSave() {
    setErro(null);

    if (!tipoValorId) {
      setErro("Tipo de valor inválido.");
      return;
    }

    const parsedValor = Number(String(valor).replace(",", "."));
    if (Number.isNaN(parsedValor) || parsedValor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    const iso = fromInputDateTimeLocal(dataRealizacao);
    if (!iso) {
      setErro("Informe uma data de realização válida.");
      return;
    }

    const payload = {
      tipoValor: tipoValorId,
      valor: parsedValor,
      dataRealizacao: iso,
      descricao: descricao.trim(),
      funcionarioId: funcionarioId ? Number(funcionarioId) : null,
    };

    try {
      setSaving(true);
      // Endpoint base informado: /Caixa
      await api.post("Caixa", payload);
      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      setErro(e?.message || "Erro ao salvar movimentação");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="mvm-modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="mvm-modal">
        <div className="mvm-modal__header">
          <div className="mvm-modal__title">Novo detalhe de movimentação</div>
          <button className="mvm-modal__close" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>

        <div className="mvm-modal__sub">{headerInfo}</div>

        <div className="mvm-modal__body">
          <div className="mvm-form__row">
            <div className="mvm-field">
              <label className="mvm-field__label">Tipo de valor</label>
              <input className="mvm-field__input" value={tipoValorLabel} disabled />
            </div>

            <div className="mvm-field">
              <label className="mvm-field__label">Valor</label>
              <input
                className="mvm-field__input"
                inputMode="decimal"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="mvm-form__row">
            <div className="mvm-field">
              <label className="mvm-field__label">Data de realização</label>
              <input
                className="mvm-field__input"
                type="datetime-local"
                value={dataRealizacao}
                onChange={(e) => setDataRealizacao(e.target.value)}
              />
            </div>

            <div className="mvm-field">
              <label className="mvm-field__label">Funcionário (opcional)</label>
              <div className="mvm-select__wrapper">
                <select
                  className="mvm-select__select"
                  value={funcionarioId}
                  onChange={(e) => setFuncionarioId(e.target.value)}
                  disabled={loadingFuncs || !empresaId}
                >
                  <option value="">Selecione...</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <span className="mvm-select__arrow">▾</span>
              </div>
            </div>
          </div>

          <div className="mvm-field">
            <label className="mvm-field__label">Descrição</label>
            <textarea
              className="mvm-field__textarea"
              rows={3}
              placeholder="Ex.: Pagamento por fora"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {erro ? <div className="mvm-modal__error">{erro}</div> : null}
        </div>

        <div className="mvm-modal__footer">
          <button className="mvm-btn mvm-btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="mvm-btn mvm-btn--primary"
            onClick={handleSave}
            disabled={!canSave}
            title={!canSave ? "Preencha os campos obrigatórios" : "Salvar"}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
