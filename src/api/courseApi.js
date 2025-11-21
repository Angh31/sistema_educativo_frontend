// ====================================
// API DE CURSOS
// ====================================
// Funciones CRUD para gestión de cursos

import api from "./axiosConfig";

/**
 * getCourses
 * ==========
 * Obtiene todos los cursos con paginación y búsqueda
 *
 * @param {Object} params - Parámetros de query
 * @returns {Promise<Object>} Cursos y paginación
 */
export const getCourses = async (params = {}) => {
  const res = await api.get("/courses", { params });
  return res.data;
};

/**
 * getCourseById
 * =============
 * Obtiene un curso específico por ID
 *
 * @param {string} id - UUID del curso
 * @returns {Promise<Object>} Datos completos del curso
 *
 * Incluye:
 * - Información del curso
 * - Docente asignado
 * - Horarios
 * - Estudiantes inscritos
 */
export const getCourseById = async (id) => {
  const res = await api.get(`/courses/${id}`);
  return res.data;
};

/**
 * createCourse
 * ============
 * Crea un nuevo curso
 *
 * @param {Object} courseData - Datos del curso
 * @param {string} courseData.name - Nombre del curso
 * @param {string} courseData.description - Descripción
 * @param {string} courseData.teacher_id - UUID del docente
 * @param {number} courseData.grade_level - Nivel del grado
 * @returns {Promise<Object>} Curso creado
 *
 * Requiere: Token de Admin
 */
export const createCourse = async (courseData) => {
  const res = await api.post("/courses", courseData);
  return res.data;
};

/**
 * updateCourse
 * ============
 * Actualiza un curso existente
 *
 * @param {string} id - UUID del curso
 * @param {Object} courseData - Datos a actualizar
 * @returns {Promise<Object>} Curso actualizado
 *
 * Requiere: Token de Admin
 */
export const updateCourse = async (id, courseData) => {
  const res = await api.put(`/courses/${id}`, courseData);
  return res.data;
};

/**
 * deleteCourse
 * ============
 * Elimina un curso
 *
 * @param {string} id - UUID del curso
 * @returns {Promise<Object>} Mensaje de confirmación
 *
 * Advertencia: También elimina inscripciones, calificaciones y asistencia
 * Requiere: Token de Admin
 */
export const deleteCourse = async (id) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};
