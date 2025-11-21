// ====================================
// API DE ESTUDIANTES
// ====================================
// Funciones CRUD para gestión de estudiantes

import api from "./axiosConfig";

/**
 * getStudents
 * ===========
 * Obtiene la lista de estudiantes con paginación y búsqueda
 *
 * @param {Object} params - Parámetros de query
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Límite por página
 * @param {string} params.search - Término de búsqueda
 * @returns {Promise<Object>} Estudiantes y paginación
 */
export const getStudents = async (params = {}) => {
  const res = await api.get("/students", { params });
  return res.data;
};

/**
 * getStudentById
 * ==============
 * Obtiene un estudiante específico por ID
 *
 * @param {string} id - UUID del estudiante
 * @returns {Promise<Object>} Datos completos del estudiante
 *
 * Incluye:
 * - Datos básicos
 * - Cursos inscritos
 * - Calificaciones
 * - Asistencia
 */
export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

/**
 * updateStudent
 * =============
 * Actualiza los datos de un estudiante
 *
 * @param {string} id - UUID del estudiante
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Estudiante actualizado
 *
 * Requiere: Token de Admin
 */
export const updateStudent = async (id, data) => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};

/**
 * deleteStudent
 * =============
 * Elimina un estudiante del sistema
 *
 * @param {string} id - UUID del estudiante
 * @returns {Promise<Object>} Mensaje de confirmación
 *
 * Advertencia: Operación irreversible
 * Requiere: Token de Admin
 */
export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

/**
 * getStudentCredentials
 * =====================
 * Obtiene el QR y PIN del estudiante
 *
 * @param {string} id - UUID del estudiante
 * @returns {Promise<Object>} QR code y PIN
 *
 * Uso: Para que el estudiante registre asistencia
 */
export const getStudentCredentials = async (id) => {
  const res = await api.get(`/students/${id}/credentials`);
  return res.data;
};
