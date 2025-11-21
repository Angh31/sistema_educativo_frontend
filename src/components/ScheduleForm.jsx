// ====================================
// FORMULARIO DE HORARIOS
// ====================================
// Componente para crear y editar horarios de cursos

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { createSchedule, updateSchedule } from "../api/scheduleApi";
import { getCourses } from "../api/courseApi";
import "./ScheduleForm.css";

/**
 * ScheduleForm
 * ============
 * Formulario reutilizable para crear o editar horarios
 *
 * @param {Object} props
 * @param {Object|null} props.schedule - Datos del horario (null para crear nuevo)
 * @param {string} props.preSelectedCourse - ID de curso pre-seleccionado (opcional)
 * @param {Function} props.onSuccess - Callback al guardar exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 */
const ScheduleForm = ({
  schedule = null,
  preSelectedCourse = null,
  onSuccess,
  onCancel,
}) => {
  const { showToast } = useToast();
  const isEditing = !!schedule;

  // ===== DÍAS DE LA SEMANA =====
  const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Lunes" },
    { value: "TUESDAY", label: "Martes" },
    { value: "WEDNESDAY", label: "Miércoles" },
    { value: "THURSDAY", label: "Jueves" },
    { value: "FRIDAY", label: "Viernes" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
  ];

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    course_id: preSelectedCourse || "",
    day_week: "",
    start_time: "",
    end_time: "",
    classroom: "",
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * useEffect - Cargar cursos
   */
  useEffect(() => {
    loadCourses();
  }, []);

  /**
   * useEffect - Cargar datos si estamos editando
   */
  useEffect(() => {
    if (isEditing) {
      setFormData({
        course_id: schedule.course_id,
        day_week: schedule.day_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        classroom: schedule.classroom || "",
      });
    }
  }, [schedule, isEditing]);

  /**
   * loadCourses
   * ===========
   * Carga lista de cursos disponibles
   */
  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses({ limit: 1000 });
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error cargando cursos:", error);
      showToast("Error al cargar cursos", "error");
    } finally {
      setLoading(false);
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
   * validateTimes
   * =============
   * Valida que la hora de fin sea después de la de inicio
   */
  const validateTimes = () => {
    if (!formData.start_time || !formData.end_time) {
      return true; // Las validaciones required del HTML se encargan
    }

    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);

    if (end <= start) {
      showToast(
        "La hora de fin debe ser después de la hora de inicio",
        "error"
      );
      return false;
    }

    return true;
  };

  /**
   * handleSubmit
   * ============
   * Envía el formulario (crear o actualizar)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar horarios
    if (!validateTimes()) {
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        // ===== ACTUALIZAR HORARIO =====
        await updateSchedule(schedule.id, formData);
        showToast("Horario actualizado exitosamente", "success");
      } else {
        // ===== CREAR HORARIO =====
        await createSchedule(formData);
        showToast("Horario creado exitosamente", "success");
      }

      onSuccess();
    } catch (error) {
      console.error("Error guardando horario:", error);
      showToast(
        error.response?.data?.error || "Error al guardar horario",
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
      <div className="modal-content schedule-modal">
        <div className="modal-header">
          <h2>{isEditing ? "✏️ Editar Horario" : "➕ Nuevo Horario"}</h2>
          <button className="btn-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          {/* SELECCIÓN DE CURSO */}
          <div className="form-group">
            <label htmlFor="course_id">📚 Curso *</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              disabled={preSelectedCourse || isEditing}
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

          {/* DÍA DE LA SEMANA */}
          <div className="form-group">
            <label htmlFor="day_week">📅 Día de la semana *</label>
            <select
              id="day_week"
              name="day_week"
              value={formData.day_week}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona un día --</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* HORARIOS */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">⏰ Hora de inicio *</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">⏰ Hora de fin *</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* AULA */}
          <div className="form-group">
            <label htmlFor="classroom">🚪 Aula/Salón</label>
            <input
              type="text"
              id="classroom"
              name="classroom"
              value={formData.classroom}
              onChange={handleChange}
              placeholder="Ej: Aula 101, Lab. Computación, etc."
            />
          </div>

          {/* Vista previa */}
          {formData.day_week && formData.start_time && formData.end_time && (
            <div className="alert alert-info">
              <strong>📌 Vista previa:</strong>
              <br />
              {
                DAYS_OF_WEEK.find((d) => d.value === formData.day_week)?.label
              }{" "}
              de {formData.start_time} a {formData.end_time}
              {formData.classroom && ` en ${formData.classroom}`}
            </div>
          )}

          {/* BOTONES */}
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
              {submitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar Horario"
                : "Crear Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
