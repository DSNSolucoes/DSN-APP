import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api";
import { dateBrPipe } from "../../../utils/pipes/datePipe";
import "./MovimentacaoDetalheModal.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toInputDateTimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function fromInputDateTimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toInputDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromInputDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function onlyDateStringFromDate(dateValue) {
  const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (!d || Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function MovimentacaoDetalheModal({
  open,
  onClose,
  caixa,
  valorCaixa,
  onSaved,
  dataSelecionada,
}) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [nomeFuncionario, setNomeFuncionario] = useState("");

  const [tiposValor, setTiposValor] = useState([]);
  const [tipoValorIdSelecionado, setTipoValorIdSelecionado] = useState("");

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);

  const dataFiltroBase = useMemo(() => {
    if (!dataSelecionada) return onlyDateStringFromDate(new Date());
    return onlyDateStringFromDate(`${dataSelecionada}T00:00:00`);
  }, [dataSelecionada]);

  const headerInfo = useMemo(() => {
    if (!caixa) return ""; 
    return `${caixa.descricao || caixa.id}`;
  }, [caixa, dataSelecionada]);

  useEffect(() => {
    if (!open) return;

    setErro(null);
    setDescricao("");
    setValor("");
    setNomeFuncionario("");

    setTipoValorIdSelecionado(
      valorCaixa?.tipoValorCaixa?.id ? String(valorCaixa.tipoValorCaixa.id) : ""
    );

    const agora = new Date();
    const base = dataFiltroBase
      ? new Date(`${dataFiltroBase}T00:00:00`)
      : new Date();

    const realizacaoInicial = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      agora.getHours(),
      agora.getMinutes()
    );

    setDataCompetencia(toInputDate(base.toISOString()));
    setDataRealizacao(toInputDateTimeLocal(realizacaoInicial.toISOString()));
  }, [open, valorCaixa, dataFiltroBase]);

  useEffect(() => {
    if (!open) return;

    api.caixaListarTiposValor()
      .then((data) => setTiposValor(data || []))
      .catch(() => setTiposValor([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tipoLocked = !!valorCaixa?.tipoValorCaixa?.id;

  const canSave =
    !!caixa?.id &&
    !!tipoValorIdSelecionado &&
    String(valor).trim().length > 0 &&
    !!fromInputDate(dataCompetencia) &&
    !!fromInputDateTimeLocal(dataRealizacao) &&
    !saving;

  async function handleSave() {
    setErro(null);

    if (!caixa?.id) {
      setErro("Caixa não informado.");
      return;
    }

    if (!tipoValorIdSelecionado) {
      setErro("Selecione o tipo de valor.");
      return;
    }

    const parsedValor = Number(String(valor).replace(",", "."));
    if (Number.isNaN(parsedValor) || parsedValor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    const competenciaIso = fromInputDate(dataCompetencia);
    if (!competenciaIso) {
      setErro("Informe uma data de competência válida.");
      return;
    }

    const realizacaoIso = fromInputDateTimeLocal(dataRealizacao);
    if (!realizacaoIso) {
      setErro("Informe uma data de realização válida.");
      return;
    }

    const dataCompetenciaDia = onlyDateStringFromDate(competenciaIso);
    const dataRealizacaoDia = onlyDateStringFromDate(realizacaoIso);

    const alterouCompetencia = dataCompetenciaDia !== dataFiltroBase;
    const alterouRealizacao = dataRealizacaoDia !== dataFiltroBase;

    if (alterouCompetencia || alterouRealizacao) {
      const confirmar = window.confirm(
        `A data informada está diferente do filtro principal da tela (${dateBrPipe(
          `${dataFiltroBase}T00:00:00`
        )}). Deseja continuar?`
      );

      if (!confirmar) return;
    }

    const payload = {
      caixaId: caixa.id,
      tipoValorCaixaId: Number(tipoValorIdSelecionado),
      valor: parsedValor,
      dataCompetencia: competenciaIso,
      descricao: descricao.trim() || null,
      dataRealizacao: realizacaoIso,
      nomeFuncionario: nomeFuncionario.trim() || null,
      anexoNome: null,
      anexoContentType: null,
      anexoArquivo: null,
    };

    try {
      setSaving(true);
      await api.post("Caixa/movimentacao", payload);
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
          <div className="mvm-modal__title">Nova movimentação</div>
          <button className="mvm-modal__close" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>

        <div className="mvm-modal__sub">{headerInfo}</div>

        <div className="mvm-modal__body">
          <div className="mvm-form__row">
            <div className="mvm-field">
              <label className="mvm-field__label">Tipo de valor</label>
              <div className="mvm-select__wrapper">
                <select
                  className="mvm-select__select"
                  value={tipoValorIdSelecionado}
                  onChange={(e) => setTipoValorIdSelecionado(e.target.value)}
                  disabled={tipoLocked || saving}
                >
                  <option value="">Selecione...</option>
                  {tiposValor.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.descricao}
                    </option>
                  ))}
                </select>
                <span className="mvm-select__arrow">▾</span>
              </div>
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
              <label className="mvm-field__label">Data de competência</label>
              <input
                className="mvm-field__input"
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
              />
            </div>

            <div className="mvm-field">
              <label className="mvm-field__label">Data de realização</label>
              <input
                className="mvm-field__input"
                type="datetime-local"
                value={dataRealizacao}
                onChange={(e) => setDataRealizacao(e.target.value)}
              />
            </div>
          </div>

          <div className="mvm-form__row">
            <div className="mvm-field">
              <label className="mvm-field__label">Funcionário (opcional)</label>
              <input
                className="mvm-field__input"
                type="text"
                placeholder="Digite o nome do funcionário"
                value={nomeFuncionario}
                onChange={(e) => setNomeFuncionario(e.target.value)}
              />
            </div>

            <div className="mvm-field">
              <label className="mvm-field__label">Descrição</label>
              <input
                className="mvm-field__input"
                placeholder="Ex.: Pagamento por fora"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
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