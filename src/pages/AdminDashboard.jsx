// ====================================
// DASHBOARD DE ADMINISTRADOR - COMPLETO
// ====================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { getAdminDashboard } from "../api/dashboardApi";
import { getStudents } from "../api/studentApi";
import { getCourses } from "../api/courseApi";
import { getParents } from "../api/parentApi";
import "./AdminDashboard.css";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import StudentForm from "../components/StudentForm";
import TeacherForm from "../components/TeacherForm";
import CourseForm from "../components/CourseForm";
import ParentForm from "../components/ParentForm";
import AssignStudentModal from "../components/AssignStudentModal";
import WeeklyScheduleView from "../components/WeeklyScheduleView";
import AIAlertsPanel from "../components/AIAlertsPanel";
import StudentAnalysisModal from "../components/StudentAnalysisModal";
import ServerStatusCard from "../components/ServerStatusCard";

const AdminDashboard = () => {
  // ===== HOOKS =====
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // ===== ESTADOS =====
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // ✅ Estados para modal de análisis IA
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] =
    useState(null);

  // Paginación estudiantes
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsPagination, setStudentsPagination] = useState(null);
  const [studentsSearch, setStudentsSearch] = useState("");

  // Paginación cursos
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesPagination, setCoursesPagination] = useState(null);
  const [coursesSearch, setCoursesSearch] = useState("");

  // Paginación profesores
  const [teachersPage, setTeachersPage] = useState(1);
  const [teachersPagination, setTeachersPagination] = useState(null);
  const [teachersSearch, setTeachersSearch] = useState("");

  // Paginación padres
  const [parentsPage, setParentsPage] = useState(1);
  const [parentsPagination, setParentsPagination] = useState(null);
  const [parentsSearch, setParentsSearch] = useState("");

  // Modales
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showParentForm, setShowParentForm] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningParent, setAssigningParent] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading && (studentsPage !== 1 || studentsSearch !== "")) {
      loadStudents();
    }
  }, [studentsPage, studentsSearch]);

  useEffect(() => {
    if (!loading && (coursesPage !== 1 || coursesSearch !== "")) {
      loadCourses();
    }
  }, [coursesPage, coursesSearch]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [
        dashboardData,
        studentsData,
        coursesData,
        teachersData,
        parentsData,
      ] = await Promise.all([
        getAdminDashboard(),
        getStudents({ page: 1, limit: 10, search: "" }),
        getCourses({ page: 1, limit: 12, search: "" }),
        fetch("http://localhost:3000/api/teachers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((res) => res.json()),
        getParents(),
      ]);

      setDashboard(dashboardData);
      setStudents(studentsData.students);
      setStudentsPagination(studentsData.pagination);
      setCourses(coursesData.courses);
      setCoursesPagination(coursesData.pagination);
      setTeachers(teachersData);
      setParents(parentsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("Error al cargar los datos del dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const studentsData = await getStudents({
        page: studentsPage,
        limit: 10,
        search: studentsSearch,
      });
      setStudents(studentsData.students);
      setStudentsPagination(studentsData.pagination);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
      showToast("Error al cargar estudiantes", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const coursesData = await getCourses({
        page: coursesPage,
        limit: 12,
        search: coursesSearch,
      });
      setCourses(coursesData.courses);
      setCoursesPagination(coursesData.pagination);
    } catch (error) {
      console.error("Error cargando cursos:", error);
      showToast("Error al cargar cursos", "error");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleStudentsSearch = (term) => {
    setStudentsSearch(term);
    setStudentsPage(1);
  };

  const handleCoursesSearch = (term) => {
    setCoursesSearch(term);
    setCoursesPage(1);
  };

  const handleTeachersSearch = (term) => {
    setTeachersSearch(term);
    setTeachersPage(1);
  };

  const handleParentsSearch = (term) => {
    setParentsSearch(term);
    setParentsPage(1);
  };

  // ✅ NUEVO: Handler para analizar estudiante con IA
  const handleAnalyzeStudent = (student) => {
    setSelectedStudentForAnalysis({
      id: student.student_id || student.id,
      name: student.name,
    });
    setShowAnalysisModal(true);
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = await confirm({
      title: "🗑️ Eliminar Estudiante",
      message: `¿Eliminar a ${student.name} ${student.last_name}? Esta acción no se puede deshacer.`,
      type: "danger",
      confirmText: "Sí, eliminar",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/students/${student.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      showToast("Estudiante eliminado exitosamente", "success");
      loadStudents();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const confirmed = await confirm({
      title: "🗑️ Eliminar Profesor",
      message: `¿Eliminar a ${teacher.name} ${teacher.last_name}?`,
      type: "danger",
      confirmText: "Sí, eliminar",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/teachers/${teacher.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      showToast("Profesor eliminado exitosamente", "success");
      loadInitialData();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = await confirm({
      title: "🗑️ Eliminar Curso",
      message: `¿Eliminar ${course.name}?`,
      type: "danger",
      confirmText: "Sí, eliminar",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${course.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      showToast("Curso eliminado exitosamente", "success");
      loadCourses();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteParent = async (parent) => {
    const confirmed = await confirm({
      title: "🗑️ Eliminar Padre",
      message: `¿Eliminar a ${parent.name} ${parent.last_name}?`,
      type: "danger",
      confirmText: "Sí, eliminar",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/parents/${parent.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      showToast("Padre eliminado exitosamente", "success");
      loadInitialData();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleAssignChildren = (parent) => {
    setAssigningParent(parent);
    setShowAssignModal(true);
  };

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

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(parentsSearch.toLowerCase()) ||
      parent.last_name.toLowerCase().includes(parentsSearch.toLowerCase()) ||
      parent.user.email.toLowerCase().includes(parentsSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 50, height: 50 }}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>🎓 Panel de Administración</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {user.admin?.name || user.email}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = "/enrollments")}
          >
            📝 Gestionar Inscripciones
          </button>
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

      {/* ✅ Panel de Alertas IA con callback para analizar */}
      <AIAlertsPanel onAnalyze={handleAnalyzeStudent} />

      {/* Estado del Servidor */}
      <ServerStatusCard />

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Resumen General
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          👨‍🎓 Estudiantes ({students.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          👨‍🏫 Profesores ({teachers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          📚 Cursos ({courses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "parents" ? "active" : ""}`}
          onClick={() => setActiveTab("parents")}
        >
          👪 Padres ({parents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "schedules" ? "active" : ""}`}
          onClick={() => setActiveTab("schedules")}
        >
          📅 Horarios
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <div className="stat-info">
                  <h3>{dashboard.totals.students}</h3>
                  <p>Estudiantes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-info">
                  <h3>{dashboard.totals.teachers}</h3>
                  <p>Docentes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <h3>{dashboard.totals.courses}</h3>
                  <p>Cursos</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👪</div>
                <div className="stat-info">
                  <h3>{dashboard.totals.parents}</h3>
                  <p>Padres</p>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <h2>✅ Asistencia de Hoy</h2>
              <div className="attendance-stats">
                <div className="attendance-item">
                  <span className="attendance-label">Total registros:</span>
                  <span className="attendance-value">
                    {dashboard.today_attendance.total}
                  </span>
                </div>
                <div className="attendance-item">
                  <span className="attendance-label">Presentes:</span>
                  <span className="attendance-value success">
                    {dashboard.today_attendance.present}
                  </span>
                </div>
                <div className="attendance-item">
                  <span className="attendance-label">Tasa de asistencia:</span>
                  <span className="attendance-value">
                    {dashboard.today_attendance.rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <h2>📊 Promedio General del Sistema</h2>
              <div className="average-display">
                <div className="average-circle">
                  <span className="average-number">
                    {dashboard.general_average}
                  </span>
                </div>
                <p className="text-muted">
                  Promedio de todas las calificaciones
                </p>
              </div>
            </div>

            <div className="card mt-4">
              <h2>🔥 Cursos Más Populares</h2>
              <div className="popular-courses">
                {dashboard.popular_courses.map((item, index) => (
                  <div key={item.course.id} className="popular-course-item">
                    <div className="course-rank">#{index + 1}</div>
                    <div className="course-info">
                      <h4>{item.course.name}</h4>
                      <p>
                        Docente: {item.course.teacher.name}{" "}
                        {item.course.teacher.last_name}
                      </p>
                    </div>
                    <div className="course-students">
                      <span className="badge">
                        {item.total_students} estudiantes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="students-tab">
            <div className="card">
              <div className="card-header">
                <h2>👨‍🎓 Lista de Estudiantes</h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingStudent(null);
                    setShowStudentForm(true);
                  }}
                >
                  ➕ Agregar Estudiante
                </button>
              </div>

              <SearchBar
                placeholder="Buscar estudiante por nombre o email..."
                onSearch={handleStudentsSearch}
              />

              {loadingStudents ? (
                <div className="table-loading">
                  <div className="spinner"></div>
                  <p>Buscando estudiantes...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Padre/Tutor</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td>
                              {student.name} {student.last_name}
                            </td>
                            <td>{student.user.email}</td>
                            <td>
                              {student.parent
                                ? `${student.parent.name} ${student.parent.last_name}`
                                : "Sin tutor"}
                            </td>
                            <td>{student.phone || "N/A"}</td>
                            <td>
                              <div className="action-buttons">
                                {/* ✅ NUEVO: Botón de análisis IA */}
                                <button
                                  className="btn-sm btn-info"
                                  onClick={() => handleAnalyzeStudent(student)}
                                  title="Analizar con IA"
                                >
                                  🤖 Analizar
                                </button>
                                <button
                                  className="btn-sm btn-primary"
                                  onClick={() => {
                                    setEditingStudent(student);
                                    setShowStudentForm(true);
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  className="btn-sm btn-danger"
                                  onClick={() => handleDeleteStudent(student)}
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No se encontraron estudiantes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {studentsPagination && (
                <Pagination
                  currentPage={studentsPagination.page}
                  totalPages={studentsPagination.totalPages}
                  hasNextPage={studentsPagination.hasNextPage}
                  hasPrevPage={studentsPagination.hasPrevPage}
                  onPageChange={setStudentsPage}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "teachers" && (
          <div className="teachers-tab">
            <div className="card">
              <div className="card-header">
                <h2>👨‍🏫 Lista de Profesores</h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingTeacher(null);
                    setShowTeacherForm(true);
                  }}
                >
                  ➕ Agregar Profesor
                </button>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Especialidad</th>
                      <th>Cursos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <tr key={teacher.id}>
                          <td>
                            {teacher.name} {teacher.last_name}
                          </td>
                          <td>{teacher.user.email}</td>
                          <td>{teacher.specialty || "N/A"}</td>
                          <td>{teacher.courses?.length || 0} cursos</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-sm btn-primary"
                                onClick={() => {
                                  setEditingTeacher(teacher);
                                  setShowTeacherForm(true);
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="btn-sm btn-danger"
                                onClick={() => handleDeleteTeacher(teacher)}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No se encontraron profesores
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="courses-tab">
            <div className="card">
              <div className="card-header">
                <h2>📚 Lista de Cursos</h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingCourse(null);
                    setShowCourseForm(true);
                  }}
                >
                  ➕ Agregar Curso
                </button>
              </div>

              <SearchBar
                placeholder="Buscar curso por nombre..."
                onSearch={handleCoursesSearch}
              />

              {loadingCourses ? (
                <div className="table-loading">
                  <div className="spinner"></div>
                  <p>Buscando cursos...</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div key={course.id} className="course-card">
                        <div className="course-card-header">
                          <h3>{course.name}</h3>
                          <span className="course-level">
                            Nivel {course.grade_level}
                          </span>
                        </div>
                        <div className="course-card-body">
                          <p className="course-description">
                            {course.description || "Sin descripción"}
                          </p>
                          <div className="course-info-item">
                            <span className="info-label">👨‍🏫 Docente:</span>
                            <span>
                              {course.teacher.name} {course.teacher.last_name}
                            </span>
                          </div>
                          <div className="course-info-item">
                            <span className="info-label">👥 Estudiantes:</span>
                            <span>{course.enrollments?.length || 0}</span>
                          </div>
                        </div>
                        <div className="course-card-footer">
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => {
                              setEditingCourse(course);
                              setShowCourseForm(true);
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteCourse(course)}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">
                      No se encontraron cursos
                    </p>
                  )}
                </div>
              )}

              {coursesPagination && (
                <Pagination
                  currentPage={coursesPagination.page}
                  totalPages={coursesPagination.totalPages}
                  hasNextPage={coursesPagination.hasNextPage}
                  hasPrevPage={coursesPagination.hasPrevPage}
                  onPageChange={setCoursesPage}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "parents" && (
          <div className="parents-tab">
            <div className="card">
              <div className="card-header">
                <h2>👪 Lista de Padres/Tutores</h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingParent(null);
                    setShowParentForm(true);
                  }}
                >
                  ➕ Agregar Padre
                </button>
              </div>

              <SearchBar
                placeholder="Buscar padre por nombre o email..."
                onSearch={handleParentsSearch}
              />

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Hijos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.length > 0 ? (
                      filteredParents.map((parent) => (
                        <tr key={parent.id}>
                          <td>
                            {parent.name} {parent.last_name}
                          </td>
                          <td>{parent.user.email}</td>
                          <td>{parent.phone || "N/A"}</td>
                          <td>
                            <span className="badge-info">
                              {parent.students?.length || 0} hijo(s)
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-sm btn-info"
                                onClick={() => handleAssignChildren(parent)}
                                title="Asignar/Desasignar hijos"
                              >
                                👨‍👩‍👧 Asignar Hijos
                              </button>
                              <button
                                className="btn-sm btn-primary"
                                onClick={() => {
                                  setEditingParent(parent);
                                  setShowParentForm(true);
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="btn-sm btn-danger"
                                onClick={() => handleDeleteParent(parent)}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No se encontraron padres
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedules" && (
          <div className="schedules-tab">
            <WeeklyScheduleView />
          </div>
        )}
      </div>

      {/* ===== MODALES ===== */}

      {showStudentForm && (
        <StudentForm
          student={editingStudent}
          onSuccess={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
            loadStudents();
          }}
          onCancel={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {showTeacherForm && (
        <TeacherForm
          teacher={editingTeacher}
          onSuccess={() => {
            setShowTeacherForm(false);
            setEditingTeacher(null);
            loadInitialData();
          }}
          onCancel={() => {
            setShowTeacherForm(false);
            setEditingTeacher(null);
          }}
        />
      )}

      {showCourseForm && (
        <CourseForm
          course={editingCourse}
          onSuccess={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
            loadCourses();
          }}
          onCancel={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
        />
      )}

      {showParentForm && (
        <ParentForm
          parent={editingParent}
          onSuccess={() => {
            setShowParentForm(false);
            setEditingParent(null);
            loadInitialData();
          }}
          onCancel={() => {
            setShowParentForm(false);
            setEditingParent(null);
          }}
        />
      )}

      {showAssignModal && (
        <AssignStudentModal
          parent={assigningParent}
          onSuccess={() => {
            setShowAssignModal(false);
            setAssigningParent(null);
            loadInitialData();
          }}
          onClose={() => {
            setShowAssignModal(false);
            setAssigningParent(null);
          }}
        />
      )}

      {/* ✅ NUEVO: Modal de Análisis IA */}
      {showAnalysisModal && selectedStudentForAnalysis && (
        <StudentAnalysisModal
          studentId={selectedStudentForAnalysis.id}
          studentName={selectedStudentForAnalysis.name}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedStudentForAnalysis(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
