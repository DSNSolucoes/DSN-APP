// src/utils/pipes/datePipe.js
// "Pipe" simples para formatação de data no padrão pt-BR.

/**
 * Formata uma data ISO (ou Date) para pt-BR.
 * - Retorna "" para valores nulos/invalidos
 * - Ignora placeholder "0001-01-01..."
 */
export function dateBrPipe(value, { withTime = true } = {}) {
  if (!value) return "";

  if (typeof value === "string" && value.startsWith("0001-")) return "";

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const options = withTime
    ? {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

  return d.toLocaleString("pt-BR", options);
}
