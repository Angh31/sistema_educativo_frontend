// ====================================
// API DE CALIFICACIONES
// ====================================
// Funciones para gestión de calificaciones

import api from "./axiosConfig";

/**
 * getGrades
 * =========
 * Obtiene calificaciones con filtros
 *
 * @param {Object} params - Filtros opcionales
 * @param {string} params.course_id - Filtrar por curso
 * @param {string} params.student_id - Filtrar por estudiante
 * @param {string} params.period - Filtrar por periodo
 * @returns {Promise<Array>} Lista de calificaciones
 *
 * Requiere: Token de Admin o Teacher
 */
export const getGrades = async (params = {}) => {
  const res = await api.get("/grades", { params });
  return res.data;
};

/**
 * getGradesByStudent
 * ==================
 * Obtiene todas las calificaciones de un estudiante
 *
 * @param {string} studentId - UUID del estudiante
 * @returns {Promise<Array>} Calificaciones del estudiante
 */
export const getGradesByStudent = async (studentId) => {
  const res = await api.get(`/grades/student/${studentId}`);
  return res.data;
};

/**
 * getGradesByCourse
 * =================
 * Obtiene calificaciones de un curso
 *
 * @param {string} courseId - UUID del curso
 * @param {Object} params - Filtros opcionales
 * @param {string} params.period - Filtrar por periodo
 * @returns {Promise<Array>} Calificaciones del curso
 *
 * Requiere: Token de Admin o Teacher
 */
export const getGradesByCourse = async (courseId, params = {}) => {
  const res = await api.get(`/grades/course/${courseId}`, { params });
  return res.data;
};

/**
 * getStudentAverage
 * =================
 * Calcula el promedio de un estudiante
 *
 * @param {string} studentId - UUID del estudiante
 * @param {Object} params - Filtros opcionales
 * @param {string} params.period - Calcular solo de un periodo
 * @returns {Promise<Object>} Promedio y detalles
 */
export const getStudentAverage = async (studentId, params = {}) => {
  const res = await api.get(`/grades/average/student/${studentId}`, { params });
  return res.data;
};

/**
 * getCourseAverage
 * ================
 * Calcula estadísticas de un curso
 *
 * @param {string} courseId - UUID del curso
 * @param {Object} params - Filtros opcionales
 * @param {string} params.period - Calcular solo de un periodo
 * @returns {Promise<Object>} Promedio, aprobados, reprobados, etc.
 *
 * Requiere: Token de Admin o Teacher
 */
export const getCourseAverage = async (courseId, params = {}) => {
  const res = await api.get(`/grades/average/course/${courseId}`, { params });
  return res.data;
};

/**
 * getGradeReport
 * ==============
 * Genera boleta de calificaciones
 *
 * @param {string} studentId - UUID del estudiante
 * @param {Object} params - Filtros opcionales
 * @param {string} params.period - Generar boleta de un periodo específico
 * @returns {Promise<Object>} Boleta completa con resumen
 */
export const getGradeReport = async (studentId, params = {}) => {
  const res = await api.get(`/grades/report/${studentId}`, { params });
  return res.data;
};

/**
 * createGrade
 * ===========
 * Crea o actualiza una calificación
 *
 * @param {Object} gradeData - Datos de la calificación
 * @param {string} gradeData.student_id - UUID del estudiante
 * @param {string} gradeData.course_id - UUID del curso
 * @param {number} gradeData.grade - Calificación (0-100)
 * @param {string} gradeData.period - Periodo académico
 * @param {string} gradeData.comment - Comentario opcional
 * @returns {Promise<Object>} Calificación creada/actualizada
 *
 * Requiere: Token de Teacher o Admin
 */
export const createGrade = async (gradeData) => {
  const res = await api.post("/grades", gradeData);
  return res.data;
};

/**
 * updateGrade
 * ===========
 * Actualiza una calificación existente
 *
 * @param {string} id - UUID de la calificación
 * @param {Object} gradeData - Datos a actualizar
 * @returns {Promise<Object>} Calificación actualizada
 *
 * Requiere: Token de Teacher o Admin
 */
export const updateGrade = async (id, gradeData) => {
  const res = await api.put(`/grades/${id}`, gradeData);
  return res.data;
};

/**
 * deleteGrade
 * ===========
 * Elimina una calificación
 *
 * @param {string} id - UUID de la calificación
 * @returns {Promise<Object>} Mensaje de confirmación
 *
 * Requiere: Token de Admin
 */
export const deleteGrade = async (id) => {
  const res = await api.delete(`/grades/${id}`);
  return res.data;
};

/**
 * bulkGrades
 * ==========
 * Crea o actualiza calificaciones masivas
 *
 * @param {Object} data - Datos masivos
 * @param {string} data.course_id - UUID del curso
 * @param {string} data.period - Periodo académico
 * @param {Array} data.grades - Lista de calificaciones
 * @returns {Promise<Object>} Calificaciones procesadas
 *
 * Ejemplo grades:
 * [
 *   { student_id: "uuid1", grade: 85, comment: "Excelente" },
 *   { student_id: "uuid2", grade: 75, comment: "Bueno" }
 * ]
 *
 * Requiere: Token de Teacher o Admin
 */
export const bulkGrades = async (data) => {
  const res = await api.post("/grades/bulk", data);
  return res.data;
};

/**
 * createGrade
 * ===========
 * Crea o actualiza una calificación
 *
 * @param {Object} gradeData - Datos de la calificación
 * @returns {Promise<Object>} Calificación creada
 */
