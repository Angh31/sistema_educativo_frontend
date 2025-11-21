// ====================================
// MODAL DE CAMBIAR CONTRASEÑA
// ====================================

import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { changePassword } from "../api/profileApi";
import "./ChangePasswordModal.css";

const ChangePasswordModal = ({ onSuccess, onClose }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /**
   * handleChange
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * toggleShowPassword
   */
  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  /**
   * validateForm
   */
  const validateForm = () => {
    if (!formData.currentPassword) {
      showToast("Ingresa tu contraseña actual", "error");
      return false;
    }

    if (!formData.newPassword) {
      showToast("Ingresa una nueva contraseña", "error");
      return false;
    }

    if (formData.newPassword.length < 6) {
      showToast(
        "La nueva contraseña debe tener al menos 6 caracteres",
        "error"
      );
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      showToast("La nueva contraseña debe ser diferente a la actual", "error");
      return false;
    }

    return true;
  };

  /**
   * handleSubmit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      onSuccess();
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      showToast(
        error.response?.data?.error || "Error al cambiar contraseña",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content password-modal">
        <div className="modal-header">
          <h2>🔑 Cambiar Contraseña</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          {/* Contraseña actual */}
          <div className="form-group">
            <label htmlFor="currentPassword">Contraseña actual *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => toggleShowPassword("current")}
              >
                {showPasswords.current ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="form-group">
            <label htmlFor="newPassword">Nueva contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => toggleShowPassword("new")}
              >
                {showPasswords.new ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <small className="input-hint">
              Mínimo 6 caracteres. Usa letras, números y símbolos.
            </small>
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirmar nueva contraseña *
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite la nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => toggleShowPassword("confirm")}
              >
                {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Validación visual */}
          {formData.newPassword && (
            <div className="password-strength">
              <div className="strength-indicator">
                <div
                  className={`strength-bar ${
                    formData.newPassword.length >= 8
                      ? "strong"
                      : formData.newPassword.length >= 6
                      ? "medium"
                      : "weak"
                  }`}
                ></div>
              </div>
              <span className="strength-label">
                {formData.newPassword.length >= 8
                  ? "Fuerte 💪"
                  : formData.newPassword.length >= 6
                  ? "Media 👍"
                  : "Débil ⚠️"}
              </span>
            </div>
          )}

          {/* Advertencia */}
          <div className="alert alert-warning">
            <strong>⚠️ Importante:</strong> Después de cambiar tu contraseña,
            deberás iniciar sesión nuevamente.
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
