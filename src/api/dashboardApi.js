// ====================================
// API DE DASHBOARDS
// ====================================
// Funciones para obtener estadísticas y datos consolidados

import api from "./axiosConfig";

/**
 * getAdminDashboard
 * =================
 * Obtiene estadísticas generales del sistema
 *
 * @returns {Promise<Object>} Dashboard completo del admin
 *
 * Incluye:
 * - Totales (estudiantes, docentes, cursos, padres)
 * - Asistencia del día
 * - Cursos más populares
 * - Promedio general
 *
 * Requiere: Token de Admin
 */
export const getAdminDashboard = async () => {
  const res = await api.get("/dashboard/admin");
  return res.data;
};

/**
 * getTeacherDashboard
 * ===================
 * Obtiene dashboard personalizado del docente
 *
 * @param {string} teacherId - UUID del docente
 * @returns {Promise<Object>} Dashboard del docente
 *
 * Incluye:
 * - Total de cursos que imparte
 * - Total de estudiantes
 * - Asistencia registrada hoy
 * - Resumen por curso
 *
 * Requiere: Token de Teacher
 */
export const getTeacherDashboard = async (teacherId) => {
  const res = await api.get("/dashboard/teacher"); // ✅
  return res.data;
};

/**
 * getStudentDashboard
 * ===================
 * Obtiene dashboard personalizado del estudiante
 *
 * @param {string} studentId - UUID del estudiante
 * @returns {Promise<Object>} Dashboard del estudiante
 *
 * Incluye:
 * - Datos del estudiante (QR, PIN)
 * - Cursos inscritos
 * - Promedio general
 * - Porcentaje de asistencia
 * - Últimas calificaciones
 * - Últimas asistencias
 *
 * Requiere: Token (Student o Parent)
 */
export const getStudentDashboard = async (studentId) => {
  const res = await api.get("/dashboard/student");
  return res.data;
};
