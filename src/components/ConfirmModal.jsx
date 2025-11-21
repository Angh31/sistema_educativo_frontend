// ====================================
// MODAL DE CONFIRMACIÓN REUTILIZABLE
// ====================================
// Componente para confirmar acciones críticas con mejor UX

import "./ConfirmModal.css";

/**
 * ConfirmModal
 * ============
 * Modal reutilizable para confirmar acciones (eliminar, cerrar sesión, etc)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo de acción: "danger", "warning", "info"
 * @param {string} props.confirmText - Texto del botón confirmar
 * @param {string} props.cancelText - Texto del botón cancelar
 * @param {Function} props.onConfirm - Callback al confirmar
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.loading - Si está procesando la acción
 *
 * Ejemplo de uso:
 * <ConfirmModal
 *   isOpen={showModal}
 *   title="Eliminar Estudiante"
 *   message="¿Estás seguro? Esta acción no se puede deshacer."
 *   type="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowModal(false)}
 * />
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  type = "danger", // danger, warning, info
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  // ===== NO RENDERIZAR SI ESTÁ CERRADO =====
  if (!isOpen) return null;

  // ===== ICONOS SEGÚN TIPO =====
  const icons = {
    danger: "🗑️",
    warning: "⚠️",
    info: "ℹ️",
    logout: "🚪",
    success: "✅",
  };

  // ===== COLORES SEGÚN TIPO =====
  const colors = {
    danger: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    logout: "#ef4444",
    success: "#10b981",
  };

  /**
   * handleBackdropClick
   * ===================
   * Cierra el modal si se hace click fuera de él
   */
  const handleBackdropClick = (e) => {
    // Solo cerrar si el click fue en el backdrop, no en el contenido
    if (e.target.className === "confirm-modal-overlay") {
      onCancel();
    }
  };

  /**
   * handleKeyDown
   * =============
   * Manejar teclas (ESC para cancelar, Enter para confirmar)
   */
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && !loading) {
      onConfirm();
    }
  };

  // ===== RENDER: MODAL =====
  return (
    <div
      className="confirm-modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="confirm-modal-content">
        {/* Icono del tipo de acción */}
        <div
          className="confirm-modal-icon"
          style={{ backgroundColor: `${colors[type]}20` }}
        >
          <span style={{ fontSize: "3rem" }}>{icons[type]}</span>
        </div>

        {/* Título */}
        <h2 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h2>

        {/* Mensaje */}
        <p id="confirm-modal-message" className="confirm-modal-message">
          {message}
        </p>

        {/* Botones de acción */}
        <div className="confirm-modal-actions">
          {/* Botón Cancelar */}
          <button
            className="confirm-modal-btn confirm-modal-cancel"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelText}
          </button>

          {/* Botón Confirmar */}
          <button
            className="confirm-modal-btn confirm-modal-confirm"
            style={{ backgroundColor: colors[type] }}
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

        {/* Hint de teclas */}
        <div className="confirm-modal-hint">
          <small className="text-muted">
            Presiona <kbd>ESC</kbd> para cancelar o <kbd>Enter</kbd> para
            confirmar
          </small>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
