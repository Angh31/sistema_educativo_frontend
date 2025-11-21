// ====================================
// CONTEXT DE CONFIRMACIÓN
// ====================================
// Provee una función global para mostrar modales de confirmación

import { createContext, useState, useContext } from "react";
import ConfirmModal from "../components/ConfirmModal";

// Crear contexto
const ConfirmContext = createContext();

/**
 * ConfirmProvider
 * ===============
 * Proveedor del contexto de confirmación
 *
 * Proporciona:
 * - Función confirm() para mostrar modales
 * - Modal global que se puede usar desde cualquier componente
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes hijos
 */
export const ConfirmProvider = ({ children }) => {
  // ===== ESTADOS DEL MODAL =====
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "danger",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: () => {},
  });
  const [loading, setLoading] = useState(false);

  /**
   * confirm
   * =======
   * Muestra un modal de confirmación y retorna una Promise
   *
   * @param {Object} config - Configuración del modal
   * @param {string} config.title - Título
   * @param {string} config.message - Mensaje
   * @param {string} config.type - Tipo: "danger", "warning", "info", "logout"
   * @param {string} config.confirmText - Texto botón confirmar
   * @param {string} config.cancelText - Texto botón cancelar
   * @returns {Promise<boolean>} true si confirma, false si cancela
   *
   * Ejemplo de uso:
   * const confirmed = await confirm({
   *   title: "Eliminar Estudiante",
   *   message: "¿Estás seguro? Esta acción no se puede deshacer.",
   *   type: "danger"
   * });
   *
   * if (confirmed) {
   *   // Hacer algo
   * }
   */
  const confirm = (config) => {
    return new Promise((resolve) => {
      setModalConfig({
        title: config.title || "Confirmar acción",
        message: config.message || "¿Estás seguro de continuar?",
        type: config.type || "danger",
        confirmText: config.confirmText || "Confirmar",
        cancelText: config.cancelText || "Cancelar",
        onConfirm: () => {
          setLoading(true);
          // Simular pequeño delay para mostrar loading
          setTimeout(() => {
            setLoading(false);
            setIsOpen(false);
            resolve(true);
          }, 300);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        },
      });

      setIsOpen(true);
    });
  };

  /**
   * handleCancel
   * ============
   * Cierra el modal sin confirmar
   */
  const handleCancel = () => {
    if (modalConfig.onCancel) {
      modalConfig.onCancel();
    }
  };

  /**
   * handleConfirm
   * =============
   * Ejecuta la acción de confirmación
   */
  const handleConfirm = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm();
    }
  };

  // ===== VALOR DEL CONTEXTO =====
  const value = {
    confirm, // Función para mostrar modales
  };

  // ===== RENDER =====
  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {/* Modal global */}
      <ConfirmModal
        isOpen={isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
      />
    </ConfirmContext.Provider>
  );
};

/**
 * useConfirm
 * ==========
 * Hook para acceder a la función confirm
 *
 * @returns {Object} { confirm }
 *
 * Uso en componentes:
 * const { confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Eliminar",
 *     message: "¿Estás seguro?",
 *     type: "danger"
 *   });
 *
 *   if (confirmed) {
 *     // Hacer la acción
 *   }
 * };
 */
export const useConfirm = () => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm debe usarse dentro de un ConfirmProvider");
  }

  return context;
};
