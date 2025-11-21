// ====================================
// FORMULARIO DE PADRES
// ====================================
// Componente para crear y editar padres

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import "./ParentForm.css";

/**
 * ParentForm
 * ==========
 * Formulario reutilizable para crear o editar padres
 *
 * @param {Object} props
 * @param {Object|null} props.parent - Datos del padre (null para crear nuevo)
 * @param {Function} props.onSuccess - Callback al guardar exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 */
const ParentForm = ({ parent = null, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const isEditing = !!parent; // Si hay parent, estamos editando

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  /**
   * useEffect - Cargar datos si estamos editando
   */
  useEffect(() => {
    if (isEditing) {
      setFormData({
        email: parent.user.email,
        password: "", // No mostrar contraseña
        name: parent.name,
        last_name: parent.last_name,
        phone: parent.phone || "",
        address: parent.address || "",
      });
    }
  }, [parent, isEditing]);

  /**
   * handleChange
   * ============
   * Maneja cambios en los inputs
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * handleSubmit
   * ============
   * Envía el formulario (crear o actualizar)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (isEditing) {
        // ===== ACTUALIZAR PADRE =====
        response = await fetch(
          `http://localhost:3000/api/parents/${parent.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: formData.name,
              last_name: formData.last_name,
              phone: formData.phone,
              address: formData.address,
            }),
          }
        );
      } else {
        // ===== CREAR PADRE =====
        response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            role: "PARENT",
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar padre");
      }

      showToast(
        isEditing
          ? "Padre actualizado exitosamente"
          : "Padre creado exitosamente",
        "success"
      );
      onSuccess(); // Recargar lista
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {isEditing ? "✏️ Editar Padre/Tutor" : "➕ Nuevo Padre/Tutor"}
          </h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="parent-form">
          {/* CREDENCIALES (solo al crear) */}
          {!isEditing && (
            <div className="form-section">
              <h3>🔐 Credenciales de acceso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="padre@ejemplo.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DATOS PERSONALES */}
          <div className="form-section">
            <h3>👤 Datos personales</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Carlos"
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Apellido *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>
          </div>

          {/* CONTACTO */}
          <div className="form-section">
            <h3>📞 Información de contacto</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234-5678"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                placeholder="Dirección completa"
              />
            </div>
          </div>

          {/* Nota informativa */}
          {!isEditing && (
            <div className="alert alert-info">
              <strong>💡 Nota:</strong> Después de crear el padre, podrás
              asignarle estudiantes (hijos) desde la lista de padres.
            </div>
          )}

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Guardando..."
                : isEditing
                ? "Actualizar"
                : "Crear Padre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentForm;
