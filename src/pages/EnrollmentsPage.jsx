// ====================================
// PÁGINA DE GESTIÓN DE INSCRIPCIONES
// ====================================
// Página completa para administrar inscripciones de estudiantes en cursos

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getEnrollments,
  getEnrollmentsByCourse,
  deleteEnrollment,
} from "../api/enrollmentApi";
import { getCourses } from "../api/courseApi";
import EnrollmentForm from "../components/EnrollmentForm";
import BulkEnrollmentModal from "../components/BulkEnrollmentModal";
import SearchBar from "../components/SearchBar";
import "./EnrollmentsPage.css";
import { useConfirm } from "../context/ConfirmContext";
/**
 * EnrollmentsPage
 * ===============
 * Página principal para gestionar inscripciones
 * - Ver todas las inscripciones
 * - Filtrar por curso
 * - Inscribir estudiantes (individual o masivo)
 * - Desinscribir estudiantes
 */
const EnrollmentsPage = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // ===== ESTADOS =====
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCourse, setBulkCourse] = useState(null);

  /**
   * useEffect - Cargar datos iniciales
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * useEffect - Recargar cuando cambia el curso seleccionado
   */
  useEffect(() => {
    if (!loading) {
      loadEnrollments();
    }
  }, [selectedCourse]);

  /**
   * loadData
   * ========
   * Carga todos los cursos y las inscripciones
   */
  const loadData = async () => {
    try {
      setLoading(true);

      const [coursesData, enrollmentsData] = await Promise.all([
        getCourses({ limit: 1000 }),
        getEnrollments(),
      ]);

      setCourses(coursesData.courses || []);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * loadEnrollments
   * ===============
   * Recarga solo las inscripciones según filtro
   */
  const loadEnrollments = async () => {
    try {
      let data;

      if (selectedCourse === "all") {
        data = await getEnrollments();
      } else {
        data = await getEnrollmentsByCourse(selectedCourse);
      }

      setEnrollments(data || []);
    } catch (error) {
      console.error("Error cargando inscripciones:", error);
      showToast("Error al cargar inscripciones", "error");
    }
  };

  /**
   * handleDelete
   * ============
   * Elimina una inscripción (desinscribe estudiante)
   */
  const handleDelete = async (enrollment) => {
    const confirmed = await confirm({
      title: "🗑️ Desinscribir Estudiante",
      message: `¿Desinscribir a ${enrollment.student.name} ${enrollment.student.last_name} de ${enrollment.course.name}?`,
      type: "danger",
      confirmText: "Sí, desinscribir",
    });

    if (!confirmed) return;

    try {
      await deleteEnrollment(enrollment.id);
      showToast("Estudiante desinscrito exitosamente", "success");
      loadEnrollments();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Error al desinscribir",
        "error"
      );
    }
  };

  /**
   * handleBulkEnroll
   * ================
   * Abre modal de inscripción masiva para un curso
   */
  const handleBulkEnroll = (course) => {
    setBulkCourse(course);
    setShowBulkModal(true);
  };

  /**
   * handleLogout
   */
  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  /**
   * Filtrar inscripciones por búsqueda
   */
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const studentName =
      `${enrollment.student.name} ${enrollment.student.last_name}`.toLowerCase();
    const studentEmail = enrollment.student.user.email.toLowerCase();
    const courseName = enrollment.course.name.toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      studentName.includes(search) ||
      studentEmail.includes(search) ||
      courseName.includes(search)
    );
  });

  /**
   * Agrupar inscripciones por curso
   */
  const enrollmentsByCourse = filteredEnrollments.reduce((acc, enrollment) => {
    const courseId = enrollment.course.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: enrollment.course,
        enrollments: [],
      };
    }
    acc[courseId].enrollments.push(enrollment);
    return acc;
  }, {});

  // ===== RENDER: LOADING =====
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 50, height: 50 }}></div>
        <p>Cargando inscripciones...</p>
      </div>
    );
  }

  // ===== RENDER: PÁGINA =====
  return (
    <div className="enrollments-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>📝 Gestión de Inscripciones</h1>
          <p className="page-subtitle">
            Administra las inscripciones de estudiantes en cursos
          </p>
        </div>
        <div className="header-actions">
          {" "}
          {/* ⬆️ AGREGAR DIV */}
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = "/admin")}
          >
            ← Volver al Dashboard
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>{" "}
        {/* ⬆️ CERRAR DIV */}
      </header>

      {/* Estadísticas rápidas */}
      <div className="enrollments-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Cursos Disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{enrollments.length}</h3>
            <p>Inscripciones Totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>
              {enrollments.length > 0
                ? (enrollments.length / courses.length).toFixed(1)
                : 0}
            </h3>
            <p>Promedio por Curso</p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="enrollments-controls">
        {/* Filtro por curso */}
        <div className="filter-group">
          <label htmlFor="course-filter">📚 Filtrar por curso:</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="course-filter"
          >
            <option value="all">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.enrollments?.length || 0} inscritos)
              </option>
            ))}
          </select>
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={() => setShowEnrollmentForm(true)}
          >
            ➕ Inscribir Estudiante
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <SearchBar
        placeholder="Buscar por estudiante, curso o email..."
        onSearch={setSearchTerm}
      />

      {/* Contenido principal */}
      <div className="enrollments-content">
        {filteredEnrollments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay inscripciones</h3>
            <p>
              {searchTerm
                ? "No se encontraron inscripciones con ese criterio de búsqueda"
                : selectedCourse !== "all"
                ? "Este curso no tiene estudiantes inscritos"
                : "Aún no hay estudiantes inscritos en ningún curso"}
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowEnrollmentForm(true)}
            >
              ➕ Inscribir Primer Estudiante
            </button>
          </div>
        ) : (
          <div className="enrollments-by-course">
            {Object.values(enrollmentsByCourse).map(
              ({ course, enrollments }) => (
                <div key={course.id} className="course-enrollment-card">
                  {/* Header del curso */}
                  <div className="course-enrollment-header">
                    <div className="course-enrollment-info">
                      <h3>📚 {course.name}</h3>
                      <p>
                        👨‍🏫 {course.teacher.name} {course.teacher.last_name} •{" "}
                        Nivel {course.grade_level} • {enrollments.length}{" "}
                        estudiante(s)
                      </p>
                    </div>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => handleBulkEnroll(course)}
                    >
                      👥 Inscripción Masiva
                    </button>
                  </div>

                  {/* Lista de estudiantes inscritos */}
                  <div className="enrolled-students-list">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="enrolled-student-item"
                      >
                        <div className="student-avatar">
                          {enrollment.student.name.charAt(0)}
                          {enrollment.student.last_name.charAt(0)}
                        </div>
                        <div className="student-enrollment-info">
                          <h4>
                            {enrollment.student.name}{" "}
                            {enrollment.student.last_name}
                          </h4>
                          <p>{enrollment.student.user.email}</p>
                          <span className="enrollment-date">
                            Inscrito:{" "}
                            {new Date(
                              enrollment.enrollment_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => handleDelete(enrollment)}
                          title="Desinscribir estudiante"
                        >
                          🗑️ Desinscribir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* MODALES */}
      {showEnrollmentForm && (
        <EnrollmentForm
          onSuccess={() => {
            setShowEnrollmentForm(false);
            loadEnrollments();
          }}
          onCancel={() => setShowEnrollmentForm(false)}
        />
      )}

      {showBulkModal && bulkCourse && (
        <BulkEnrollmentModal
          course={bulkCourse}
          onSuccess={() => {
            setShowBulkModal(false);
            setBulkCourse(null);
            loadEnrollments();
          }}
          onClose={() => {
            setShowBulkModal(false);
            setBulkCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default EnrollmentsPage;
