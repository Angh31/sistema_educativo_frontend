// ====================================
// MODAL DE INSCRIPCIÓN MASIVA
// ====================================
// Componente para inscribir MÚLTIPLES estudiantes a UN curso

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import {
  bulkEnrollment,
  getAvailableStudentsForCourse,
} from "../api/enrollmentApi";
import "./BulkEnrollmentModal.css";

/**
 * BulkEnrollmentModal
 * ===================
 * Modal para inscribir varios estudiantes a un curso de una vez
 *
 * @param {Object} props
 * @param {Object} props.course - Curso al que se inscribirán los estudiantes
 * @param {Function} props.onSuccess - Callback al inscribir exitosamente
 * @param {Function} props.onClose - Callback al cerrar
 */
const BulkEnrollmentModal = ({ course, onSuccess, onClose }) => {
  const { showToast } = useToast();

  // ===== ESTADOS =====
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * useEffect - Cargar estudiantes disponibles
   */
  useEffect(() => {
    loadAvailableStudents();
  }, []);

  /**
   * loadAvailableStudents
   * =====================
   * Carga estudiantes que NO están inscritos en este curso
   */
  const loadAvailableStudents = async () => {
    try {
      setLoading(true);
      const data = await getAvailableStudentsForCourse(course.id);
      setAvailableStudents(data.students || []);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
      showToast("Error al cargar estudiantes disponibles", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleToggleStudent
   * ===================
   * Agrega o quita un estudiante de la selección
   */
  const handleToggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  /**
   * handleSelectAll
   * ===============
   * Selecciona todos los estudiantes filtrados
   */
  const handleSelectAll = () => {
    const filtered = filteredStudents.map((s) => s.id);
    setSelectedStudents(filtered);
  };

  /**
   * handleDeselectAll
   * =================
   * Deselecciona todos
   */
  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  /**
   * handleSubmit
   * ============
   * Inscribe todos los estudiantes seleccionados
   */
  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      showToast("Selecciona al menos un estudiante", "error");
      return;
    }

    try {
      setSubmitting(true);

      await bulkEnrollment({
        course_id: course.id,
        student_ids: selectedStudents,
      });

      showToast(
        `${selectedStudents.length} estudiante(s) inscrito(s) exitosamente`,
        "success"
      );
      onSuccess();
    } catch (error) {
      console.error("Error en inscripción masiva:", error);
      showToast(
        error.response?.data?.error || "Error al inscribir estudiantes",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Filtrar estudiantes por búsqueda
   */
  const filteredStudents = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando estudiantes disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: SIN ESTUDIANTES DISPONIBLES =====
  if (availableStudents.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content bulk-modal">
          <div className="modal-header">
            <h2>📝 Inscripción Masiva</h2>
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="empty-state">
            <p className="text-center text-muted">
              No hay estudiantes disponibles para inscribir en este curso.
              <br />
              Todos los estudiantes ya están inscritos.
            </p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: MODAL =====
  return (
    <div className="modal-overlay">
      <div className="modal-content bulk-modal">
        <div className="modal-header">
          <h2>📝 Inscripción Masiva</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bulk-modal-info">
          <h3>Curso: {course.name}</h3>
          <p>
            Docente: {course.teacher.name} {course.teacher.last_name}
          </p>
        </div>

        <div className="bulk-modal-body">
          {/* Barra de búsqueda */}
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Controles de selección */}
          <div className="selection-controls">
            <div className="selected-count">
              {selectedStudents.length} de {filteredStudents.length}{" "}
              seleccionado(s)
            </div>
            <div className="selection-buttons">
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn-sm btn-secondary"
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="btn-sm btn-secondary"
              >
                Deseleccionar todos
              </button>
            </div>
          </div>

          {/* Lista de estudiantes */}
          <div className="students-checklist">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`student-check-item ${
                    selectedStudents.includes(student.id) ? "selected" : ""
                  }`}
                  onClick={() => handleToggleStudent(student.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="student-check-info">
                    <p className="student-check-name">
                      {student.name} {student.last_name}
                    </p>
                    <p className="student-check-email">{student.user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">
                No se encontraron estudiantes
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting || selectedStudents.length === 0}
          >
            {submitting
              ? "Inscribiendo..."
              : `Inscribir ${selectedStudents.length} Estudiante(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkEnrollmentModal;
