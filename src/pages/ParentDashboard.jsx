// ====================================
// DASHBOARD DE PADRE
// ====================================
// Panel para padres con vista de sus hijos

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getStudentDashboard } from "../api/dashboardApi";
import { useConfirm } from "../context/ConfirmContext";
import AIAlertsPanel from "../components/AIAlertsPanel";
import {
  getParentById,
  getChildrenSummary,
  getParentChildDetails,
} from "../api/parentApi";
import "./ParentDashboard.css";
import StudentAnalysisModal from "../components/StudentAnalysisModal";

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] =
    useState(null);
  // ===== ESTADOS =====
  const [parent, setParent] = useState(null);
  const [childrenSummary, setChildrenSummary] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  // ===== CARGAR DATOS =====
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildDetails();
    }
  }, [selectedChild]);

  /**
   * loadData
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const parentId = user.profile.id;
      const [parentData, summaryData] = await Promise.all([
        getParentById(parentId),
        getChildrenSummary(parentId),
      ]);

      setParent(parentData);
      setChildrenSummary(summaryData.children || []);

      // Seleccionar primer hijo por defecto
      if (summaryData.children && summaryData.children.length > 0) {
        setSelectedChild(summaryData.children[0]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("Error al cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * loadChildDetails
   */
  const loadChildDetails = async () => {
    try {
      const details = await getParentChildDetails(selectedChild.student_id);
      setChildDetails(details);
    } catch (error) {
      console.error("Error cargando detalles del hijo:", error);
    }
  };

  /**
   * handleLogout
   */
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

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 50, height: 50 }}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // ===== RENDER: SIN HIJOS =====
  if (!parent || !parent.students || parent.students.length === 0) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>👪 Panel de Padre/Tutor</h1>
            <p className="dashboard-subtitle">
              Bienvenido, {parent?.name || user.profile?.name || user.email}
            </p>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </header>
        <div className="dashboard-content">
          <div className="card text-center">
            <h2>👨‍👩‍👧‍👦 No tienes hijos registrados</h2>
            <p className="text-muted">
              Contacta al administrador para vincular estudiantes a tu cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: DASHBOARD =====
  return (
    <div className="dashboard-container parent-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>👪 Panel de Padre/Tutor</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {parent.name} {parent.last_name}
          </p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
        <button onClick={() => navigate("/profile")} className="btn-secondary">
          👤 Mi Perfil
        </button>
      </header>
      <AIAlertsPanel
        endpoint="/alerts/my-children"
        title="⚠️ Alertas de mis Hijos"
        onAnalyze={(alert) => setSelectedStudentForAnalysis(alert)}
      />
      {/* Resumen de hijos */}
      <div className="children-summary">
        <h2>👨‍👩‍👧‍👦 Mis Hijos</h2>
        <div className="children-cards">
          {childrenSummary.map((child) => (
            <div
              key={child.student_id}
              className={`child-card ${
                selectedChild?.student_id === child.student_id ? "active" : ""
              }`}
              onClick={() =>
                setSelectedChild(
                  childrenSummary.find((c) => c.student_id === child.student_id)
                )
              }
            >
              <div className="child-card-header">
                <h3>{child.name}</h3>
                {selectedChild?.student_id === child.student_id && (
                  <span className="active-badge">Seleccionado</span>
                )}
              </div>
              <div className="child-card-stats">
                <div className="child-stat">
                  <span className="stat-label">📚 Cursos:</span>
                  <span className="stat-value">{child.total_courses || 0}</span>
                </div>
                <div className="child-stat">
                  <span className="stat-label">📊 Promedio:</span>
                  <span
                    className={`stat-value ${
                      child.average_grade >= 60 ? "passing" : "failing"
                    }`}
                  >
                    {child.average_grade || "N/A"}
                  </span>
                </div>
                <div className="child-stat">
                  <span className="stat-label">✅ Asistencia:</span>
                  <span className="stat-value">
                    {child.attendance_rate || "0"}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalles del hijo seleccionado */}
      {childDetails && (
        <>
          {/* Stats rápidas */}
          <div className="child-quick-stats">
            <div className="student-stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{childDetails.courses?.length || 0}</h3>
                <p>Cursos Inscritos</p>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{childDetails.average || "0.00"}</h3>
                <p>Promedio General</p>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{childDetails.attendance_rate || "0"}%</h3>
                <p>Asistencia</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              📚 Cursos
            </button>
            <button
              className={`tab-btn ${activeTab === "grades" ? "active" : ""}`}
              onClick={() => setActiveTab("grades")}
            >
              📝 Calificaciones
            </button>
            <button
              className={`tab-btn ${
                activeTab === "attendance" ? "active" : ""
              }`}
              onClick={() => setActiveTab("attendance")}
            >
              ✅ Asistencia
            </button>
          </div>

          {/* Contenido */}
          <div className="child-details">
            {/* TAB: CURSOS */}
            {activeTab === "courses" && (
              <div className="card">
                <h2>
                  📚 Cursos de {childDetails.student.name}{" "}
                  {childDetails.student.last_name}
                </h2>
                {childDetails.courses && childDetails.courses.length > 0 ? (
                  childDetails.courses.map((enrollment) => (
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
                                      {schedule.day_week}: {schedule.start_time}{" "}
                                      - {schedule.end_time}
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
                    No está inscrito en ningún curso
                  </p>
                )}
              </div>
            )}

            {/* TAB: CALIFICACIONES */}
            {activeTab === "grades" && (
              <div className="card">
                <h2>📝 Calificaciones</h2>
                <div className="grade-summary">
                  <div className="average-card">
                    <h3>Promedio General</h3>
                    <div className="average-value">
                      {childDetails.average || "0.00"}
                    </div>
                  </div>
                </div>

                {childDetails.latest_grades &&
                childDetails.latest_grades.length > 0 ? (
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
                        {childDetails.latest_grades.map((grade) => (
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
                  <p className="text-center text-muted mt-4">
                    No hay calificaciones registradas
                  </p>
                )}
              </div>
            )}

            {/* TAB: ASISTENCIA */}
            {activeTab === "attendance" && (
              <div className="card">
                <h2>✅ Asistencia</h2>
                <div className="attendance-summary">
                  <div className="attendance-stat">
                    <span className="attendance-percentage">
                      {childDetails.attendance_rate || "0"}%
                    </span>
                    <p className="text-muted">Tasa de Asistencia</p>
                  </div>
                </div>

                <h3 className="mt-4">Últimos Registros</h3>
                {childDetails.latest_attendance &&
                childDetails.latest_attendance.length > 0 ? (
                  <div className="attendance-list">
                    {childDetails.latest_attendance.map((record) => (
                      <div key={record.id} className="attendance-record">
                        <div className="record-date">
                          📅 {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="record-course">
                          {record.course.name}
                        </div>
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
                  <p className="text-center text-muted">
                    No hay registros de asistencia
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {/* Modal de Análisis IA */}
      {selectedStudentForAnalysis && (
        <StudentAnalysisModal
          studentId={selectedStudentForAnalysis.student_id}
          studentName={selectedStudentForAnalysis.name}
          onClose={() => setSelectedStudentForAnalysis(null)}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
