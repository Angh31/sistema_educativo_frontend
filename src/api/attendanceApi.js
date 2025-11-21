// ====================================
// API DE ASISTENCIA
// ====================================
// Funciones para registro de asistencia (QR, PIN, Manual)

import api from "./axiosConfig";

/**
 * getAttendance
 * =============
 * Obtiene registros de asistencia con filtros
 *
 * @param {Object} params - Filtros opcionales
 * @param {string} params.course_id - Filtrar por curso
 * @param {string} params.date - Filtrar por fecha (YYYY-MM-DD)
 * @returns {Promise<Array>} Lista de registros
 *
 * Requiere: Token de Admin o Teacher
 */
export const getAttendance = async (params = {}) => {
  const res = await api.get("/attendance", { params });
  return res.data;
};

/**
 * getAttendanceByStudent
 * ======================
 * Obtiene el historial de asistencia de un estudiante
 *
 * @param {string} studentId - UUID del estudiante
 * @returns {Promise<Array>} Historial de asistencia
 */
export const getAttendanceByStudent = async (studentId) => {
  const res = await api.get(`/attendance/student/${studentId}`);
  return res.data;
};

/**
 * getAttendanceStats
 * ==================
 * Obtiene estadísticas de asistencia de un estudiante
 *
 * @param {string} studentId - UUID del estudiante
 * @returns {Promise<Object>} Estadísticas (total, presentes, ausentes, %, etc.)
 */
export const getAttendanceStats = async (studentId) => {
  const res = await api.get(`/attendance/stats/${studentId}`);
  return res.data;
};

/**
 * recordManualAttendance
 * ======================
 * Registra asistencia manualmente (docente)
 *
 * @param {Object} data - Datos de asistencia
 * @param {string} data.student_id - UUID del estudiante
 * @param {string} data.course_id - UUID del curso
 * @param {string} data.date - Fecha (YYYY-MM-DD)
 * @param {string} data.status - Estado (PRESENT, ABSENT, LATE, EXCUSED)
 * @returns {Promise<Object>} Registro creado
 *
 * Requiere: Token de Teacher o Admin
 */
export const recordManualAttendance = async (data) => {
  const res = await api.post("/attendance/manual", data);
  return res.data;
};

/**
 * recordQRAttendance
 * ==================
 * Registra asistencia escaneando código QR
 *
 * @param {Object} data - Datos de asistencia
 * @param {string} data.qr_code - Código QR del estudiante
 * @param {string} data.course_id - UUID del curso
 * @returns {Promise<Object>} Registro creado
 *
 * Uso: Estudiante escanea su QR al entrar a clase
 * No requiere token (público pero validado)
 */
export const recordQRAttendance = async (data) => {
  const res = await api.post("/attendance/qr", data);
  return res.data;
};

/**
 * recordPINAttendance
 * ===================
 * Registra asistencia ingresando PIN
 *
 * @param {Object} data - Datos de asistencia
 * @param {string} data.pin_code - PIN del estudiante (6 dígitos)
 * @param {string} data.course_id - UUID del curso
 * @returns {Promise<Object>} Registro creado
 *
 * Uso: Estudiante ingresa su PIN si no tiene QR
 * No requiere token (público pero validado)
 */
export const recordPINAttendance = async (data) => {
  const res = await api.post("/attendance/pin", data);
  return res.data;
};

/**
 * bulkAttendance
 * ==============
 * Registra asistencia de múltiples estudiantes
 *
 * @param {Object} data - Datos de asistencia masiva
 * @param {string} data.course_id - UUID del curso
 * @param {string} data.date - Fecha
 * @param {Array} data.attendanceList - Lista de estudiantes con su status
 * @returns {Promise<Object>} Registros creados
 *
 * Ejemplo attendanceList:
 * [
 *   { student_id: "uuid1", status: "PRESENT" },
 *   { student_id: "uuid2", status: "ABSENT" }
 * ]
 *
 * Requiere: Token de Teacher o Admin
 */
export const bulkAttendance = async (data) => {
  const res = await api.post("/attendance/bulk", data);
  return res.data;
};
