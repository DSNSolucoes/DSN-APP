import React, { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { useNCM } from '../../context/NCMContext';
import { api } from '../../api';
import { obterNCM } from '../../api/comboService';
import './NCMPage.css';

export function NCMPage() {
  const { setNcmSelecionado } = useNCM();

  const [ncms, setNcms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Formulário de cadastro
  const [novoNCM, setNovoNCM] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoPadrao, setNovoPadrao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState({});
  const [deletandoId, setDeletandoId] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    api.ncmListar()
      .then((data) => setNcms(data || []))
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar NCMs.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function validar() {
    const erros = {};
    const ncmLimpo = novoNCM.trim();
    if (!ncmLimpo) erros.ncm = 'NCM é obrigatório.';
    else if (!/^\d{4,8}$/.test(ncmLimpo.replace(/[.\-]/g, '')))
      erros.ncm = 'NCM deve conter entre 4 e 8 dígitos.';
    return erros;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    const erros = validar();
    if (Object.keys(erros).length > 0) { setErroForm(erros); return; }
    setErroForm({});
    setSalvando(true);
    try {
      await api.ncmCriar({
        nCM: novoNCM.trim(),
        descricao: novoDescricao.trim(),
        padrao: novoPadrao ? 'V' : 'F',
      });
      setNovoNCM('');
      setNovoDescricao('');
      setNovoPadrao(false);
      carregar();
      // Atualiza o contexto global de NCM
      obterNCM().then((lista) => {
        const padrao = lista?.find((n) => n.padrao === 'V' || n.Padrao === 'V');
        if (padrao) setNcmSelecionado(padrao);
      }).catch(() => {});
    } catch (err) {
      console.error(err);
      setErro('Erro ao salvar NCM.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id) {
    if (!window.confirm('Confirma a exclusão deste NCM?')) return;
    setDeletandoId(id);
    try {
      await api.ncmDeletar(id);
      carregar();
    } catch (err) {
      console.error(err);
      setErro('Erro ao excluir NCM.');
    } finally {
      setDeletandoId(null);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>NCM</h2>
      </header>

      {/* ── Formulário de cadastro ── */}
      <form className="ncm-form" onSubmit={handleSalvar} noValidate>
        <div className="ncm-form__group">
          <span className="ncm-form__label">NCM *</span>
          <input
            type="text"
            placeholder="ex: 2106.90.10"
            value={novoNCM}
            onChange={(e) => { setNovoNCM(e.target.value); setErroForm((p) => ({ ...p, ncm: '' })); }}
            className={erroForm.ncm ? 'input-error' : ''}
            maxLength={10}
          />
          {erroForm.ncm && <span className="ncm-form__error">{erroForm.ncm}</span>}
        </div>

        <div className="ncm-form__group">
          <span className="ncm-form__label">Descrição</span>
          <input
            type="text"
            placeholder="Descrição opcional"
            value={novoDescricao}
            onChange={(e) => setNovoDescricao(e.target.value)}
            maxLength={100}
          />
        </div>

        <label className="ncm-form__toggle">
          <input
            type="checkbox"
            checked={novoPadrao}
            onChange={(e) => setNovoPadrao(e.target.checked)}
          />
          Padrão
        </label>

        <button type="submit" className="ncm-btn" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Adicionar'}
        </button>
      </form>

      {erro && <div className="ncm-erro">{erro}</div>}

      {loading && <p className="muted">Carregando...</p>}

      {!loading && ncms.length === 0 && (
        <EmptyState
          title="Nenhum NCM cadastrado"
          description="Use o formulário acima para adicionar o primeiro NCM."
        />
      )}

      {!loading && ncms.length > 0 && (
        <div className="ncm-table-wrap">
          <table className="ncm-table">
            <thead>
              <tr>
                <th>NCM</th>
                <th>Descrição</th>
                <th>Padrão</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ncms.map((ncm) => {
                const id = ncm.id ?? ncm.Id;
                const codigo = ncm.nCM ?? ncm.ncm ?? ncm.NCM ?? '-';
                const descricao = ncm.descricao ?? ncm.Descricao ?? '';
                const padrao = ncm.padrao === 'V' || ncm.Padrao === 'V';
                return (
                  <tr key={id}>
                    <td><strong>{codigo}</strong></td>
                    <td>{descricao}</td>
                    <td>{padrao && <span className="ncm-badge-padrao">Padrão</span>}</td>
                    <td>
                      <button
                        className="ncm-btn-delete"
                        onClick={() => handleDeletar(id)}
                        disabled={deletandoId === id}
                      >
                        {deletandoId === id ? '...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
