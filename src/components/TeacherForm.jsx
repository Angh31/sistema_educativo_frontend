// ====================================
// FORMULARIO DE PROFESORES
// ====================================
// Componente para crear y editar profesores

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import "./TeacherForm.css";

/**
 * TeacherForm
 * ===========
 * Formulario reutilizable para crear o editar profesores
 */
const TeacherForm = ({ teacher = null, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const isEditing = !!teacher;

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
    specialty: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  /**
   * useEffect - Cargar datos si estamos editando
   */
  useEffect(() => {
    if (isEditing) {
      setFormData({
        email: teacher.user.email,
        password: "",
        name: teacher.name,
        last_name: teacher.last_name,
        specialty: teacher.specialty || "",
        phone: teacher.phone || "",
      });
    }
  }, [teacher]);

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
   * handleSubmit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (isEditing) {
        // ===== ACTUALIZAR PROFESOR =====
        response = await fetch(
          `http://localhost:3000/api/teachers/${teacher.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: formData.name,
              last_name: formData.last_name,
              specialty: formData.specialty,
              phone: formData.phone,
            }),
          }
        );
      } else {
        // ===== CREAR PROFESOR =====
        response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            role: "TEACHER",
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar profesor");
      }

      showToast(
        isEditing
          ? "Profesor actualizado exitosamente"
          : "Profesor creado exitosamente",
        "success"
      );
      onSuccess();
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
          <h2>{isEditing ? "✏️ Editar Profesor" : "➕ Nuevo Profesor"}</h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="teacher-form">
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
                    placeholder="profesor@ejemplo.com"
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
                  placeholder="María"
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
                  placeholder="González"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specialty">Especialidad</label>
                <input
                  type="text"
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Matemáticas, Física, etc."
                />
              </div>
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
          </div>

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
                : "Crear Profesor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
