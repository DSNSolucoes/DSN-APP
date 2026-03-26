export const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

export const num = (v, digits = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    .format(Number(v || 0));

export const int = (v) => new Intl.NumberFormat("pt-BR").format(Number(v || 0));
