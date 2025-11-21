// ====================================
// CONTEXTO DE NOTIFICACIONES TOAST
// ====================================
import { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";

// Crear contexto
const ToastContext = createContext();

/**
 * ToastProvider
 * =============
 * Proveedor del contexto de toasts
 * Maneja el estado y renderizado de notificaciones
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * showToast
   * =========
   * Muestra una notificación toast
   *
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: "success", "error", "warning", "info"
   * @param {number} duration - Duración en ms (default: 3000)
   */
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random(); // ID único

    const newToast = {
      id,
      message,
      type,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remover después de la duración
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  /**
   * Shortcuts para tipos específicos
   */
  const showSuccess = (message, duration) =>
    showToast(message, "success", duration);
  const showError = (message, duration) =>
    showToast(message, "error", duration);
  const showWarning = (message, duration) =>
    showToast(message, "warning", duration);
  const showInfo = (message, duration) => showToast(message, "info", duration);

  /**
   * removeToast
   * ===========
   * Remueve un toast específico
   */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Contenedor de toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * useToast
 * ========
 * Hook para usar el contexto de toasts
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
};
