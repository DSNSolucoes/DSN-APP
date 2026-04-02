// src/components/MesAnoSelector/MesAnoSelector.jsx
import React from 'react';
import './MesAnoSelector.css';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function gerarAnos() {
  const ano = new Date().getFullYear();
  const anos = [];
  for (let i = ano - 3; i <= ano + 1; i++) anos.push(i);
  return anos;
}


export function MesAnoSelector({ mes, ano, onChangeMes, onChangeAno, label = 'Competência' }) {
  return (
    <div className="mes-ano-selector">
      {label && <span className="mes-ano-selector__label">{label}</span>}
      <div className="mes-ano-selector__controls">
        <div className="mes-ano-selector__group">
          <span className="mes-ano-selector__sublabel">Mês</span>
          <select
            className="mes-ano-selector__select"
            value={mes}
            onChange={(e) => onChangeMes(Number(e.target.value))}
          >
            {MESES.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>{m}</option>
            ))}
          </select>
        </div>

        <div className="mes-ano-selector__group">
          <span className="mes-ano-selector__sublabel">Ano</span>
          <select
            className="mes-ano-selector__select"
            value={ano}
            onChange={(e) => onChangeAno(Number(e.target.value))}
          >
            {gerarAnos().map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
