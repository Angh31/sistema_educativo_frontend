// ====================================
// VISTA DE CALENDARIO SEMANAL
// ====================================
// Componente para visualizar horarios en formato de calendario

import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { getSchedules, deleteSchedule } from "../api/scheduleApi";
import ScheduleForm from "./ScheduleForm";
import "./WeeklyScheduleView.css";

/**
 * WeeklyScheduleView
 * ==================
 * Vista de calendario semanal con todos los horarios
 * Muestra una grilla con días de la semana y bloques horarios
 */
const WeeklyScheduleView = () => {
  const { showToast } = useToast();

  // ===== CONSTANTES =====
  const DAYS = [
    { value: "MONDAY", label: "Lunes" },
    { value: "TUESDAY", label: "Martes" },
    { value: "WEDNESDAY", label: "Miércoles" },
    { value: "THURSDAY", label: "Jueves" },
    { value: "FRIDAY", label: "Viernes" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
  ];

  // ===== ESTADOS =====
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  /**
   * useEffect - Cargar horarios
   */
  useEffect(() => {
    loadSchedules();
  }, []);

  /**
   * loadSchedules
   * =============
   * Carga todos los horarios del sistema
   */
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedules();
      setSchedules(data || []);
    } catch (error) {
      console.error("Error cargando horarios:", error);
      showToast("Error al cargar horarios", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleDelete
   * ============
   * Elimina un horario
   */
  const handleDelete = async (schedule) => {
    if (
      !window.confirm(
        `¿Eliminar el horario de ${schedule.course.name} el ${getDayLabel(
          schedule.day_week
        )}?`
      )
    ) {
      return;
    }

    try {
      await deleteSchedule(schedule.id);
      showToast("Horario eliminado exitosamente", "success");
      loadSchedules();
    } catch (error) {
      console.error("Error eliminando horario:", error);
      showToast("Error al eliminar horario", "error");
    }
  };

  /**
   * getDayLabel
   * ===========
   * Obtiene el label en español de un día
   */
  const getDayLabel = (dayValue) => {
    return DAYS.find((d) => d.value === dayValue)?.label || dayValue;
  };

  /**
   * getSchedulesByDay
   * =================
   * Agrupa horarios por día de la semana
   */
  const getSchedulesByDay = (day) => {
    return schedules
      .filter((s) => s.day_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando horarios...</p>
      </div>
    );
  }

  // ===== RENDER: CALENDARIO =====
  return (
    <div className="weekly-schedule-view">
      {/* Header con botón de agregar */}
      <div className="schedule-header">
        <h2>📅 Horarios Semanales</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingSchedule(null);
            setShowForm(true);
          }}
        >
          ➕ Agregar Horario
        </button>
      </div>

      {/* Vista de calendario */}
      {schedules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay horarios registrados</h3>
          <p>Comienza agregando horarios a los cursos</p>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingSchedule(null);
              setShowForm(true);
            }}
          >
            ➕ Agregar Primer Horario
          </button>
        </div>
      ) : (
        <div className="calendar-grid">
          {DAYS.map((day) => {
            const daySchedules = getSchedulesByDay(day.value);
            return (
              <div key={day.value} className="day-column">
                {/* Header del día */}
                <div className="day-header">
                  <h3>{day.label}</h3>
                  <span className="day-count">
                    {daySchedules.length} clase(s)
                  </span>
                </div>

                {/* Horarios del día */}
                <div className="day-schedules">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((schedule) => (
                      <div key={schedule.id} className="schedule-block">
                        <div className="schedule-time">
                          ⏰ {schedule.start_time} - {schedule.end_time}
                        </div>
                        <div className="schedule-course">
                          📚 {schedule.course.name}
                        </div>
                        <div className="schedule-teacher">
                          👨‍🏫 {schedule.course.teacher.name}{" "}
                          {schedule.course.teacher.last_name}
                        </div>
                        {schedule.classroom && (
                          <div className="schedule-classroom">
                            🚪 {schedule.classroom}
                          </div>
                        )}
                        <div className="schedule-actions">
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setShowForm(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDelete(schedule)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-schedules">
                      <p>Sin clases</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE FORMULARIO */}
      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          onSuccess={() => {
            setShowForm(false);
            setEditingSchedule(null);
            loadSchedules();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default WeeklyScheduleView;
