// ====================================
// FORMULARIO DE INSCRIPCIÓN INDIVIDUAL
// ====================================
// Componente para inscribir UN estudiante a UN curso

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { createEnrollment } from "../api/enrollmentApi";
import { getStudents } from "../api/studentApi";
import { getCourses } from "../api/courseApi";
import "./EnrollmentForm.css";

/**
 * EnrollmentForm
 * ==============
 * Formulario para inscribir un estudiante en un curso
 *
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback al inscribir exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {string} props.preSelectedCourse - ID de curso pre-seleccionado (opcional)
 * @param {string} props.preSelectedStudent - ID de estudiante pre-seleccionado (opcional)
 */
const EnrollmentForm = ({
  onSuccess,
  onCancel,
  preSelectedCourse = null,
  preSelectedStudent = null,
}) => {
  const { showToast } = useToast();

  // ===== ESTADOS =====
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(
    preSelectedStudent || ""
  );
  const [selectedCourse, setSelectedCourse] = useState(preSelectedCourse || "");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * useEffect - Cargar estudiantes y cursos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * loadData
   * ========
   * Carga la lista de estudiantes y cursos disponibles
   */
  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsData, coursesData] = await Promise.all([
        getStudents({ limit: 1000 }), // Traer todos
        getCourses({ limit: 1000 }), // Traer todos
      ]);

      setStudents(studentsData.students || []);
      setCourses(coursesData.courses || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleSubmit
   * ============
   * Envía la inscripción
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!selectedStudent) {
      showToast("Selecciona un estudiante", "error");
      return;
    }

    if (!selectedCourse) {
      showToast("Selecciona un curso", "error");
      return;
    }

    try {
      setSubmitting(true);

      await createEnrollment({
        student_id: selectedStudent,
        course_id: selectedCourse,
      });

      showToast("Estudiante inscrito exitosamente", "success");
      onSuccess();
    } catch (error) {
      console.error("Error inscribiendo:", error);
      showToast(
        error.response?.data?.error || "Error al inscribir estudiante",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: FORMULARIO =====
  return (
    <div className="modal-overlay">
      <div className="modal-content enrollment-modal">
        <div className="modal-header">
          <h2>📝 Inscribir Estudiante a Curso</h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="enrollment-form">
          {/* Selector de Estudiante */}
          <div className="form-group">
            <label htmlFor="student">👨‍🎓 Seleccionar Estudiante *</label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              disabled={preSelectedStudent}
            >
              <option value="">-- Selecciona un estudiante --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.last_name} ({student.user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Curso */}
          <div className="form-group">
            <label htmlFor="course">📚 Seleccionar Curso *</label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
              disabled={preSelectedCourse}
            >
              <option value="">-- Selecciona un curso --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - Nivel {course.grade_level} (
                  {course.teacher.name} {course.teacher.last_name})
                </option>
              ))}
            </select>
          </div>

          {/* Info adicional */}
          {selectedStudent && selectedCourse && (
            <div className="alert alert-info">
              <strong>✅ Listo para inscribir:</strong>
              <br />
              {students.find((s) => s.id === selectedStudent)?.name}{" "}
              {students.find((s) => s.id === selectedStudent)?.last_name} en{" "}
              {courses.find((c) => c.id === selectedCourse)?.name}
            </div>
          )}

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Inscribiendo..." : "Inscribir Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentForm;
