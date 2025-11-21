// ====================================
// DASHBOARD DE ESTUDIANTE
// ====================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext"; // ✅ NUEVO
import { getStudentDashboard } from "../api/dashboardApi";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm(); // ✅ NUEVO

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentId = user.student?.id || user.id;
      const data = await getStudentDashboard(studentId);
      setDashboard(data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      showToast("Error al cargar los datos", "error");
    } finally {
      setLoading(false);
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

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 50, height: 50 }}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container student-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>👨‍🎓 Mi Panel Estudiantil</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {dashboard.student.name} {dashboard.student.last_name}
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

      <div className="student-quick-stats">
        <div className="student-stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{dashboard.courses?.length || 0}</h3>
            <p>Cursos Inscritos</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{dashboard.average || "0.00"}</h3>
            <p>Promedio General</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{dashboard.attendance_rate || "0"}%</h3>
            <p>Asistencia</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Resumen
        </button>
        <button
          className={`tab-btn ${activeTab === "credentials" ? "active" : ""}`}
          onClick={() => setActiveTab("credentials")}
        >
          🎫 Mis Credenciales
        </button>
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          📚 Mis Cursos
        </button>
        <button
          className={`tab-btn ${activeTab === "grades" ? "active" : ""}`}
          onClick={() => setActiveTab("grades")}
        >
          📝 Calificaciones
        </button>
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          ✅ Asistencia
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="card">
              <h2>🎫 Credenciales de Asistencia</h2>
              <div className="credentials-quick">
                <div className="credential-item">
                  <span className="credential-label">PIN:</span>
                  <span className="credential-value">
                    {dashboard.student.pin_code}
                  </span>
                </div>
                <button className="btn-primary" onClick={toggleQR}>
                  {showQR ? "Ocultar QR" : "Ver Código QR"}
                </button>
              </div>
              {showQR && (
                <div className="qr-display">
                  <div className="qr-placeholder">
                    <p>📱</p>
                    <p className="qr-code-text">{dashboard.student.qr_code}</p>
                    <p className="text-muted">
                      Escanea este código para registrar asistencia
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="card mt-4">
              <h2>📚 Mis Cursos ({dashboard.courses?.length || 0})</h2>
              {dashboard.courses && dashboard.courses.length > 0 ? (
                <div className="courses-list">
                  {dashboard.courses.map((enrollment) => (
                    <div key={enrollment.id} className="course-item">
                      <div className="course-icon">📖</div>
                      <div className="course-details">
                        <h4>{enrollment.course.name}</h4>
                        <p className="text-muted">
                          Docente: {enrollment.course.teacher.name}{" "}
                          {enrollment.course.teacher.last_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No estás inscrito en ningún curso</p>
              )}
            </div>

            <div className="card mt-4">
              <h2>📝 Últimas Calificaciones</h2>
              {dashboard.latest_grades && dashboard.latest_grades.length > 0 ? (
                <div className="grades-list">
                  {dashboard.latest_grades.map((grade) => (
                    <div key={grade.id} className="grade-item">
                      <div className="grade-course">{grade.course.name}</div>
                      <div className="grade-period">{grade.period}</div>
                      <div
                        className={`grade-value ${
                          grade.grade >= 60 ? "passing" : "failing"
                        }`}
                      >
                        {grade.grade}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  No hay calificaciones registradas aún
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "credentials" && (
          <div className="credentials-tab">
            <div className="card">
              <h2>🎫 Mis Credenciales de Asistencia</h2>

              <div className="credential-section">
                <h3>📌 PIN de Asistencia</h3>
                <div className="pin-display">
                  <span className="pin-code">{dashboard.student.pin_code}</span>
                </div>
                <p className="text-muted text-center">
                  Usa este PIN de 6 dígitos para registrar tu asistencia
                </p>
              </div>

              <div className="credential-section mt-4">
                <h3>📱 Código QR</h3>
                <div className="qr-full-display">
                  <div className="qr-placeholder-large">
                    <p style={{ fontSize: "4rem" }}>📱</p>
                    <p className="qr-code-text-large">
                      {dashboard.student.qr_code}
                    </p>
                  </div>
                </div>
                <p className="text-muted text-center">
                  Presenta este código QR al docente para registrar tu
                  asistencia
                </p>
              </div>

              <div className="alert alert-info mt-4">
                <h4>💡 ¿Cómo usar mis credenciales?</h4>
                <ul>
                  <li>
                    Puedes usar tu PIN ingresándolo en el sistema de asistencia
                  </li>
                  <li>O muestra tu código QR para escanearlo</li>
                  <li>Ambos métodos registran tu asistencia automáticamente</li>
                  <li>No compartas tus credenciales con otros estudiantes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="courses-tab">
            <div className="card">
              <h2>📚 Mis Cursos Inscritos</h2>
              {dashboard.courses && dashboard.courses.length > 0 ? (
                dashboard.courses.map((enrollment) => (
                  <div key={enrollment.id} className="course-detail-card">
                    <div className="course-header">
                      <h3>{enrollment.course.name}</h3>
                      <span className="course-level">
                        Nivel {enrollment.course.grade_level}
                      </span>
                    </div>
                    <div className="course-info">
                      <div className="info-row">
                        <span className="info-label">👨‍🏫 Docente:</span>
                        <span>
                          {enrollment.course.teacher.name}{" "}
                          {enrollment.course.teacher.last_name}
                        </span>
                      </div>
                      {enrollment.course.schedules &&
                        enrollment.course.schedules.length > 0 && (
                          <div className="info-row">
                            <span className="info-label">📅 Horario:</span>
                            <div className="schedules-list">
                              {enrollment.course.schedules.map(
                                (schedule, idx) => (
                                  <span key={idx} className="schedule-badge">
                                    {schedule.day_week}: {schedule.start_time} -{" "}
                                    {schedule.end_time}
                                    {schedule.classroom &&
                                      ` (${schedule.classroom})`}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">
                  No estás inscrito en ningún curso
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="grades-tab">
            <div className="card">
              <h2>📝 Mis Calificaciones</h2>
              <div className="grade-summary">
                <div className="average-card">
                  <h3>Promedio General</h3>
                  <div className="average-value">
                    {dashboard.average || "0.00"}
                  </div>
                </div>
              </div>

              {dashboard.latest_grades && dashboard.latest_grades.length > 0 ? (
                <div className="grades-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Periodo</th>
                        <th>Calificación</th>
                        <th>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.latest_grades.map((grade) => (
                        <tr key={grade.id}>
                          <td>{grade.course.name}</td>
                          <td>{grade.period}</td>
                          <td>
                            <span
                              className={`grade-badge ${
                                grade.grade >= 60 ? "passing" : "failing"
                              }`}
                            >
                              {grade.grade}
                            </span>
                          </td>
                          <td className="text-muted">
                            {grade.comment || "Sin comentario"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mt-4">
                  No hay calificaciones registradas aún
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-tab">
            <div className="card">
              <h2>✅ Mi Asistencia</h2>
              <div className="attendance-summary">
                <div className="attendance-stat">
                  <span className="attendance-percentage">
                    {dashboard.attendance_rate || "0"}%
                  </span>
                  <p className="text-muted">Tasa de Asistencia</p>
                </div>
              </div>

              <h3 className="mt-4">Últimos Registros</h3>
              {dashboard.latest_attendance &&
              dashboard.latest_attendance.length > 0 ? (
                <div className="attendance-list">
                  {dashboard.latest_attendance.map((record) => (
                    <div key={record.id} className="attendance-record">
                      <div className="record-date">
                        📅 {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="record-course">{record.course.name}</div>
                      <div
                        className={`record-status status-${record.status.toLowerCase()}`}
                      >
                        {record.status === "PRESENT" && "✅ Presente"}
                        {record.status === "ABSENT" && "❌ Ausente"}
                        {record.status === "LATE" && "⏰ Tarde"}
                        {record.status === "EXCUSED" && "📝 Justificado"}
                      </div>
                      <div className="record-method">
                        Método: {record.method}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay registros de asistencia aún
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
