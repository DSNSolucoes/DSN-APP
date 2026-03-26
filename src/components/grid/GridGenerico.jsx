import React, { useMemo, useState } from "react";
import "./GridGenerico.css";

export function GridGenerico({
  data = [],
  columns = [],
  sort: controlledSort,
  onSortChange,
  keyField,
  renderCell,
}) {
  const [internalSort, setInternalSort] = useState({
    colunaOrdenacao: null,
    direcao: null, // "asc" | "desc" | null
  });

  const sort = controlledSort ?? internalSort;

  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return data;
    if (!sort?.colunaOrdenacao || !sort?.direcao) return data;

    const field = sort.colunaOrdenacao;
    const dir = sort.direcao;

    function normalize(v) {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      if (v instanceof Date) return v.getTime();
      if (typeof v === "string") {
        const s = v.trim();

        // tenta ISO date/datetime
        const t = Date.parse(s);
        if (!Number.isNaN(t) && /\d{4}-\d{2}-\d{2}/.test(s)) return t;

        // tenta número com vírgula pt-BR (ex: "1.234,56")
        const num = Number(
          s
            .replace(/\./g, "")
            .replace(/,/g, ".")
            .replace(/[^0-9.-]/g, "")
        );
        if (!Number.isNaN(num) && /\d/.test(s)) return num;

        return s;
      }
      return String(v);
    }

    function compare(a, b) {
      const av = normalize(a?.[field]);
      const bv = normalize(b?.[field]);

      // nulls por último
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return av - bv;
      }

      return String(av).localeCompare(String(bv), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
    }

    const copy = [...data];
    copy.sort((a, b) => {
      const c = compare(a, b);
      return dir === "asc" ? c : -c;
    });
    return copy;
  }, [data, sort?.colunaOrdenacao, sort?.direcao]);

  const normalizedColumns = useMemo(() => {
    return columns.map((c, idx) => ({
      ...c,
      __idx: idx,
      __width: `${Number(c.tamanho) || 0}%`,
      __sortable: Boolean(c.colunaOrdenacao),
      __key: `${c.colunaOrdenacao || "col"}_${idx}`,
      __className: c.className || "",
    }));
  }, [columns]);

  function cycleDirection(currentDir) {
    // null -> asc -> desc -> null
    if (currentDir === null) return "asc";
    if (currentDir === "asc") return "desc";
    return null;
  }

  function handleSortClick(col) {
    if (!col.__sortable) return;

    const isSame = sort.colunaOrdenacao === col.colunaOrdenacao;
    const nextDir = cycleDirection(isSame ? sort.direcao : null);

    const nextSort = {
      colunaOrdenacao: nextDir ? col.colunaOrdenacao : null,
      direcao: nextDir,
    };

    if (!controlledSort) setInternalSort(nextSort);
    onSortChange?.(nextSort);
  }

  return (
    <div className="gridg-wrap">
      <div className="gridg-table" role="table" aria-label="Grid genérico">
        {/* Header */}
        <div className="gridg-row gridg-header" role="row">
          {normalizedColumns.map((col) => {
            const isActive = sort.colunaOrdenacao === col.colunaOrdenacao && !!sort.direcao;

            const icon =
              !isActive ? "" : (sort.direcao === "asc" ? "▲" : "▼");

            return (
              <div
                key={col.__key}
                className={`gridg-cell gridg-headcell ${col.__sortable ? "sortable" : ""} ${col.__className}`}
                role="columnheader"
                style={{ width: col.__width }}
                onClick={() => handleSortClick(col)}
                title={col.__sortable ? "Clique para ordenar" : undefined}
              >
                <span className={`gridg-headtext ${isActive ? "active-col" : ""}`}>
                  {col.descricaoColunaGrid}
                </span>

                {/* só mostra se estiver ordenando */}
                {icon && <span className="gridg-sorticon">{icon}</span>}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="gridg-body" role="rowgroup">
          {(!sortedData || sortedData.length === 0) ? (
            <div className="gridg-empty">Nenhum registro.</div>
          ) : (
            sortedData.map((row, rowIndex) => {
              const key = keyField ? row?.[keyField] : rowIndex;
              const zebraClass = rowIndex % 2 === 0 ? "zebra-even" : "zebra-odd";

              return (
                <div key={key} className={`gridg-row ${zebraClass}`} role="row">
                  {normalizedColumns.map((col) => {
                    const content =
                      renderCell
                        ? renderCell(row, col, rowIndex)
                        : (row?.[col.colunaOrdenacao] ?? "");

                    return (
                      <div
                        key={col.__key}
                        className={`gridg-cell ${col.__className}`}
                        role="cell"
                        style={{ width: col.__width }}
                        data-label={col.descricaoColunaGrid}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}