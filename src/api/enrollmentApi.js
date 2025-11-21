// ====================================
// API DE INSCRIPCIONES
// ====================================
// Funciones para gestión de inscripciones de estudiantes en cursos

import api from "./axiosConfig";

/**
 * getEnrollments
 * ==============
 * Obtiene todas las inscripciones con filtros opcionales
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Límite de resultados
 * @param {string} params.course_id - Filtrar por curso
 * @param {string} params.student_id - Filtrar por estudiante
 */
export const getEnrollments = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await api.get(`/enrollments?${queryString}`);
  return res.data;
};

/**
 * getEnrollmentsByCourse
 * ======================
 * Obtiene todas las inscripciones de un curso específico
 * @param {string} courseId - ID del curso
 */
export const getEnrollmentsByCourse = async (courseId) => {
  const res = await api.get(`/enrollments/course/${courseId}`);
  return res.data;
};

/**
 * getEnrollmentsByStudent
 * =======================
 * Obtiene todas las inscripciones de un estudiante
 * @param {string} studentId - ID del estudiante
 */
export const getEnrollmentsByStudent = async (studentId) => {
  const res = await api.get(`/enrollments/student/${studentId}`);
  return res.data;
};

/**
 * createEnrollment
 * ================
 * Inscribe un estudiante en un curso
 * @param {Object} data - Datos de inscripción
 * @param {string} data.student_id - ID del estudiante
 * @param {string} data.course_id - ID del curso
 */
export const createEnrollment = async (data) => {
  const res = await api.post("/enrollments", data);
  return res.data;
};

/**
 * bulkEnrollment
 * ==============
 * Inscribe múltiples estudiantes en un curso
 * @param {Object} data - Datos de inscripción masiva
 * @param {string} data.course_id - ID del curso
 * @param {Array<string>} data.student_ids - Array de IDs de estudiantes
 */
export const bulkEnrollment = async (data) => {
  const res = await api.post("/enrollments/bulk", data);
  return res.data;
};

/**
 * deleteEnrollment
 * ================
 * Elimina una inscripción (desinscribe estudiante)
 * @param {string} enrollmentId - ID de la inscripción
 */
export const deleteEnrollment = async (enrollmentId) => {
  const res = await api.delete(`/enrollments/${enrollmentId}`);
  return res.data;
};

/**
 * getAvailableStudentsForCourse
 * ==============================
 * Obtiene estudiantes que NO están inscritos en un curso
 * @param {string} courseId - ID del curso
 */
export const getAvailableStudentsForCourse = async (courseId) => {
  const res = await api.get(`/enrollments/available-students/${courseId}`);
  return res.data;
};
