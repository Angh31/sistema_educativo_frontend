// ====================================
// COMPONENTE DE NOTIFICACIONES TOAST
// ====================================

import { useEffect } from "react";
import "./Toast.css";

/**
 * Toast
 * =====
 * Componente para mostrar notificaciones temporales
 *
 * @param {Object} props
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo: "success", "error", "warning", "info"
 * @param {function} props.onClose - Callback al cerrar
 * @param {number} props.duration - Duración en ms (default: 3000)
 */
const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
