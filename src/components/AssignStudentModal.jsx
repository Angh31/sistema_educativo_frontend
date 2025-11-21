// ====================================
// MODAL PARA ASIGNAR ESTUDIANTES A PADRE
// ====================================

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import "./AssignStudentModal.css";

/**
 * AssignStudentModal
 * ==================
 * Modal para asignar/desasignar estudiantes a un padre
 *
 * @param {Object} props
 * @param {Object} props.parent - Padre al que se le asignarán hijos
 * @param {Function} props.onSuccess - Callback al asignar exitosamente
 * @param {Function} props.onClose - Callback al cerrar
 */
const AssignStudentModal = ({ parent, onSuccess, onClose }) => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]); // Todos los estudiantes
  const [selectedStudents, setSelectedStudents] = useState([]); // IDs seleccionados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * useEffect - Cargar estudiantes
   */
  useEffect(() => {
    loadStudents();
  }, []);

  /**
   * loadStudents
   * ============
   * Carga todos los estudiantes del sistema
   */
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/students?limit=1000",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      setStudents(data.students || []);

      // Pre-seleccionar estudiantes que ya tienen este padre
      const currentChildren = data.students
        .filter((s) => s.parent_id === parent.id)
        .map((s) => s.id);
      setSelectedStudents(currentChildren);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
      showToast("Error al cargar estudiantes", "error");
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
      // Quitar
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      // Agregar
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  /**
   * handleSave
   * ==========
   * Guarda las asignaciones
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      // Actualizar cada estudiante seleccionado
      const promises = students.map(async (student) => {
        const shouldHaveParent = selectedStudents.includes(student.id);
        const currentlyHasParent = student.parent_id === parent.id;

        // Solo actualizar si hay cambio
        if (shouldHaveParent !== currentlyHasParent) {
          return fetch(`http://localhost:3000/api/students/${student.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              parent_id: shouldHaveParent ? parent.id : null,
            }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      showToast("Hijos asignados correctamente", "success");
      onSuccess();
    } catch (error) {
      console.error("Error asignando hijos:", error);
      showToast("Error al asignar hijos", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Filtrar estudiantes por búsqueda
   */
  const filteredStudents = students.filter(
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
            <p>Cargando estudiantes...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: MODAL =====
  return (
    <div className="modal-overlay">
      <div className="modal-content assign-modal">
        <div className="modal-header">
          <h2>
            👨‍👩‍👧 Asignar Hijos a {parent.name} {parent.last_name}
          </h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="assign-modal-body">
          {/* Buscador */}
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Contador */}
          <div className="selected-count">
            {selectedStudents.length} estudiante(s) seleccionado(s)
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
                    {student.parent_id && student.parent_id !== parent.id && (
                      <p className="student-check-warning">
                        ⚠️ Ya tiene otro padre asignado
                      </p>
                    )}
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

        {/* Botones */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Asignaciones"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentModal;
