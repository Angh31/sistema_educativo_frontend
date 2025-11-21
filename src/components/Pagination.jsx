// ====================================
// COMPONENTE DE PAGINACIÓN REUTILIZABLE
// ====================================

import "./Pagination.css";

/**
 * Pagination
 * ==========
 * Componente de paginación genérico
 *
 * @param {Object} props
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {function} props.onPageChange - Callback al cambiar página
 * @param {boolean} props.hasNextPage - Si hay página siguiente
 * @param {boolean} props.hasPrevPage - Si hay página anterior
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) => {
  // Generar array de números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {/* Botón anterior */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        ← Anterior
      </button>

      {/* Primera página */}
      {currentPage > 3 && (
        <>
          <button className="pagination-number" onClick={() => onPageChange(1)}>
            1
          </button>
          {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {/* Números de página */}
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          className={`pagination-number ${
            pageNum === currentPage ? "active" : ""
          }`}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      {/* Última página */}
      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className="pagination-number"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón siguiente */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Siguiente →
      </button>
    </div>
  );
};

export default Pagination;
