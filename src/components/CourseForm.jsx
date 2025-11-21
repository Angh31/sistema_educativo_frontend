// ====================================
// FORMULARIO DE CURSOS
// ====================================
// Componente para crear y editar cursos

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import "./CourseForm.css";

/**
 * CourseForm
 * ==========
 * Formulario reutilizable para crear o editar cursos
 */
const CourseForm = ({ course = null, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const isEditing = !!course;

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacher_id: "",
    grade_level: 1,
  });

  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  /**
   * useEffect - Cargar datos
   */
  useEffect(() => {
    loadTeachers();
    if (isEditing) {
      setFormData({
        name: course.name,
        description: course.description || "",
        teacher_id: course.teacher_id,
        grade_level: course.grade_level,
      });
    }
  }, [course]);

  /**
   * loadTeachers
   * ============
   * Carga la lista de profesores disponibles
   */
  const loadTeachers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/teachers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error cargando profesores:", error);
    }
  };

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
      const url = isEditing
        ? `http://localhost:3000/api/courses/${course.id}`
        : "http://localhost:3000/api/courses";

      response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar curso");
      }

      showToast(
        isEditing
          ? "Curso actualizado exitosamente"
          : "Curso creado exitosamente",
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
          <h2>{isEditing ? "✏️ Editar Curso" : "➕ Nuevo Curso"}</h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          {/* INFORMACIÓN DEL CURSO */}
          <div className="form-section">
            <h3>📚 Información del curso</h3>

            <div className="form-group">
              <label htmlFor="name">Nombre del curso *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Matemáticas I, Física Avanzada"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción breve del curso..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher_id">Profesor asignado *</label>
                <select
                  id="teacher_id"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Seleccionar profesor --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.last_name}
                      {teacher.specialty && ` - ${teacher.specialty}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="grade_level">Nivel/Grado *</label>
                <select
                  id="grade_level"
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1° Grado</option>
                  <option value="2">2° Grado</option>
                  <option value="3">3° Grado</option>
                  <option value="4">4° Grado</option>
                  <option value="5">5° Grado</option>
                  <option value="6">6° Grado</option>
                  <option value="7">7° Grado</option>
                  <option value="8">8° Grado</option>
                  <option value="9">9° Grado</option>
                  <option value="10">10° Grado</option>
                  <option value="11">11° Grado</option>
                  <option value="12">12° Grado</option>
                </select>
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
                : "Crear Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
