// ====================================
// DASHBOARD DE DOCENTE
// ====================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext"; // ✅ NUEVO
import { getTeacherDashboard } from "../api/dashboardApi";
import { getCourseById } from "../api/courseApi";
import { bulkAttendance } from "../api/attendanceApi";
import { bulkGrades } from "../api/gradeApi";
import AIAlertsPanel from "../components/AIAlertsPanel";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm(); // ✅ NUEVO

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceList, setAttendanceList] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [gradePeriod, setGradePeriod] = useState("Primer Parcial");
  const [gradesList, setGradesList] = useState([]);
  const [savingGrades, setSavingGrades] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseDetails();
    }
  }, [selectedCourse]);

  const loadData = async () => {
    try {
      setLoading(true);
      const teacherId = user.teacher?.id || user.id;
      const data = await getTeacherDashboard(teacherId);
      setDashboard(data);

      if (data.courses.length > 0) {
        setSelectedCourse(data.courses[0]);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      showError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async () => {
    try {
      const details = await getCourseById(selectedCourse.id);
      setCourseDetails(details);

      const initialAttendance = details.enrollments.map((enrollment) => ({
        student_id: enrollment.student.id,
        name: `${enrollment.student.name} ${enrollment.student.last_name}`,
        status: "PRESENT",
      }));
      setAttendanceList(initialAttendance);

      const initialGrades = details.enrollments.map((enrollment) => ({
        student_id: enrollment.student.id,
        name: `${enrollment.student.name} ${enrollment.student.last_name}`,
        grade: "",
        comment: "",
      }));
      setGradesList(initialGrades);
    } catch (error) {
      console.error("Error cargando detalles del curso:", error);
      showError("Error al cargar detalles del curso");
    }
  };

  // ✅ MODIFICADO: handleLogout con modal
  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "🚪 Cerrar Sesión",
      message: "¿Estás seguro de que deseas cerrar sesión?",
      type: "logout",
      confirmText: "Sí, cerrar sesión",
    });

    if (confirmed) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, status } : item
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);

      await bulkAttendance({
        course_id: selectedCourse.id,
        date: attendanceDate,
        attendanceList: attendanceList.map((item) => ({
          student_id: item.student_id,
          status: item.status,
        })),
      });

      showSuccess("Asistencia guardada correctamente");
      loadData();
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      showError(error.response?.data?.message || "Error al guardar asistencia");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGradesList((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveGrades = async () => {
    try {
      const invalidGrades = gradesList.filter(
        (item) => item.grade && (item.grade < 0 || item.grade > 100)
      );

      if (invalidGrades.length > 0) {
        showError("Las calificaciones deben estar entre 0 y 100");
        return;
      }

      const gradesToSave = gradesList.filter((item) => item.grade !== "");

      if (gradesToSave.length === 0) {
        showError("Debes ingresar al menos una calificación");
        return;
      }

      setSavingGrades(true);

      await bulkGrades({
        course_id: selectedCourse.id,
        period: gradePeriod,
        grades: gradesToSave.map((item) => ({
          student_id: item.student_id,
          grade: parseFloat(item.grade),
          comment: item.comment,
        })),
      });

      showSuccess("Calificaciones guardadas correctamente");

      setGradesList((prev) =>
        prev.map((item) => ({
          ...item,
          grade: "",
          comment: "",
        }))
      );

      loadData();
    } catch (error) {
      console.error("Error guardando calificaciones:", error);
      showError(
        error.response?.data?.message || "Error al guardar calificaciones"
      );
    } finally {
      setSavingGrades(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 50, height: 50 }}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!dashboard.courses || dashboard.courses.length === 0) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>👨‍🏫 Panel de Docente</h1>
            <p className="dashboard-subtitle">
              Bienvenido, {dashboard.teacher.name}
            </p>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </header>

        <div className="dashboard-content">
          <div className="card text-center">
            <h2>📚 No tienes cursos asignados</h2>
            <p className="text-muted">
              Contacta al administrador para que te asigne cursos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>👨‍🏫 Panel de Docente</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {dashboard.teacher.name}
            {dashboard.teacher.specialty && ` - ${dashboard.teacher.specialty}`}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="btn-secondary"
          >
            👤 Mi Perfil
          </button>
        </div>
      </header>
      <div className="dashboard-section">
        <AIAlertsPanel
          endpoint="/alerts/my-children"
          title="⚠️ Alertas de mis Hijos"
        />
      </div>
      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{dashboard.totals.courses}</h3>
            <p>Cursos</p>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{dashboard.totals.students}</h3>
            <p>Estudiantes</p>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{dashboard.totals.today_attendance}</h3>
            <p>Asistencia hoy</p>
          </div>
        </div>
      </div>

      <div className="course-selector">
        <label htmlFor="course-select">Seleccionar Curso:</label>
        <select
          id="course-select"
          value={selectedCourse?.id || ""}
          onChange={(e) => {
            const course = dashboard.courses.find(
              (c) => c.id === e.target.value
            );
            setSelectedCourse(course);
          }}
          className="course-select"
        >
          {dashboard.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} - {course.total_students} estudiantes
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Resumen
        </button>
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          ✅ Tomar Asistencia
        </button>
        <button
          className={`tab-btn ${activeTab === "grades" ? "active" : ""}`}
          onClick={() => setActiveTab("grades")}
        >
          📝 Calificaciones
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && selectedCourse && (
          <div className="overview-tab">
            <div className="card">
              <h2>📚 {selectedCourse.name}</h2>
              <div className="course-stats">
                <div className="course-stat-item">
                  <span className="stat-label">👥 Estudiantes inscritos:</span>
                  <span className="stat-value">
                    {selectedCourse.total_students}
                  </span>
                </div>
                <div className="course-stat-item">
                  <span className="stat-label">📊 Promedio del curso:</span>
                  <span className="stat-value">
                    {selectedCourse.average_grade}
                  </span>
                </div>
                <div className="course-stat-item">
                  <span className="stat-label">
                    ✅ Asistencia registrada hoy:
                  </span>
                  <span className="stat-value">
                    {selectedCourse.today_attendance}
                  </span>
                </div>
              </div>
            </div>

            {courseDetails && (
              <div className="card mt-4">
                <h3>👥 Lista de Estudiantes</h3>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseDetails.enrollments.map((enrollment, idx) => (
                        <tr key={enrollment.student.id}>
                          <td>{idx + 1}</td>
                          <td>
                            {enrollment.student.name}{" "}
                            {enrollment.student.last_name}
                          </td>
                          <td>{enrollment.student.user.email}</td>
                          <td>{enrollment.student.phone || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && courseDetails && (
          <div className="attendance-tab">
            <div className="card">
              <h2>✅ Tomar Asistencia</h2>

              <div className="form-group">
                <label htmlFor="attendance-date" className="form-label">
                  📅 Fecha:
                </label>
                <input
                  id="attendance-date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="form-input"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="attendance-list-form">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Estudiante</th>
                      <th className="text-center">✅ Presente</th>
                      <th className="text-center">❌ Ausente</th>
                      <th className="text-center">⏰ Tarde</th>
                      <th className="text-center">📝 Justificado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList.map((item, idx) => (
                      <tr key={item.student_id}>
                        <td>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`attendance-${item.student_id}`}
                            checked={item.status === "PRESENT"}
                            onChange={() =>
                              handleAttendanceChange(item.student_id, "PRESENT")
                            }
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`attendance-${item.student_id}`}
                            checked={item.status === "ABSENT"}
                            onChange={() =>
                              handleAttendanceChange(item.student_id, "ABSENT")
                            }
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`attendance-${item.student_id}`}
                            checked={item.status === "LATE"}
                            onChange={() =>
                              handleAttendanceChange(item.student_id, "LATE")
                            }
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`attendance-${item.student_id}`}
                            checked={item.status === "EXCUSED"}
                            onChange={() =>
                              handleAttendanceChange(item.student_id, "EXCUSED")
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn-primary btn-full mt-4"
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
              >
                {savingAttendance ? (
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  "💾 Guardar Asistencia"
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "grades" && courseDetails && (
          <div className="grades-tab">
            <div className="card">
              <h2>📝 Ingresar Calificaciones</h2>

              <div className="form-group">
                <label htmlFor="grade-period" className="form-label">
                  📋 Periodo:
                </label>
                <select
                  id="grade-period"
                  value={gradePeriod}
                  onChange={(e) => setGradePeriod(e.target.value)}
                  className="form-input"
                >
                  <option value="Primer Parcial">Primer Parcial</option>
                  <option value="Segundo Parcial">Segundo Parcial</option>
                  <option value="Tercer Parcial">Tercer Parcial</option>
                  <option value="Examen Final">Examen Final</option>
                </select>
              </div>

              <div className="grades-list-form">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Estudiante</th>
                      <th>Calificación (0-100)</th>
                      <th>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesList.map((item, idx) => (
                      <tr key={item.student_id}>
                        <td>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.grade}
                            onChange={(e) =>
                              handleGradeChange(
                                item.student_id,
                                "grade",
                                e.target.value
                              )
                            }
                            placeholder="0-100"
                            className="form-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.comment}
                            onChange={(e) =>
                              handleGradeChange(
                                item.student_id,
                                "comment",
                                e.target.value
                              )
                            }
                            placeholder="Comentario opcional"
                            className="form-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn-primary btn-full mt-4"
                onClick={handleSaveGrades}
                disabled={savingGrades}
              >
                {savingGrades ? (
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  "💾 Guardar Calificaciones"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
