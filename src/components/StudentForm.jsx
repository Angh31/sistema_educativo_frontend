// ====================================
// FORMULARIO DE ESTUDIANTES
// ====================================
// Componente para crear y editar estudiantes

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import "./StudentForm.css";

/**
 * StudentForm
 * ===========
 * Formulario reutilizable para crear o editar estudiantes
 *
 * @param {Object} props
 * @param {Object|null} props.student - Datos del estudiante (null para crear nuevo)
 * @param {Function} props.onSuccess - Callback al guardar exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 */
const StudentForm = ({ student = null, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const isEditing = !!student; // Si hay student, estamos editando

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
    birth_date: "",
    gender: "M",
    phone: "",
    address: "",
    parent_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]); // Lista de padres disponibles

  /**
   * useEffect - Cargar datos si estamos editando
   */
  useEffect(() => {
    if (isEditing) {
      setFormData({
        email: student.user.email,
        password: "", // No mostrar contraseña
        name: student.name,
        last_name: student.last_name,
        birth_date: student.birth_date ? student.birth_date.split("T")[0] : "",
        gender: student.gender || "M",
        phone: student.phone || "",
        address: student.address || "",
        parent_id: student.parent_id || "",
      });
    }
    loadParents();
  }, [student]);

  /**
   * loadParents
   * ===========
   * Carga la lista de padres disponibles
   */
  const loadParents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/parents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setParents(data);
    } catch (error) {
      console.error("Error cargando padres:", error);
    }
  };

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
        // ===== ACTUALIZAR ESTUDIANTE =====
        response = await fetch(
          `http://localhost:3000/api/students/${student.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: formData.name,
              last_name: formData.last_name,
              birth_date: formData.birth_date,
              gender: formData.gender,
              phone: formData.phone,
              address: formData.address,
              parent_id: formData.parent_id || null,
            }),
          }
        );
      } else {
        // ===== CREAR ESTUDIANTE =====
        response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            role: "STUDENT",
            parent_id: formData.parent_id || null,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar estudiante");
      }

      showToast(
        isEditing
          ? "Estudiante actualizado exitosamente"
          : "Estudiante creado exitosamente",
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
          <h2>{isEditing ? "✏️ Editar Estudiante" : "➕ Nuevo Estudiante"}</h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          {/* DATOS DE USUARIO (solo al crear) */}
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
                    placeholder="estudiante@ejemplo.com"
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
                  placeholder="Juan"
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birth_date">Fecha de nacimiento *</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Género *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
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
              <div className="form-group">
                <label htmlFor="parent_id">Padre/Tutor</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                >
                  <option value="">-- Sin asignar --</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} {parent.last_name}
                    </option>
                  ))}
                </select>
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
                : "Crear Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
