// ====================================
// COMPONENTE DE LOADING REUTILIZABLE
// ====================================

import "./LoadingSpinner.css";

/**
 * LoadingSpinner
 * ==============
 * Componente reutilizable para mostrar estados de carga
 *
 * @param {Object} props
 * @param {string} props.message - Mensaje opcional a mostrar
 * @param {string} props.size - Tamaño: "small", "medium", "large"
 */
const LoadingSpinner = ({ message = "Cargando...", size = "medium" }) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="spinner-circle"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
