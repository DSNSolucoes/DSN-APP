// src/models/FechamentoCaixa/FechamentoCaixaModels.js

/**
 * Modelos baseados no retorno do backend.
 * Mantém as propriedades com os mesmos nomes do back para facilitar o mapeamento.
 */

export class TipoValorCaixa {
  /** @param {{id:number, descricao:string}} data */
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.descricao = data.descricao ?? "";
  }

  static fromJson(json) {
    return new TipoValorCaixa(json || {});
  }
}

export class DetalheValorCaixa {
  /**
   * @param {{
   *  id:number,
   *  descricao:string,
   *  valor:number,
   *  dataCadastro:string,
   *  dataRealizacao:string,
   *  funcionarioId:number|null,
   *  nomeFuncionario:string|null
   * }} data
   */
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.descricao = data.descricao ?? "";
    this.valor = Number(data.valor ?? 0);
    this.dataCadastro = data.dataCadastro ?? null;
    this.dataRealizacao = data.dataRealizacao ?? null;
    this.funcionarioId = data.funcionarioId ?? null;
    this.nomeFuncionario = data.nomeFuncionario ?? null;
  }

  static fromJson(json) {
    return new DetalheValorCaixa(json || {});
  }
}

export class ValorCaixa {
  /**
   * @param {{
   *  id:number,
   *  valorTotal:number,
   *  tipoValorCaixa: any,
   *  detalhes: any[]
   * }} data
   */
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.valorTotal = Number(data.valorTotal ?? 0);
    this.tipoValorCaixa = TipoValorCaixa.fromJson(data.tipoValorCaixa);
    this.detalhes = Array.isArray(data.detalhes)
      ? data.detalhes.map(DetalheValorCaixa.fromJson)
      : [];
  }

  static fromJson(json) {
    return new ValorCaixa(json || {});
  }
}

export class CaixaFechamento {
  /**
   * @param {{
   *  id:number,
   *  descricao:string,
   *  valores:any[]
   * }} data
   */
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.descricao = data.descricao ?? "";
    this.valores = Array.isArray(data.valores)
      ? data.valores.map(ValorCaixa.fromJson)
      : [];
  }

  static fromJson(json) {
    return new CaixaFechamento(json || {});
  }
}

/**
 * Helper para mapear o retorno (array) do backend.
 * @param {any} json
 * @returns {CaixaFechamento[]}
 */
export function mapFechamentoCaixaResponse(json) {
  if (!Array.isArray(json)) return [];
  return json.map(CaixaFechamento.fromJson);
}
