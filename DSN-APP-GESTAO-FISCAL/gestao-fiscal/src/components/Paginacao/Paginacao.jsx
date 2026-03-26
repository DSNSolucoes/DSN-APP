import React, { useEffect, useMemo, useState } from "react";
import "./Paginacao.css";

/* Ícones (SVG) */
const IconChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronsLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronsRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Props:
 * - page: 1-based
 * - pageSize: 20|50|200|0 (0 = Tudo)
 * - totalRecords
 * - onChangePage
 * - onChangePageSize
 * - disabled
 */
export function Paginacao({
  page = 1,
  pageSize = 20,
  totalRecords = 0,
  onChangePage,
  onChangePageSize,
  disabled = false,
}) {
  const pageSizeOptions = useMemo(
    () => [
      { label: "20", value: 20 },
      { label: "50", value: 50 },
      { label: "200", value: 200 },
      { label: "Tudo", value: 0 },
    ],
    []
  );

  const totalPages = useMemo(() => {
    const tr = Number(totalRecords) || 0;
    const ps = Number(pageSize) || 0;
    if (ps <= 0) return 1;
    return Math.max(1, Math.ceil(tr / ps));
  }, [totalRecords, pageSize]);

  const windowSize = 10;
  const [windowStart, setWindowStart] = useState(1);

  useEffect(() => {
    const p = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const desiredStart = Math.floor((p - 1) / windowSize) * windowSize + 1;
    setWindowStart(desiredStart);
  }, [page, totalPages]);

  const windowEnd = useMemo(
    () => Math.min(totalPages, windowStart + windowSize - 1),
    [totalPages, windowStart]
  );

  const pages = useMemo(() => {
    const list = [];
    for (let i = windowStart; i <= windowEnd; i++) list.push(i);
    return list;
  }, [windowStart, windowEnd]);

  const canShiftLeft = windowStart > 1;
  const canShiftRight = windowEnd < totalPages;

  const currentPage = useMemo(
    () => Math.min(Math.max(1, Number(page) || 1), totalPages),
    [page, totalPages]
  );

  function safeChangePage(nextPage) {
    if (disabled) return;
    const np = Math.min(Math.max(1, nextPage), totalPages);
    if (np === currentPage) return;
    onChangePage?.(np);
  }

  function handleShiftLeft() {
    if (disabled || !canShiftLeft) return;
    const nextStart = Math.max(1, windowStart - windowSize);
    setWindowStart(nextStart);
  }

  function handleShiftRight() {
    if (disabled || !canShiftRight) return;
    const nextStart = windowStart + windowSize;
    setWindowStart(Math.min(nextStart, Math.max(1, totalPages - windowSize + 1)));
  }

  function handlePageSizeChange(e) {
    if (disabled) return;
    const nextSize = Number(e.target.value);
    onChangePageSize?.(nextSize);
    onChangePage?.(1);
  }

  const showingAll = Number(pageSize) === 0;

  return (
    <div className={`paginacao ${disabled ? "is-disabled" : ""}`}>
      <div className="paginacao__left">
        <label className="paginacao__label">
          Itens por página
          <select
            className="paginacao__select"
            value={Number(pageSize)}
            onChange={handlePageSizeChange}
            disabled={disabled}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <span className="paginacao__meta">
          Total: <strong>{Number(totalRecords) || 0}</strong>
        </span>
      </div>

      <div className="paginacao__right">
        {/* Prev */}
        <button
          type="button"
          className="paginacao__btn paginacao__btn--icon"
          onClick={() => safeChangePage(currentPage - 1)}
          disabled={disabled || showingAll || currentPage <= 1}
          title="Anterior"
          aria-label="Anterior"
        >
          <IconChevronLeft />
        </button>

        {/* Shift janela esquerda */}
        {!showingAll && canShiftLeft && (
          <>
            <button
              type="button"
              className="paginacao__btn paginacao__btn--icon"
              onClick={handleShiftLeft}
              disabled={disabled}
              title="Voltar páginas"
              aria-label="Voltar páginas"
            >
              <IconChevronsLeft />
            </button>

            <span className="paginacao__dots">…</span>
          </>
        )}

        {/* Números */}
        {showingAll ? (
          <span className="paginacao__single">1</span>
        ) : (
          <div className="paginacao__pages">
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                className={`paginacao__page ${p === currentPage ? "is-active" : ""}`}
                onClick={() => safeChangePage(p)}
                disabled={disabled}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Shift janela direita */}
        {!showingAll && canShiftRight && (
          <>
            <span className="paginacao__dots">…</span>

            <button
              type="button"
              className="paginacao__btn paginacao__btn--icon"
              onClick={handleShiftRight}
              disabled={disabled}
              title="Avançar páginas"
              aria-label="Avançar páginas"
            >
              <IconChevronsRight />
            </button>
          </>
        )}

        {/* Next */}
        <button
          type="button"
          className="paginacao__btn paginacao__btn--icon"
          onClick={() => safeChangePage(currentPage + 1)}
          disabled={disabled || showingAll || currentPage >= totalPages}
          title="Próxima"
          aria-label="Próxima"
        >
          <IconChevronRight />
        </button>

        <span className="paginacao__meta paginacao__meta--right">
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </span>
      </div>
    </div>
  );
}